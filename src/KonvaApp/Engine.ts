import Konva from "konva";

import { RenderEngine } from "./RenderingPrimitives/RenderEngine";
import { ResponseType } from "./WorkerPrimitives/SharedWorkerBase";

import { uiAccess, uiEvents } from "~/signals";

import { UndoStackManager } from "./UndoRedo";
import { CommandManager } from "./CommandManager";
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
import { EngineOptions, TextNodeData, VideoNodeData } from "./types";

import { SharedWorkerResponse } from "./WorkerPrimitives/SharedWorkerBase";
import {
  DiffusionSharedWorkerProgressData,
  DiffusionSharedWorkerResponseData,
} from "./SharedWorkers/Diffusion/DiffusionSharedWorker";

import { AppModes, VideoResolutions } from "./constants";
import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";

import { ToolbarNodeButtonNames } from "~/components/features/ToolbarNode/enums";
import { NavigateFunction } from "react-router-dom";
import { LoadingVideosProvider } from "./LoadingVideosProvider";

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
  private loadingVideosProvider: LoadingVideosProvider;

  private sceneManager: SceneManager;
  private undoStackManager: UndoStackManager;
  private commandManager: CommandManager;

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
    // Loading Placeholders
    this.loadingVideosProvider = new LoadingVideosProvider();
    // Node Isolator
    this.nodeIsolator = new NodeIsolator({
      mediaLayerRef: this.mediaLayer,
      nodeIsolationLayerRef: this.nodeIsolationLayer,
    });

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

    // Collection of commands for undo-redo
    this.undoStackManager = new UndoStackManager();
    this.commandManager = new CommandManager({
      mediaLayerRef: this.mediaLayer,
      nodesManagerRef: this.nodesManager,
      nodeTransformerRef: this.nodeTransformer,
      selectionManagerRef: this.selectionManager,
      renderEngineRef: this.renderEngine,
      undoStackManagerRef: this.undoStackManager,
    });
    // set up secene manager
    this.sceneManager = new SceneManager({
      navigateRef: this.navigateRef,
      loadingVideosProviderRef: this.loadingVideosProvider,
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
      console.log(response.data, response);
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
      this.addVideo({ mediaFileUrl: media_url });
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
        this.commandManager.translateNodes(event.detail);
      }) as EventListener,
    );
    this.selectionManager.eventTarget.addEventListener(
      SelectionManagerEvents.NODES_TRANSFORMATION,
      ((event: CustomEvent<NodeTransformationEventDetails>) => {
        //console.log("Event: SelectionManager -> Engine", event);
        this.commandManager.transformNodes(event.detail);
      }) as EventListener,
    );
    uiEvents.toolbarNode.lock.onClick(() => {
      this.commandManager.toggleLockNodes();
    });
    uiEvents.toolbarNode.DOWNLOAD.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      if (nodes.size > 1) {
        uiAccess.dialogError.show({
          title: "Error: Download Node Content",
          message:
            "Please do not select more than 1 item for the Download Node Content feature, you can only download 1 item at a time",
        });
        return;
      }
      const node = nodes.values().next().value;
      try {
        if (node instanceof VideoNode && node.currentUrl) {
          function downloadURI(uri: string, name: string) {
            const link = document.createElement("a");
            link.download = name;
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          downloadURI(node.currentUrl, `Download Video Node-${node.kNode.id}`);
        } else {
          throw new Error();
        }
      } catch {
        uiAccess.dialogError.show({
          title: "Error: Download Node Content",
          message: "This item does not have content for download.",
        });
      }
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
        } else {
          throw new Error();
        }
      } catch {
        uiAccess.dialogError.show({
          title: "Error: Background Removal",
          message: "This item is not compatible is Background Removal",
        });
      }
    });

    uiEvents.toolbarNode.SEGMENTATION.onClick(async () => {
      if (this.segmentationButtonCanBePressed == false) {
        console.log("VideoExtraction Button DEBOUNCED ");
        return;
      }
      console.log("VideoExtraction Button Clicked ACCEPTED");

      // Gating for an appropriate selection
      const nodes = this.selectionManager.getSelectedNodes();
      if (nodes.size > 1) {
        // display error that segmentation cannot be done on more than 1 at a time.
        uiAccess.dialogError.show({
          title: "Error: Video Extraction",
          message: "Video Extraction cannot be done on more than 1 item",
        });
        return;
      }
      const element = nodes.values().next().value;
      if (element instanceof VideoNode !== true) {
        uiAccess.dialogError.show({
          title: "Error: Video Extraction",
          message:
            "Extraction is only available for Videos, it is not avaliable for other Assets yet",
        });
        this.selectionManager.clearSelection();
      }
      // Gating done

      console.log("VideoExtraction on node", element);
      const node = element as VideoNode; //cast medianode to videonode
      const prevIsChroma = node.isChroma;
      const prevChromaColor = node.chromaColor;
      if (!node.isSegmentationMode) {
        // when the button is pressed to enter extraction mode
        console.log("ENGEINE prepare Extraction Session.", node);
        // disable most of the UI before we get a session
        this.segmentationButtonCanBePressed = false;
        document.body.style.cursor = "wait";
        this.selectionManager.disable();
        this.disableAllButtons();
        this.disableSelectorSquare();
        node.lock();
        this.undoStackManager.setDisabled(true);
        // if the video has chroma, disable it
        if (prevIsChroma) {
          node.setChroma(false);
        }
        // if the video is already using extraction
        // bring the original video back
        if (node.extractionUrl === node.videoComponent.src) {
          await node.loadVideoFromUrl({
            videoUrl: node.mediaFileUrl,
            hasExistingTransform: true,
          });
        }
        // actually start and wait for session
        await node.startSegmentation();
        this.nodeIsolator.enterIsolation(node);
        node.videoSegmentationMode(true);
        this.selectionManager.updateContextComponents();
        uiAccess.loadingBar.update({
          progress: 0,
          message: "Start Adding Extraction Points To the Video",
        });
        uiAccess.loadingBar.show();

        document.body.style.cursor = "default";
        this.segmentationButtonCanBePressed = true;
      } else {
        // when the button is pressed to exit extraction mode
        console.log("ENGEINE Attemping to close Extraction Session.");
        document.body.style.cursor = "wait";
        const endSessionResult = await node.endSession();
        if (typeof endSessionResult === "string") {
          node.videoSegmentationMode(false);
          this.commandManager.useVideoExtraction({
            videoNode: node,
            extractionUrl: endSessionResult,
            prevIsChroma: prevIsChroma,
            prevChromaColor: prevChromaColor,
          });
          this.nodeIsolator.exitIsolation();

          // unlock the ui
          this.undoStackManager.setDisabled(false);
          this.enableAllButtons();
          this.enableSelectorSquare();
          this.segmentationButtonCanBePressed = true;
          node.unlock();
          this.selectionManager.updateContextComponents();
          this.selectionManager.enable();
          // to close off the session.
        } else {
          console.log("Busy Processing Video.");
        }
        document.body.style.cursor = "default";
      }
    });
    uiEvents.toolbarNode.DELETE.onClick(() =>
      this.commandManager.deleteNodes(),
    );
    uiEvents.toolbarNode.MOVE_LAYER_DOWN.onClick(() =>
      this.commandManager.moveNodesDown(),
    );
    uiEvents.toolbarNode.MOVE_LAYER_UP.onClick(() =>
      this.commandManager.moveNodesUp(),
    );

    uiEvents.onGetStagedImage((image) => {
      this.addImage(image);
    });

    uiEvents.onGetStagedVideo((videoData) => {
      console.log("Engine got user video: " + videoData.mediaFileUrl);
      this.addVideo(videoData);
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
        if (chromakeyProps.isChromakeyEnabled) {
          this.commandManager.addChromaKey({
            videoNode: node,
            newChromaColor: chromakeyProps.chromakeyColor ?? {
              red: 120,
              green: 150,
              blue: 120,
            },
          });
        } else {
          this.commandManager.removeChromaKey({
            videoNode: node,
          });
        }
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
    this.commandManager.createNode(textNode);
  }

  public addImage(imageFile: File) {
    const imageNode = new ImageNode({
      mediaLayerRef: this.mediaLayer,
      canvasPosition: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      imageFile: imageFile,
      selectionManagerRef: this.selectionManager,
    });

    this.commandManager.createNode(imageNode);
    this.renderEngine.addNodes(imageNode);
  }

  public addVideo(
    videNodeData: Partial<VideoNodeData> & { mediaFileUrl: string },
  ) {
    const videoNode = new VideoNode({
      mediaLayerRef: this.mediaLayer,
      selectionManagerRef: this.selectionManager,
      loadingVideosProviderRef: this.loadingVideosProvider,
      canvasPosition: this.renderEngine.captureCanvas.position(),
      canvasSize: this.renderEngine.captureCanvas.size(),
      videoNodeData: videNodeData,
    });
    this.commandManager.createNode(videoNode);
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
        this.commandManager.deleteNodes();
      }
    });
  }
}
