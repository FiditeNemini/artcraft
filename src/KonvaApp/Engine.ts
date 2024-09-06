import Konva from "konva";
import { VideoNode } from "./Nodes/VideoNode";
import { imageToolbar, loadingBar } from "~/signals";
import { RenderEngine } from "./RenderEngine";

export class Engine {
  private canvasReference: HTMLDivElement;
  private stage: Konva.Stage;
  private videoLayer: Konva.Layer;
  private renderEngine: RenderEngine;
  private offScreenCanvas: OffscreenCanvas;

  // signal reference
  constructor(canvasReference: HTMLDivElement) {
    this.canvasReference = canvasReference;
    this.stage = new Konva.Stage({
      container: this.canvasReference,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Listen to changes in container size
    const resizeObserver = new ResizeObserver(() => {
      this.applyChanges();
    });

    resizeObserver.observe(this.canvasReference);
    this.applyChanges();

    const videoLayer = new Konva.Layer();
    this.videoLayer = videoLayer;
    this.stage.add(videoLayer);

    this.offScreenCanvas = new OffscreenCanvas(0, 0);
    const context = this.offScreenCanvas.getContext("2d");

    this.renderEngine = new RenderEngine(this.offScreenCanvas);
  }

  private applyChanges() {
    this.stage.width(this.canvasReference.offsetWidth);
    this.stage.height(this.canvasReference.offsetHeight);
    this.stage.draw(); // Redraw the canvas
  }

  public initializeStage(sceneToken: string) {
    // load canvas that was originaly saved
    imageToolbar.hide();
    loadingBar.hide();
    this.setupStage();
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
      300,
      300,
      "https://storage.googleapis.com/vocodes-public/media/r/q/p/r/e/rqpret6mkh18dqwjqwghhdqf15x720s1/storyteller_rqpret6mkh18dqwjqwghhdqf15x720s1.mp4",
    );

    this.renderEngine.addNodes(videoNode);

    // Call this when
    //await this.renderEngine.startProcessing();

    //videoNode.simulatedLoading();

    this.videoLayer.add(textNode);
  }
}

// do nothing, animation just need to update the layer
// try {
//   if (!context) {
//     console.log("Context is dead.");
//     return;
//   }
//   offScreenCanvas.width = videoNode.getWidth();
//   offScreenCanvas.height = videoNode.getHeight();
//   context.drawImage(
//     video,
//     0,
//     0,
//     videoNode.getWidth(),
//     videoNode.getHeight(),
//   );
//   console.log("draw");
//   const blob = await offScreenCanvas.convertToBlob({
//     quality: 1.0,
//     type: "image/jpeg",
//   });
//   console.log("blob");
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = "canvas-output.jpg";
//   // Trigger the download
//   link.click();
//   // Clean up the URL object
//   URL.revokeObjectURL(link.href);
//   console.log("hello");
// } catch (error) {
//   console.log(error);
// }
// anim.stop();
