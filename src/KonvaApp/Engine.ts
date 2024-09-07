import Konva from "konva";
import { VideoNode } from "./Nodes/VideoNode";
import { uiAccess } from "~/signals";
import { uiEvents } from "~/signals";
import { RenderEngine } from "./RenderEngine";
import { layer } from "@fortawesome/fontawesome-svg-core";
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

    uiEvents.onGetStagedImage((image) => {
      this.addImage(image);
    });
    uiEvents.onGetStagedVideo((video) => {
      this.addVideo(video);
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

  public initializeStage(sceneToken: string) {
    // load canvas that was originaly saved

    uiAccess.imageToolbar.hide();
    uiAccess.loadingBar.hide();
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
      1200,
      300,
      "https://storage.googleapis.com/vocodes-public/media/r/q/p/r/e/rqpret6mkh18dqwjqwghhdqf15x720s1/storyteller_rqpret6mkh18dqwjqwghhdqf15x720s1.mp4",
    );

    const node2 = new VideoNode(
      "",
      this.offScreenCanvas,
      this.videoLayer,
      1600,
      700,
      "https://storage.googleapis.com/vocodes-public/media/r/q/p/r/e/rqpret6mkh18dqwjqwghhdqf15x720s1/storyteller_rqpret6mkh18dqwjqwghhdqf15x720s1.mp4",
    );

    var positionX = window.innerWidth / 2 - 720 / 2;
    var positionY = window.innerHeight / 2 - 1080 / 2;

    var width = 720;
    var height = 1080;

    const activeFrame = new Konva.Rect({
      x: positionX,
      y: positionY,
      width: width,
      height: height,
      fill: "white",
      stroke: "black",
      strokeWidth: 1,
      draggable: false,
    });

    const activeFrame2 = new Konva.Rect({
      x: positionX,
      y: positionY,
      width: 100,
      height: 100,
      fill: "green",
      stroke: "black",
      strokeWidth: 1,
      draggable: false,
    });

    this.videoLayer.add(activeFrame);
    this.videoLayer.add(activeFrame2);
    activeFrame2.moveToTop();
    activeFrame.moveToBottom();

    await this.sleep(5000);

    for (let i = 0; i < 10; i++) {
      const canvas = await this.renderPortionOfLayer(
        this.videoLayer,
        positionX,
        positionY,
        width,
        height,
      );

      canvas.toBlob((blob) => {
        if (blob) {
          // Do something with the blob, e.g., upload it or save it
          console.log("Blob created:", blob);
          // Example: Create a download link for the blob
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "canvas-output.png";
          link.click();
        } else {
          console.error("Failed to create blob");
        }
      }, "image/png");

      await this.sleep(2000);
    }
    //this.renderEngine.addNodes(videoNode);

    // Call this when
    //await this.renderEngine.startProcessing();

    //videoNode.simulatedLoading();

    this.videoLayer.add(textNode);
  }

  async renderPortionOfLayer(
    layer: Konva.Layer,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    const canvas = layer.toCanvas({
      x: x,
      y: y,
      width: width,
      height: height,
    });
    return canvas;
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
