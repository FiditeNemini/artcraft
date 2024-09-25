import Konva from "konva";

import { RenderEngine } from "./RenderingPrimitives/RenderEngine";
import { ResponseType } from "./WorkerPrimitives/SharedWorkerBase";

import { uiAccess } from "~/signals";
import { toolbarNode } from "~/signals/uiAccess/toolbarNode";
import { uiEvents } from "~/signals";

import { SelectionManager } from "./SelectionManager";
import { SelectorSquare } from "./SelectorSquare";
import { NodeTransformer } from "./NodeTransformer";
import { ImageNode } from "./Nodes/ImageNode";
import { VideoNode } from "./Nodes/VideoNode";

import { UndoStackManager } from "./UndoRedo/UndoRedoManager";
import { CreateCommand } from "./UndoRedo/CreateCommand";
import { DeleteCommand } from "./UndoRedo/DeleteCommand";
import { RotateCommand } from "./UndoRedo/RotateCommand";
import { ScaleCommand } from "./UndoRedo/ScaleCommand";
import { TranslateCommand } from "./UndoRedo/TranslateCommand";

import { FileUtilities } from "./FileUtilities/FileUtilities";

import { AppModes } from "./type";
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
  private videoLayer: Konva.Layer;
  private renderEngine: RenderEngine;
  private offScreenCanvas: OffscreenCanvas;

  private selectionManager: SelectionManager;
  private selectorSquare: SelectorSquare;
  private nodeTransformer: NodeTransformer;
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

    const videoLayer = new Konva.Layer();
    this.videoLayer = videoLayer;
    this.stage.add(videoLayer);

    // Konva Transformer
    this.nodeTransformer = new NodeTransformer();
    this.videoLayer.add(this.nodeTransformer.getKonvaNode());
    // Selector Square
    this.selectorSquare = new SelectorSquare();
    this.videoLayer.add(this.selectorSquare.getKonvaNode());

    this.selectionManager = new SelectionManager();
    this.undoStackManager = new UndoStackManager();

    // Listen to changes in container size
    const resizeObserver = new ResizeObserver(() => {
      this.applyChanges();
    });

    resizeObserver.observe(this.canvasReference);
    this.applyChanges();

    // core layer for all the work done.

    this.offScreenCanvas = new OffscreenCanvas(0, 0);

    this.renderEngine = new RenderEngine(
      this.videoLayer,
      this.offScreenCanvas,
      this.onRenderingSystemReceived.bind(this),
    );

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

    if (response.responseType === ResponseType.result) {
      uiAccess.toolbarMain.loadingBar.hide();
      // create video node here.
      // choose it to be the size of the rendering output, this case its mobile. (1560, 400)
      const media_api_base_url = "https://storage.googleapis.com/";
      const media_url = `${media_api_base_url}vocodes-public${response.data.videoUrl}`;

      const videoNode = new VideoNode({
        videoLayer: this.videoLayer,
        x: this.renderEngine.captureCanvas.position().x,
        y: this.renderEngine.captureCanvas.position().y,
        videoURL: media_url,
        selectionManagerRef: this.selectionManager,
        nodeTransformerRef: this.nodeTransformer,
      });
      this.renderEngine.addNodes(videoNode);
      // hide the loader
      //this.renderEngine.videoLoadingCanvas.kNode.hide();
      uiAccess.toolbarMain.loadingBar.hide();
    } else if (response.responseType === ResponseType.progress) {
      // TODO wil fix this ?!?! parameter issue
      uiAccess.toolbarMain.loadingBar.show();
      //this.renderEngine.videoLoadingCanvas.kNode.show();
      uiAccess.toolbarMain.loadingBar.updateProgress(
        response.data.progress * 100,
      );
      console.log(response);

      // if (response.data.zipBlob) {
      //   FileUtilities.downloadBlobZip(response.data.zipBlob);
      // }
    } else {
      // throw error to retry
      uiAccess.dialogueError.show({
        title: "Generation Error",
        message: response.data,
      });
      uiAccess.toolbarMain.loadingBar.hide();
    }
  }

  private setupEventSystem() {
    if (this.appMode === AppModes.SELECT) {
      this.selectorSquare.enable({
        captureCanvasRef: this.renderEngine.captureCanvas,
        nodeTransformerRef: this.nodeTransformer,
        selectionManagerRef: this.selectionManager,
        stage: this.stage,
      });
      uiAccess.toolbarMain.changeButtonState(ToolbarMainButtonNames.SELECT, {
        active: true,
      });
    }

    uiEvents.toolbarNode.lock.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      nodes.forEach((node) => {
        node.toggleLock();
      });
      // this.nodeTransformer.enable({ selectedNodes: nodes });
    });

    uiEvents.toolbarNode.DELETE.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      toolbarNode.hide();

      nodes.forEach((node) => {
        this.selectionManager.deselectNode(node);
        const nodes = this.selectionManager.getSelectedNodes();
        this.nodeTransformer.enable({ selectedNodes: nodes });
        this.renderEngine.removeNodes(node);
        node.delete();
      });
    });

    uiEvents.toolbarNode.MOVE_LAYER_DOWN.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      nodes.forEach((node) => {
        node.sendBack();
      });
    });

    uiEvents.toolbarNode.MOVE_LAYER_UP.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      nodes.forEach((node) => {
        node.bringToFront();
      });
    });

    uiEvents.onGetStagedImage((image) => {
      this.addImage(image);
    });

    uiEvents.onGetStagedVideo((video) => {
      console.log("Engine got video: " + video.url);
      this.addVideo(video.url);
    });

    uiEvents.aiStylize.onRequest(async (data) => {
      console.log("Engine heard AI Stylize request: ", data);

      try {
        await this.renderEngine.startProcessing(data);
      } catch (error) {
        // throw error to retry
        uiAccess.dialogueError.show({
          title: "Generation Error",
          message: error?.toString() || "Unknown Error",
        });
      }
    });

    // TODO implement.
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
  }
  public isInitialized() {
    return this.stage !== null;
  }

  public async populateWithDebugItems() {
    const imageFile = await FileUtilities.createImageFileFromUrl(
      "https://static.miraheze.org/pgrwiki/0/0d/Dialogue-2B-Icon.png",
    );
    const imageNode = new ImageNode({
      mediaLayer: this.videoLayer,
      x: this.renderEngine.captureCanvas.position().x,
      y: this.renderEngine.captureCanvas.position().y,
      imageFile: imageFile,
      selectionManagerRef: this.selectionManager,
      nodeTransformer: this.nodeTransformer,
    });

    const imageNode2 = new ImageNode({
      mediaLayer: this.videoLayer,
      x: this.renderEngine.captureCanvas.position().x,
      y: this.renderEngine.captureCanvas.position().y,
      imageFile: imageFile,
      selectionManagerRef: this.selectionManager,
      nodeTransformer: this.nodeTransformer,
    });

    // Adding nodes here
    const videoNode = new VideoNode({
      videoLayer: this.videoLayer,
      x: this.renderEngine.captureCanvas.position().x,
      y: this.renderEngine.captureCanvas.position().y,
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

    this.renderEngine.addNodes(videoNode);
    this.renderEngine.addNodes(imageNode2);

    // TODO if only image take image and just takes snapshots Edge case
    this.renderEngine.addNodes(imageNode);
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
    }, this.videoLayer);
    anim.start();

    this.videoLayer.add(textNode);

    this.addKeyboardShortcuts();
  }

  public addImage(imageFile: File) {
    const imageNode = new ImageNode({
      mediaLayer: this.videoLayer,
      x: this.renderEngine.captureCanvas.position().x,
      y: this.renderEngine.captureCanvas.position().y,
      imageFile: imageFile,
      selectionManagerRef: this.selectionManager,
      nodeTransformer: this.nodeTransformer,
    });
    this.renderEngine.addNodes(imageNode);
    this.selectionManager.saveNode(imageNode);
  }

  public addVideo(url: string) {
    // Adding nodes here
    const videoNode = new VideoNode({
      videoLayer: this.videoLayer,
      x: this.renderEngine.captureCanvas.position().x,
      y: this.renderEngine.captureCanvas.position().y,
      videoURL: url,
      selectionManagerRef: this.selectionManager,
      nodeTransformerRef: this.nodeTransformer,
    });
    this.renderEngine.addNodes(videoNode);
    this.selectionManager.saveNode(videoNode);
  }

  // Events for Undo and Redo
  private addKeyboardShortcuts() {
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "z") {
        console.log("Undo");
        this.undoStackManager.undo();
      } else if (
        (event.ctrlKey && event.key === "y") ||
        (event.ctrlKey && event.shiftKey && event.key === "Z")
      ) {
        console.log("Redo");
        this.undoStackManager.redo();
      }
    });
  }

  translateNodes(nodes: Konva.Node[], newX: number, newY: number) {
    const command = new TranslateCommand(nodes, newX, newY);
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

  deleteNodes(nodes: Konva.Node[]) {
    const command = new DeleteCommand(nodes);
    this.undoStackManager.executeCommand(command);
  }

  createNodes(nodes: Konva.Node[]) {
    const command = new CreateCommand(nodes);
    this.undoStackManager.executeCommand(command);
  }
}
