import Konva from "konva";

import { RenderEngine } from "./RenderingPrimitives/RenderEngine";
import { ResponseType } from "./WorkerPrimitives/SharedWorkerBase";

import { uiAccess, uiEvents } from "~/signals";

import { SceneManager } from "./SceneManager";
import {
  NodesManager,
  NodeIsolator,
  NodeTransformer,
  NodesTranslationEventDetails,
  NodeTransformationEventDetails,
  SelectionManager,
  SelectionManagerEvents,
  SelectorSquare,
} from "./NodesManagers";
import { ImageNode, VideoNode, TextNode } from "./Nodes";
import {
  EngineOptions,
  MediaNode,
  Position,
  TextNodeData,
  Transformation,
} from "./types";

import {
  CreateCommand,
  DeleteCommand,
  LockNodesCommand,
  MoveLayerDown,
  MoveLayerUp,
  TransformCommand,
  TranslateCommand,
  UndoStackManager,
  UnlockNodesCommand,
} from "./UndoRedo";

import { SharedWorkerResponse } from "./WorkerPrimitives/SharedWorkerBase";
import {
  DiffusionSharedWorkerProgressData,
  DiffusionSharedWorkerResponseData,
} from "./SharedWorkers/Diffusion/DiffusionSharedWorker";

import { AppModes, VideoResolutions } from "./constants";
import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";

import { ToolbarNodeButtonNames } from "~/components/features/ToolbarNode/enums";
import { NavigateFunction } from "react-router-dom";

// for testing loading files from system
// import { FileUtilities } from "./FileUtilities/FileUtilities";

export interface RenderingOptions {
  artstyle: string;
  positivePrompt: string;
  negativePrompt: string;
  cinematic: boolean;
  enginePreProcessing: boolean;
  faceDetail: boolean;
  lipSync: boolean;
  upscale: boolean;
  styleStrength: number;
}

export class Engine {
  private navigateRef: NavigateFunction;
  private appMode: AppModes;
  private canvasReference: HTMLDivElement;
  private stage: Konva.Stage;
  private bgLayer: Konva.Layer;
  private mediaLayer: Konva.Layer;
  private nodeIsolationLayer: Konva.Layer;
  private uiLayer: Konva.Layer;
  private renderEngine: RenderEngine;
  private offScreenCanvas: OffscreenCanvas;

  private nodesManager: NodesManager;
  private nodeIsolator: NodeIsolator;
  private nodeTransformer: NodeTransformer;
  private selectionManager: SelectionManager;
  private selectorSquare: SelectorSquare;

  private sceneManager: SceneManager;
  private undoStackManager: UndoStackManager;

  public segmentationButtonCanBePressed: boolean = true;
  // signal reference
  constructor(canvasReference: HTMLDivElement, options: EngineOptions) {
    if (import.meta.env.DEV) {
      console.log("Engine Created");
    }
    this.navigateRef = options.navigate;
    this.appMode = AppModes.SELECT;

    this.canvasReference = canvasReference;
    this.stage = new Konva.Stage({
      container: this.canvasReference,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.bgLayer = new Konva.Layer();
    this.mediaLayer = new Konva.Layer();
    this.nodeIsolationLayer = new Konva.Layer();
    this.uiLayer = new Konva.Layer();
    this.stage.add(this.bgLayer);
    this.stage.add(this.mediaLayer);
    this.stage.add(this.nodeIsolationLayer);
    this.stage.add(this.uiLayer);

    // Konva Transformer
    this.nodeTransformer = new NodeTransformer();
    this.uiLayer.add(this.nodeTransformer.getKonvaNode());
    // Selector Square
    this.selectorSquare = new SelectorSquare();
    this.uiLayer.add(this.selectorSquare.getKonvaNode());
    // Node Isolator
    this.nodeIsolator = new NodeIsolator({
      mediaLayerRef: this.mediaLayer,
      nodeIsolationLayerRef: this.nodeIsolationLayer,
    });

    // Collection of commands for undo-redo
    this.undoStackManager = new UndoStackManager();

    // Listen to changes in container size
    const resizeObserver = new ResizeObserver(() => {
      this.applyChanges();
    });

    resizeObserver.observe(this.canvasReference);
    this.applyChanges();

    // core layer for all the work done.

    this.offScreenCanvas = new OffscreenCanvas(0, 0);

    this.renderEngine = new RenderEngine({
      width: VideoResolutions.VERTICAL_720.width,
      height: VideoResolutions.VERTICAL_720.height,
      mediaLayerRef: this.mediaLayer,
      bgLayerRef: this.bgLayer,
      offScreenCanvas: this.offScreenCanvas,
      onRenderingSystemMessageRecieved:
        this.onRenderingSystemReceived.bind(this),
    });

    // Collection of all Nodes
    this.nodesManager = new NodesManager();
    // Partial Collection of selected Nodes
    this.selectionManager = new SelectionManager({
      nodeTransformerRef: this.nodeTransformer,
      mediaLayerRef: this.mediaLayer,
    });

    // set up secene manager
    this.sceneManager = new SceneManager({
      navigateRef: this.navigateRef,
      mediaLayerRef: this.mediaLayer,
      nodesManagerRef: this.nodesManager,
      selectionManagerRef: this.selectionManager,
      renderEngineRef: this.renderEngine,
    });

    // some of the managers has events
    // hence, lastly, setup these events
    this.setupEventSystem();
  }

  // TODO write code to show error and retry.

  onRenderingSystemReceived(
    response: SharedWorkerResponse<
      DiffusionSharedWorkerResponseData,
      DiffusionSharedWorkerProgressData
    >,
  ) {
    // Test URL to quickly test the code.
    // show the loader.
    // const response = {
    //   data: {
    //     status: "complete_success",
    //     videoUrl:
    //       "/media/j/3/c/v/j/j3cvjjdstr4fqs477d3ech8rp2c9skpy/storyteller_j3cvjjdstr4fqs477d3ech8rp2c9skpy.mp4",
    //     progress: 0.2,
    //   },
    // };
    // if (!this.renderEngine.videoLoadingCanvas) {
    //   console.log("Missing Video Loading Canvas");
    //   return;
    // }

    if (!response.data) {
      // throw error to retry
      uiAccess.dialogError.show({
        title: "Generation Error",
        message: response.data?.toString(),
      });
      uiAccess.toolbarMain.loadingBar.hide();
      return;
    }

    if (response.responseType === ResponseType.error) {
      console.log("Error Data?");
      console.log(response.data);
      uiAccess.dialogError.show({
        title: "Generation Error Try again.",
        message: response.data?.toString(),
      });
      uiAccess.toolbarMain.loadingBar.hide();
      return;
    }

    if (response.responseType === ResponseType.result) {
      const data = response.data as DiffusionSharedWorkerResponseData;
      uiAccess.toolbarMain.loadingBar.hide();
      // create video node here.
      // choose it to be the size of the rendering output, this case its mobile. (1560, 400)
      const media_api_base_url = "https://storage.googleapis.com/";
      const media_url = `${media_api_base_url}vocodes-public${data.videoUrl}`;
      console.log("Engine got stylized video: " + media_url);
      this.addVideo(media_url);
      // hide the loader
      //this.renderEngine.videoLoadingCanvas.kNode.hide();
      uiAccess.toolbarMain.loadingBar.hide();
      return;
    }

    if (response.responseType === ResponseType.progress) {
      const data = response.data as DiffusionSharedWorkerProgressData;
      // TODO wil fix this ?!?! parameter issue
      uiAccess.toolbarMain.loadingBar.show();
      //this.renderEngine.videoLoadingCanvas.kNode.show();
      uiAccess.toolbarMain.loadingBar.updateProgress(data.progress * 100);

      // console.log(response);
      // if (response.data.zipBlob) {
      //   FileUtilities.downloadBlobZip(response.data.zipBlob);
      // }
      return;
    }
  }

  private enableSelectorSquare() {
    this.selectorSquare.enable({
      captureCanvasRef: this.renderEngine.captureCanvas,
      mediaLayerRef: this.mediaLayer,
      nodesManagerRef: this.nodesManager,
      selectionManagerRef: this.selectionManager,
      stageRef: this.stage,
    });
  }
  private disableSelectorSquare() {
    this.selectorSquare.disable({ stageRef: this.stage });
  }
  private setupEventSystem() {
    if (this.appMode === AppModes.SELECT) {
      this.enableSelectorSquare();
      uiAccess.toolbarMain.changeButtonState(ToolbarMainButtonNames.SELECT, {
        active: true,
      });
    }
    this.selectionManager.eventTarget.addEventListener(
      SelectionManagerEvents.NODES_TRANSLATIONS,
      ((event: CustomEvent<NodesTranslationEventDetails>) => {
        //console.log("Event: SelectionManager -> Engine", event);
        this.translateNodes(event.detail);
      }) as EventListener,
    );
    this.selectionManager.eventTarget.addEventListener(
      SelectionManagerEvents.NODES_TRANSFORMATION,
      ((event: CustomEvent<NodeTransformationEventDetails>) => {
        //console.log("Event: SelectionManager -> Engine", event);
        this.transformNodes(event.detail);
      }) as EventListener,
    );
    uiEvents.toolbarNode.lock.onClick(() => {
      this.toggleLockNodes();
    });
    uiEvents.toolbarNode.CRHOMA.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      if (nodes.size > 1) {
        uiAccess.dialogError.show({
          title: "Error: Background Removal",
          message:
            "Please do not select more than 1 item for the Background Removal feature, we can only apply Background Removal to 1 item at a time",
        });
        return;
      }
      const node = nodes.values().next().value;
      try {
        if (node instanceof VideoNode) {
          const nodeChromaProps = node.getChroma();
          uiAccess.dialogChromakey.show({
            isChromakeyEnabled: nodeChromaProps.isChromakeyEnabled,
            chromakeyColor: nodeChromaProps.chromakeyColor,
          });
        }
      } catch {
        uiAccess.dialogError.show({
          title: "Error: Background Removal",
          message: "This item is not compatible is Background Removal",
        });
      }
    });

    uiEvents.toolbarNode.SEGMENTATION.onClick(async (e) => {
      console.log("ENGINE SEGMENTATION CALLBACK", e);
      if (this.segmentationButtonCanBePressed == false) {
        console.log("Debounce");
        return;
      }
      console.log("ENGINE SEGMENTATION Button Clicked ACCEPTED");
      // disable all the buttons except segmentation button again.
      // create a state to prevent it from being clicked again. through the manager. and block.
      const nodes = this.selectionManager.getSelectedNodes();
      if (nodes.size > 1) {
        // display error that segmentation cannot be done on more than 1 at a time.
        uiAccess.dialogError.show({
          title: "Error: Video Extraction",
          message: "Video Extraction cannot be done on more than 1 item",
        });
        this.selectionManager.clearSelection();
      } else {
        // todo create segmentation manager ...
        const element = nodes.values().next().value;
        console.log("ENGINE SEGMENTATION for 1 node", element);
        if (element instanceof VideoNode) {
          const node = element as VideoNode;
          console.log("ENGEINE prepare Segmentation.", node);

          if (!node.isSegmentationMode) {
            console.log("ENGEINE start Segmentation.", node);
            this.segmentationButtonCanBePressed = false;
            this.disableAllButtons();
            this.disableSelectorSquare();
            node.lock();
            this.undoStackManager.setDisabled(true);
            await node.startSegmentation();
            this.nodeIsolator.enterIsolation(node);
            node.videoSegmentationMode(true);
            this.selectionManager.updateContextComponents(node);
            uiAccess.loadingBar.update({
              progress: 0,
              message: "Start Adding Mask Points To the Video",
            });
            uiAccess.loadingBar.show();

            this.segmentationButtonCanBePressed = true;
          } else {
            console.log("ENGEINE Attemping to close Segmentation.");
            const endSessionResult = await node.endSession();
            if (endSessionResult) {
              node.videoSegmentationMode(false);
              this.nodeIsolator.exitIsolation();
              node.seek(1 / node.fps);
              this.undoStackManager.setDisabled(false);
              // TODO : 1 frame is missing from extracted video,
              // need to move 1 frame forward to accomodate
              this.enableAllButtons();
              this.enableSelectorSquare();
              this.segmentationButtonCanBePressed = true;
              node.unlock();
              this.selectionManager.updateContextComponents(node);
              // to close off the session.
            } else {
              console.log("Busy Processing Video.");
            }
          }
        } else {
          uiAccess.dialogError.show({
            title: "Error: Video Extraction",
            message:
              "Extraction is only available for Videos, it is not avaliable for other Assets yet",
          });
          this.selectionManager.clearSelection();
        }
      }
    });
    uiEvents.toolbarNode.DELETE.onClick(() => this.deleteNodes());
    uiEvents.toolbarNode.MOVE_LAYER_DOWN.onClick(() => this.moveNodesDown());
    uiEvents.toolbarNode.MOVE_LAYER_UP.onClick(() => this.moveNodesUp());

    uiEvents.onGetStagedImage((image) => {
      this.addImage(image);
    });

    uiEvents.onGetStagedVideo((video) => {
      console.log("Engine got user video: " + video.url);
      this.addVideo(video.url);
    });
    uiEvents.onAddTextToEngine((textdata) => {
      this.addText(textdata);
    });

    uiEvents.onChromakeyRequest((chromakeyProps) => {
      const node = this.selectionManager
        .getSelectedNodes()
        .values()
        .next().value;
      if (!node) {
        console.log("Node was not returned.");
        return;
      }
      if (node instanceof VideoNode) {
        node.setChroma(chromakeyProps.isChromakeyEnabled);
        node.setChromaColor(
          chromakeyProps.chromakeyColor?.red || 120,
          chromakeyProps.chromakeyColor?.blue || 150,
          chromakeyProps.chromakeyColor?.green || 120,
        );
      }
    });
    uiEvents.aiStylize.onRequest(async (data) => {
      console.log("Engine heard AI Stylize request: ", data);

      try {
        await this.renderEngine.startProcessing(data);
      } catch (error) {
        // throw error to retry
        uiAccess.dialogError.show({
          title: "Generation Error",
          message: error?.toString() || "Unknown Error",
        });
      }
    });

    uiEvents.toolbarMain.UNDO.onClick(() => this.undoStackManager.undo());
    uiEvents.toolbarMain.REDO.onClick(() => this.undoStackManager.redo());
    uiEvents.toolbarMain.SAVE.onClick(async (/*event*/) => {
      this.sceneManager.saveScene();
    });
  }

  disableAllButtons() {
    const buttonNames = Object.values(ToolbarNodeButtonNames);
    for (const name of buttonNames) {
      uiAccess.toolbarNode.changeButtonState(name, { disabled: true });
    }
  }

  async enableAllButtons() {
    const buttonNames = Object.values(ToolbarNodeButtonNames);
    for (const name of buttonNames) {
      await uiAccess.toolbarNode.changeButtonState(name, { disabled: false });
    }
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private applyChanges() {
    if (this.renderEngine) {
      // won't update the first time.
      this.renderEngine.updateCaptureCanvas(undefined, undefined);
    }

    this.stage.width(this.canvasReference.offsetWidth);
    this.stage.height(this.canvasReference.offsetHeight);
    this.stage.draw(); // Redraw the canvas
  }

  // Sandbox is quickly a way to test your idea.
  public async sandbox() {}

  public onMessage(event: MessageEvent) {
    console.log("Message From Shared Worker");
    console.log(event);
  }

  public initializeStage(sceneToken?: string) {
    // load canvas that was originaly saved TODO Save manager for resharing.
    uiAccess.toolbarNode.hide();
    uiAccess.loadingBar.hide();
    // load the scene if there's a scenetoken
    if (sceneToken) {
      this.sceneManager.loadScene(sceneToken);
    }
    this.setupStage();
    // this.populateWithDebugItems();
  }
  public isInitialized() {
    return this.stage !== null;
  }

  public async setupStage() {
    var textNode = new Konva.Text({
      x: 0,
      y: 0,
      text: "",
      fontSize: 32,
      fontFamily: "Calibri",
      fill: "black",
    });

    var anim = new Konva.Animation((frame) => {
      if (frame) {
        if (import.meta.env.DEV) {
          const timeDiff = frame.timeDiff;
          const frameRate = frame.frameRate;
          textNode.setText(
            `FrameTime:${timeDiff.toFixed(0)} ms\nFrameRate:${frameRate.toFixed(0)} fps`,
          );
        }
      }
    }, this.mediaLayer);
    anim.start();

    this.uiLayer.add(textNode);

    this.addKeyboardShortcuts();
  }

  public addText(textNodeData: TextNodeData) {
    const textNode = new TextNode({
      textNodeData: textNodeData,
      mediaLayerRef: this.mediaLayer,
      selectionManagerRef: this.selectionManager,
      canvasPosition: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
    });
    this.createNode(textNode);
  }

  public addImage(imageFile: File) {
    const imageNode = new ImageNode({
      mediaLayerRef: this.mediaLayer,
      canvasPosition: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      imageFile: imageFile,
      selectionManagerRef: this.selectionManager,
    });

    this.createNode(imageNode);
    this.renderEngine.addNodes(imageNode);
  }

  public addVideo(url: string) {
    const videoNode = new VideoNode({
      mediaLayerRef: this.mediaLayer,
      canvasPosition: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      videoURL: url,
      selectionManagerRef: this.selectionManager,
    });
    this.createNode(videoNode);
  }

  // Events for Undo and Redo
  private addKeyboardShortcuts() {
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "z") {
        this.undoStackManager.undo();
      } else if (
        (event.ctrlKey && event.key === "y") ||
        (event.ctrlKey && event.shiftKey && event.key === "Z")
      ) {
        this.undoStackManager.redo();
      } else if (event.key === "Delete") {
        this.deleteNodes();
      }
    });
  }

  createNode(node: VideoNode | ImageNode | TextNode) {
    const command = new CreateCommand({
      nodes: new Set<MediaNode>([node]),
      mediaLayerRef: this.mediaLayer,
      nodesManagerRef: this.nodesManager,
      nodeTransformerRef: this.nodeTransformer,
      selectionManagerRef: this.selectionManager,
      renderEngineRef: this.renderEngine,
    });
    this.undoStackManager.executeCommand(command);
  }
  deleteNodes() {
    const nodes = this.selectionManager.getSelectedNodes();
    const command = new DeleteCommand({
      nodes: nodes,
      mediaLayerRef: this.mediaLayer,
      nodesManagerRef: this.nodesManager,
      nodeTransformerRef: this.nodeTransformer,
      selectionManagerRef: this.selectionManager,
      renderEngineRef: this.renderEngine,
    });
    this.undoStackManager.executeCommand(command);
  }
  toggleLockNodes() {
    const nodes = this.selectionManager.getSelectedNodes();
    const node = nodes.values().next().value;
    if (!node) {
      console.log("Node Not Found for Locking");
      return;
    }
    if (node.isLocked()) {
      const command = new UnlockNodesCommand({
        nodes: this.selectionManager.getSelectedNodes(),
      });
      this.undoStackManager.executeCommand(command);
    } else {
      const command = new LockNodesCommand({
        nodes: this.selectionManager.getSelectedNodes(),
      });
      this.undoStackManager.executeCommand(command);
    }
  }
  moveNodesUp() {
    const command = new MoveLayerUp({
      nodes: this.selectionManager.getSelectedNodes(),
      nodesManagerRef: this.nodesManager,
      mediaLayerRef: this.mediaLayer,
    });
    this.undoStackManager.executeCommand(command);
  }
  moveNodesDown() {
    const command = new MoveLayerDown({
      nodes: this.selectionManager.getSelectedNodes(),
      nodesManagerRef: this.nodesManager,
      mediaLayerRef: this.mediaLayer,
    });
    this.undoStackManager.executeCommand(command);
  }
  translateNodes(props: {
    nodes: Set<MediaNode>;
    initialPositions: Map<MediaNode, Position>;
    finalPositions: Map<MediaNode, Position>;
  }) {
    const command = new TranslateCommand({
      ...props,
      layerRef: this.mediaLayer,
    });
    this.undoStackManager.pushCommand(command);
  }
  transformNodes(props: {
    nodes: Set<MediaNode>;
    initialTransformations: Map<MediaNode, Transformation[]>;
    finalTransformations: Map<MediaNode, Transformation[]>;
  }) {
    const command = new TransformCommand({
      ...props,
      layerRef: this.mediaLayer,
    });
    this.undoStackManager.pushCommand(command);
  }
}
