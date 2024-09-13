import Konva from "konva";
import { VideoNode } from "./Nodes/VideoNode";
import { uiAccess } from "~/signals";
import { uiEvents } from "~/signals";
import { RenderEngine } from "./RenderingPrimitives/RenderEngine";

import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";

export class Engine {
  private canvasReference: HTMLDivElement;
  private stage: Konva.Stage;
  private videoLayer: Konva.Layer;
  private renderEngine: RenderEngine;
  private offScreenCanvas: OffscreenCanvas;

  // signal reference
  constructor(canvasReference: HTMLDivElement) {
    console.log("Engine Created!");

    if (import.meta.env.DEV) {
      console.log("Engine Constructor ran");
    }

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
    this.renderEngine = new RenderEngine(this.videoLayer, this.offScreenCanvas);

    uiEvents.onGetStagedImage((image) => {
      this.addImage(image);
    });
    uiEvents.onGetStagedVideo((video) => {
      console.log("Engine got video: " + video.url);
      // this.addVideo(video.file);
    });

    // TODO: You may listen to all the image toolbar events here
    uiEvents.toolbarImage.MOVE.onClick(() => {
      console.log("move");
    });

    uiEvents.toolbarMain.SELECT_ONE.onClick(() => {
      console.log("select one is clicked");
    });
    uiEvents.toolbarMain.SAVE.onClick(async (event) => {
      uiAccess.toolbarMain.changeButtonState(
        ToolbarMainButtonNames.AI_STYLIZE,
        { disabled: true },
      );

      console.log("onClick");
      await this.renderEngine.startProcessing();

      uiAccess.toolbarMain.changeButtonState(
        ToolbarMainButtonNames.AI_STYLIZE,
        { disabled: false },
      );
    });
    uiEvents.toolbarMain.AI_STYLIZE.onClick(async (event) => {
      uiAccess.toolbarMain.changeButtonState(
        ToolbarMainButtonNames.AI_STYLIZE,
        { disabled: true },
      );
      const sleepytstart = new Date();
      console.log(
        "SLEEP",
        `${sleepytstart.getMinutes()}:${sleepytstart.getSeconds()}`,
      );

      const sleeptend = new Date();
      console.log(
        "DONE",
        `${sleeptend.getMinutes()}:${sleeptend.getSeconds()}`,
      );

      uiAccess.toolbarMain.changeButtonState(
        ToolbarMainButtonNames.AI_STYLIZE,
        { disabled: false },
      );
    });
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private applyChanges() {
    this.stage.width(this.canvasReference.offsetWidth);
    this.stage.height(this.canvasReference.offsetHeight);
    this.stage.draw(); // Redraw the canvas
  }

  // Sandbox is quickly a way to test your idea.
  public sandbox() {}

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
        const timeDiff = frame.timeDiff;
        const frameRate = frame.frameRate;
        textNode.setText(
          `FrameTime:${timeDiff.toFixed(0)} ms\nFrameRate:${frameRate.toFixed(0)} fps`,
        );
      }
    }, this.videoLayer);
    anim.start();

    // Adding nodes here
    const videoNode = new VideoNode(
      "",
      this.offScreenCanvas,
      this.videoLayer,
      1560,
      400,
      "https://storage.googleapis.com/vocodes-public/media/r/q/p/r/e/rqpret6mkh18dqwjqwghhdqf15x720s1/storyteller_rqpret6mkh18dqwjqwghhdqf15x720s1.mp4",
    );

    const videoNode2 = new VideoNode(
      "",
      this.offScreenCanvas,
      this.videoLayer,
      1560,
      1000,
      "https://storage.googleapis.com/vocodes-public/media/r/q/p/r/e/rqpret6mkh18dqwjqwghhdqf15x720s1/storyteller_rqpret6mkh18dqwjqwghhdqf15x720s1.mp4",
    );

    // CODE TO TEST RENDER ENGINE
    // Testing render engine
    this.renderEngine.addNodes(videoNode);
    this.renderEngine.addNodes(videoNode2);

    // await this.renderEngine.startProcessing();

    // Call this when test video nodes
    // await this.renderEngine.startProcessing();

    //videoNode.simulatedLoading();
    // TODO support Text nodes

    this.videoLayer.add(textNode);
  }

  public addImage(imageFile: File) {
    // main API:
    const imageObj = new Image();
    const videoLayer = this.videoLayer;
    imageObj.onload = () => {
      const konvaImage = new Konva.Image({
        x: 50,
        y: 50,
        image: imageObj,
        width: 106,
        height: 118,
      });

      // add the shape to the layer
      videoLayer.add(konvaImage);
    };
    imageObj.src = URL.createObjectURL(imageFile);
  }
  public addVideo(videoFile: File) {
    // Adding nodes here
    console.log("addVideo", videoFile);
  }
}
