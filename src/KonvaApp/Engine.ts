import Konva from "konva";

import { RenderEngine } from "./RenderingPrimitives/RenderEngine";
import { ResponseType } from "./WorkerPrimitives/SharedWorkerBase";

import { uiAccess } from "~/signals";
import { uiEvents } from "~/signals";
// import { toolbarNode } from "~/signals/uiAccess/toolbarNode";

import {
  NodesManager,
  NodeTransformer,
  NodesTranslationEventDetails,
  SelectionManager,
  SelectionManagerEvents,
  SelectorSquare,
} from "./NodesManagers";
import { ImageNode } from "./Nodes/ImageNode";
import { VideoNode } from "./Nodes/VideoNode";
import { MediaNode, Position } from "./types";

import {
  CreateCommand,
  DeleteCommand,
  MoveLayerDown,
  MoveLayerUp,
  RotateCommand,
  ScaleCommand,
  TranslateCommand,
  UndoStackManager,
} from "./UndoRedo";

import { SharedWorkerResponse } from "./WorkerPrimitives/SharedWorkerBase";
import {
  DiffusionSharedWorkerProgressData,
  DiffusionSharedWorkerResponseData,
} from "./SharedWorkers/Diffusion/DiffusionSharedWorker";
import { FileUtilities } from "./FileUtilities/FileUtilities";

import { AppModes, VideoResolutions } from "./constants";
import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";

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
  private appMode: AppModes;
  private canvasReference: HTMLDivElement;
  private stage: Konva.Stage;
  private bgLayer: Konva.Layer;
  private mediaLayer: Konva.Layer;
  private uiLayer: Konva.Layer;
  private renderEngine: RenderEngine;
  private offScreenCanvas: OffscreenCanvas;

  private nodesManager: NodesManager;
  private nodeTransformer: NodeTransformer;
  private selectionManager: SelectionManager;
  private selectorSquare: SelectorSquare;

  private undoStackManager: UndoStackManager;

  // signal reference
  constructor(canvasReference: HTMLDivElement) {
    if (import.meta.env.DEV) {
      console.log("Engine Created");
    }

    this.appMode = AppModes.SELECT;

    this.canvasReference = canvasReference;
    this.stage = new Konva.Stage({
      container: this.canvasReference,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.bgLayer = new Konva.Layer();
    this.mediaLayer = new Konva.Layer();
    this.uiLayer = new Konva.Layer();
    this.stage.add(this.bgLayer);
    this.stage.add(this.mediaLayer);
    this.stage.add(this.uiLayer);

    // Collection of all Nodes
    this.nodesManager = new NodesManager();
    // Partial Collection of selected Nodes
    this.selectionManager = new SelectionManager();
    // Collection of commands for undo-redo
    this.undoStackManager = new UndoStackManager();

    // Konva Transformer
    this.nodeTransformer = new NodeTransformer();
    this.uiLayer.add(this.nodeTransformer.getKonvaNode());
    // Selector Square
    this.selectorSquare = new SelectorSquare();
    this.uiLayer.add(this.selectorSquare.getKonvaNode());

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

    if (response.responseType === ResponseType.result) {
      const data = response.data as DiffusionSharedWorkerResponseData;
      uiAccess.toolbarMain.loadingBar.hide();
      // create video node here.
      // choose it to be the size of the rendering output, this case its mobile. (1560, 400)
      const media_api_base_url = "https://storage.googleapis.com/";
      const media_url = `${media_api_base_url}vocodes-public${data.videoUrl}`;

      const videoNode = new VideoNode({
        mediaLayer: this.mediaLayer,
        position: this.renderEngine.captureCanvas.position(),
        canvasSize: this.renderEngine.captureCanvas.size(),
        videoURL: media_url,
        selectionManagerRef: this.selectionManager,
        nodeTransformerRef: this.nodeTransformer,
      });
      this.renderEngine.addNodes(videoNode);
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

  private setupEventSystem() {
    if (this.appMode === AppModes.SELECT) {
      this.selectorSquare.enable({
        captureCanvasRef: this.renderEngine.captureCanvas,
        nodesManagerRef: this.nodesManager,
        nodeTransformerRef: this.nodeTransformer,
        selectionManagerRef: this.selectionManager,
        stage: this.stage,
      });
      uiAccess.toolbarMain.changeButtonState(ToolbarMainButtonNames.SELECT, {
        active: true,
      });
    }
    this.selectionManager.eventTarget.addEventListener(
      SelectionManagerEvents.NODES_TRANSLATIONS,
      ((event: CustomEvent<NodesTranslationEventDetails>) => {
        console.log(event);
        this.translateNodes(event.detail);
      }) as EventListener,
    );
    uiEvents.toolbarNode.lock.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      nodes.forEach((node) => {
        node.toggleLock();
      });
      // this.nodeTransformer.enable({ selectedNodes: nodes });
    });
    uiEvents.toolbarNode.CRHOMA.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      if (nodes.size > 1) {
        uiAccess.dialogError.show({
          title: "Error: Chroma Key",
          message:
            "Please do not select more than 1 item for the Chroma Key feature, we can only apply Chroma Key to 1 item at a time",
        });
        return;
      }
      const node = nodes.values().next().value;
      try {
        const nodeChromaProps = node.getChroma();
        uiAccess.dialogChromakey.show({
          isChromakeyEnabled: nodeChromaProps.isChromakeyEnabled,
          chromakeyColor: nodeChromaProps.chromakeyColor,
        });
      } catch {
        uiAccess.dialogError.show({
          title: "Error: Chroma Key",
          message: "This Node is not compatible is Chroma Key",
        });
      }
    });
    uiEvents.toolbarNode.DELETE.onClick(() => {
      this.deleteNodes();
    });

    uiEvents.toolbarNode.MOVE_LAYER_DOWN.onClick(() => {
      this.moveNodesDown();
    });

    uiEvents.toolbarNode.MOVE_LAYER_UP.onClick(() => {
      this.moveNodesUp();
    });

    uiEvents.onGetStagedImage((image) => {
      this.addImage(image);
    });

    uiEvents.onGetStagedVideo((video) => {
      console.log("Engine got video: " + video.url);
      this.addVideo(video.url);
    });
    uiEvents.onChromakeyRequest((chromakeyProps) => {
      const node = this.selectionManager
        .getSelectedNodes()
        .values()
        .next().value;
      node.setChroma(chromakeyProps.isChromakeyEnabled);
      node.setChromaColor(
        chromakeyProps.chromakeyColor?.red || 120,
        chromakeyProps.chromakeyColor?.blue || 150,
        chromakeyProps.chromakeyColor?.green || 120,
      );
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

    uiEvents.toolbarMain.UNDO.onClick(() => {
      this.undoStackManager.undo();
    });
    uiEvents.toolbarMain.REDO.onClick(() => {
      this.undoStackManager.redo();
    });
    uiEvents.toolbarMain.SAVE.onClick(async (event) => {
      //this.onRenderingSystemReceived(undefined);
    });
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

  public initializeStage(sceneToken: string) {
    // load canvas that was originaly saved TODO Save manager for resharing.
    uiAccess.toolbarNode.hide();
    uiAccess.loadingBar.hide();

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

    this.mediaLayer.add(textNode);

    this.addKeyboardShortcuts();
  }

  public addImage(imageFile: File) {
    const imageNode = new ImageNode({
      mediaLayer: this.mediaLayer,
      position: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      imageFile: imageFile,
      selectionManagerRef: this.selectionManager,
      nodeTransformerRef: this.nodeTransformer,
    });
    this.createNode(imageNode);
  }

  public addVideo(url: string) {
    const videoNode = new VideoNode({
      mediaLayer: this.mediaLayer,
      position: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      videoURL: url,
      selectionManagerRef: this.selectionManager,
      nodeTransformerRef: this.nodeTransformer,
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

  translateNodes(props: {
    nodes: Set<MediaNode>;
    initialPositions: Map<MediaNode, Position>;
    finalPositions: Map<MediaNode, Position>;
  }) {
    const command = new TranslateCommand({
      ...props,
      layerRef: this.mediaLayer,
    });
    this.undoStackManager.executeCommand(command);
  }

  rotateNodes(nodes: Konva.Node[], newRotation: number) {
    const command = new RotateCommand(nodes, newRotation);
    this.undoStackManager.executeCommand(command);
  }

  scaleNodes(nodes: Konva.Node[], newScaleX: number, newScaleY: number) {
    const command = new ScaleCommand(nodes, newScaleX, newScaleY);
    this.undoStackManager.executeCommand(command);
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

  createNode(node: VideoNode | ImageNode) {
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

  /********************************
   *
   * Code for debug and Testing
   *
   ********************************/
  public async populateWithDebugItems() {
    const imageFile = await FileUtilities.createImageFileFromUrl(
      "https://static.miraheze.org/pgrwiki/0/0d/Dialogue-2B-Icon.png",
    );
    const imageNode = new ImageNode({
      mediaLayer: this.mediaLayer,
      position: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      imageFile: imageFile,
      selectionManagerRef: this.selectionManager,
      nodeTransformerRef: this.nodeTransformer,
    });

    // this.renderEngine.addNodes(videoNode3);

    const videoNode4 = new VideoNode({
      mediaLayer: this.mediaLayer,
      position: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      videoURL:
        "https://storage.googleapis.com/vocodes-public/media/0/2/8/1/n/0281nc0f3kgwvxf8eprywtd01r72rfp6/video_0281nc0f3kgwvxf8eprywtd01r72rfp6.mp4",
      selectionManagerRef: this.selectionManager,
      nodeTransformerRef: this.nodeTransformer,
    });
    const imageNode2 = new ImageNode({
      mediaLayer: this.mediaLayer,
      position: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      imageFile: imageFile,
      selectionManagerRef: this.selectionManager,
      nodeTransformerRef: this.nodeTransformer,
    });

    this.renderEngine.addNodes(videoNode4);

    const videoNode5 = new VideoNode({
      mediaLayer: this.mediaLayer,
      position: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      videoURL:
        "https://storage.googleapis.com/vocodes-public/media/0/2/8/1/n/0281nc0f3kgwvxf8eprywtd01r72rfp6/video_0281nc0f3kgwvxf8eprywtd01r72rfp6.mp4",
      selectionManagerRef: this.selectionManager,
      nodeTransformerRef: this.nodeTransformer,
    });

    this.renderEngine.addNodes(videoNode5);
    // Adding nodes here
    const videoNode = new VideoNode({
      mediaLayer: this.mediaLayer,
      position: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      videoURL:
        "https://storage.googleapis.com/vocodes-public/media/r/q/p/r/e/rqpret6mkh18dqwjqwghhdqf15x720s1/storyteller_rqpret6mkh18dqwjqwghhdqf15x720s1.mp4",
      selectionManagerRef: this.selectionManager,
      nodeTransformerRef: this.nodeTransformer,
    });

    // CODE TO TEST RENDER ENGINE
    // Testing render engine
    // this.renderEngine.addNodes(videoNode);
    // await this.renderEngine.startProcessing();
    //videoNode.simulatedLoading();
    // TODO support Text nodes

    // this.renderEngine.addNodes(imageNode2);

    // // TODO if only image take image and just takes snapshots Edge case
    // this.renderEngine.addNodes(imageNode);
  }
}
