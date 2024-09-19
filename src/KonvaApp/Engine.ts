import Konva from "konva";
import { VideoNode } from "./Nodes/VideoNode";
import { uiAccess } from "~/signals";
import { uiEvents } from "~/signals";
import { RenderEngine } from "./RenderingPrimitives/RenderEngine";
import { v4 as uuidv4 } from "uuid";

import { SelectionManager } from "./SelectionManager";
import { toolbarImage } from "~/signals/uiAccess/toolbarImage";

import { ImageNode } from "./Nodes/ImageNode";

import { LoadingBarStatus } from "~/components/ui";
import { ResponseType } from "./WorkerPrimitives/SharedWorkerBase";
import { UndoStackManager } from "./UndoRedo/UndoRedoManager";
import * as ort from "onnxruntime-web";

import { CreateCommand } from "./UndoRedo/CreateCommand";
import { DeleteCommand } from "./UndoRedo/DeleteCommand";
import { RotateCommand } from "./UndoRedo/RotateCommand";
import { ScaleCommand } from "./UndoRedo/ScaleCommand";
import { TranslateCommand } from "./UndoRedo/TranslateCommand";

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
  private canvasReference: HTMLDivElement;
  private stage: Konva.Stage;
  private videoLayer: Konva.Layer;
  private renderEngine: RenderEngine;
  private offScreenCanvas: OffscreenCanvas;

  private selectionManager: SelectionManager;
  private undoStackManager: UndoStackManager;
  // signal reference
  constructor(canvasReference: HTMLDivElement) {
    console.log("Engine Created!");

    if (import.meta.env.DEV) {
      console.log("Engine Constructor ran");
    }

    this.selectionManager = new SelectionManager();
    this.undoStackManager = new UndoStackManager();
    this.canvasReference = canvasReference;
    this.stage = new Konva.Stage({
      container: this.canvasReference,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const videoLayer = new Konva.Layer();
    this.videoLayer = videoLayer;
    this.stage.add(videoLayer);

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

  private isShowing: boolean = false;

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

      const videoNode = new VideoNode(
        uuidv4(),
        this.videoLayer,
        this.renderEngine.captureCanvas.position().x,
        this.renderEngine.captureCanvas.position().y,
        media_url,
        this.selectionManager,
        undefined,
        undefined,
      );
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
    } else {
      // throw error to retry
      uiAccess.dialogueError.show({
        title: "Generation Error",
        message: response.data,
      });

      // if (!this.renderEngine.videoLoadingCanvas) {
      //   console.log("Did not setup video loading canvas.");
      //   return;
      // }
      //this.renderEngine.videoLoadingCanvas.kNode.hide();

      uiAccess.toolbarMain.loadingBar.hide();
    }
  }

  private setupEventSystem() {
    this.stage.on("mousedown", (e) => {
      if (e.target === this.stage) {
        this.selectionManager.clearSelection();
      }
    });

    uiEvents.toolbarImage.DELETE.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      toolbarImage.hide();

      nodes.forEach((node) => {
        this.selectionManager.deselectNode(node);
        this.renderEngine.removeNodes(node);
        node.delete();
      });
    });

    uiEvents.toolbarImage.MOVE_LAYER_DOWN.onClick(() => {
      const nodes = this.selectionManager.getSelectedNodes();
      nodes.forEach((node) => {
        node.sendBack();
      });
    });

    uiEvents.toolbarImage.MOVE_LAYER_UP.onClick(() => {
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
          message: error.toString(),
        });
      }
    });

    // TODO: You may listen to all the image toolbar events here
    uiEvents.toolbarImage.MOVE.onClick(() => {
      console.log("move");
    });

    uiEvents.toolbarMain.SELECT_ONE.onClick(() => {
      console.log("select one is clicked");
    });

    // TODO implement.
    uiEvents.toolbarMain.SAVE.onClick(async (event) => {
      //this.onRenderingSystemReceived(undefined);
    });

    // WIL please default hide this. TODO Remove
    uiAccess.toolbarMain.loadingBar.hide();
    uiAccess.toolbarMain.loadingBar.updateStatus(LoadingBarStatus.IDLE);
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

  public async onnx() {
    try {
      //DO NOT REMOVE, NECESSARY TO LOAD WASM FILES
      ort.env.wasm.wasmPaths = "wasm/";

      // Load the model and create InferenceSession
      const modelPathE = "/models/image_encoder_hiera_t.onnx";
      const modelPath = "/models/mask_decoder_hiera_t.onnx";
      const modelPath1 = "/models/memory_attention_hiera_t.onnx";
      const modelPath2 = "/models/memory_encoder_hiera_t.onnx";
      const modelPath3 = "/models/mlp_hiera_t.onnx";
      const modelPath4 = "/models/prompt_encoder_hiera_t.onnx";

      const mask_decoder_hiera_t = await ort.InferenceSession.create(
        modelPath,
        {
          executionProviders: ["wasm"],
        },
      );
      console.log(mask_decoder_hiera_t);
      const memory_attention_hiera_t = await ort.InferenceSession.create(
        modelPath1,
        {
          executionProviders: ["wasm"],
        },
      );
      console.log(memory_attention_hiera_t);
      const memory_encoder_hiera_t = await ort.InferenceSession.create(
        modelPath2,
        {
          executionProviders: ["wasm"],
        },
      );
      console.log(memory_encoder_hiera_t);
      const mlp_hiera_t = await ort.InferenceSession.create(modelPath3, {
        executionProviders: ["wasm"],
      });
      console.log(mlp_hiera_t);
      const prompt_encoder_hiera_t = await ort.InferenceSession.create(
        modelPath4,
        {
          executionProviders: ["wasm"],
        },
      );
      console.log(prompt_encoder_hiera_t);

      // // Run inference
      // const outputs = await session.run({ input: inputTensor });
      // console.log(outputs);
    } catch (err) {
      console.error("error caught: ", err);
    }
  }

  // Sandbox is quickly a way to test your idea.
  public async sandbox() {}

  public onMessage(event: MessageEvent) {
    console.log("Message From Shared Worker");
    console.log(event);
  }

  public initializeStage(sceneToken: string) {
    // load canvas that was originaly saved TODO Save manager for resharing.
    uiAccess.toolbarImage.hide();
    uiAccess.loadingBar.hide();
    this.setupStage();
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
    }, this.videoLayer);
    anim.start();

    // Adding nodes here
    // const videoNode = new VideoNode(
    //   "",
    //   this.offScreenCanvas,
    //   this.videoLayer,
    //   1560,
    //   400,
    //   "https://storage.googleapis.com/vocodes-public/media/r/q/p/r/e/rqpret6mkh18dqwjqwghhdqf15x720s1/storyteller_rqpret6mkh18dqwjqwghhdqf15x720s1.mp4",
    //   this.selectionManager,
    // );
    // CODE TO TEST RENDER ENGINE
    // Testing render engine
    // this.renderEngine.addNodes(videoNode);
    // await this.renderEngine.startProcessing();
    //videoNode.simulatedLoading();
    // TODO support Text nodes

    this.videoLayer.add(textNode);

    this.addKeyboardShortcuts();
  }

  public addImage(imageFile: File) {
    const imageNode = new ImageNode(
      uuidv4(),
      this.videoLayer,
      50,
      50,
      imageFile,
      this.selectionManager,
    );
    this.renderEngine.addNodes(imageNode);
  }
  public addVideo(url: string) {
    // Adding nodes here
    const videoNode = new VideoNode(
      uuidv4(),
      this.videoLayer,
      1560,
      400,
      url,
      this.selectionManager,
      undefined,
      undefined,
    );
    this.renderEngine.addNodes(videoNode);
  }

  private addKeyboardShortcuts() {
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "z") {
        this.undo();
      } else if (
        (event.ctrlKey && event.key === "y") ||
        (event.ctrlKey && event.shiftKey && event.key === "Z")
      ) {
        this.redo();
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

  deleteNodes(nodes: Konva.Node[]) {
    const command = new DeleteCommand(nodes);
    this.undoStackManager.executeCommand(command);
  }

  createNodes(nodes: Konva.Node[]) {
    const command = new CreateCommand(nodes, this.videoLayer);
    this.undoStackManager.executeCommand(command);
  }

  scaleNodes(nodes: Konva.Node[], newScaleX: number, newScaleY: number) {
    const command = new ScaleCommand(nodes, newScaleX, newScaleY);
    this.undoStackManager.executeCommand(command);
  }

  undo() {
    this.undoStackManager.undo();
  }

  redo() {
    this.undoStackManager.redo();
  }
}
