import { layer } from "@fortawesome/fontawesome-svg-core";
import { VideoNode } from "./Nodes/VideoNode";
import Konva from "konva";
import { CanvasHTMLAttributes } from "react";
export class RenderEngine {
  private videoNodes: VideoNode[];
  private offScreenCanvas: OffscreenCanvas;
  private context: OffscreenCanvasRenderingContext2D | null;
  private isProcessing: boolean;

  private frames: ImageBitmap[];

  // capturing composite within window
  private videoLayer: Konva.Layer;
  private videoDrawCanvas: HTMLCanvasElement;
  private videoDrawContext: CanvasRenderingContext2D | null;
  constructor(videoLayer: Konva.Layer, offScreenCanvas: OffscreenCanvas) {
    this.videoNodes = [];
    this.offScreenCanvas = offScreenCanvas;
    this.context = this.offScreenCanvas.getContext("2d");
    this.isProcessing = false;
    this.frames = [];

    // Rendering surface resolution

    this.videoLayer = videoLayer;

    var positionX = window.innerWidth / 2 - 720 / 2;
    var positionY = window.innerHeight / 2 - 1080 / 2;
    // https://www.aiseesoft.com/resource/phone-aspect-ratio-screen-resolution.html#:~:text=16%3A9%20Aspect%20Ratio
    var width = 720;
    var height = 1280;

    const captureCanvas = new Konva.Rect({
      x: positionX,
      y: positionY,
      width: width,
      height: height,
      fill: "white",
      stroke: "black",
      strokeWidth: 1,
      draggable: false,
    });
    this.videoLayer.add(captureCanvas);
    // set furest back
    captureCanvas.setZIndex(-10);

    // get the render position on the layer
    this.videoDrawCanvas = this.renderPortionOfLayer(
      this.videoLayer,
      positionX,
      positionY,
      width,
      height,
    );

    // sadly exists as a NOT AS a offscreen rendering context. ? maybe bitmaprenderer ?
    this.videoDrawContext = this.videoDrawCanvas.getContext("2d");
  }

  // This function uses a portion of the video layer to capture just the capture canvas.
  // capture everything after seeking each video node.
  renderPortionOfLayer(
    layer: Konva.Layer,
    x: number,
    y: number,
    width: number,
    height: number,
  ): HTMLCanvasElement {
    const canvas = layer.toCanvas({
      x: x,
      y: y,
      width: width,
      height: height,
    });
    return canvas;
  }

  private findLongestVideoLength(): number {
    let maxLength = 0;
    this.videoNodes.forEach((node) => {
      const videoLength = node.getNumberFrames();
      if (videoLength > maxLength) {
        maxLength = videoLength;
      }
    });
    return maxLength;
  }

  public addNodes(node: VideoNode) {
    this.videoNodes.push(node);
  }

  public async startProcessing() {
    // Start processing and lock everything
    this.isProcessing = true;

    // or not loaded

    // error out if nodes are not all loaded.

    // ensure items cannot be manipulated

    // todo remove when we have error handling + and ui
    var failed = false;
    for (let i = 0; i < this.videoNodes.length; i++) {
      const item = this.videoNodes[i];

      if (item.didFinishLoading == false) {
        // error out and show error message
        //this.startProcessing();
        failed = true;
        setTimeout(this.startProcessing.bind(this), 1000);
        break;
      }

      item.setProcessing();
    }

    // todo remove
    if (failed) {
      return;
    }

    this.videoNodes.forEach((item: VideoNode) => {});

    // find the longest video node;
    const numberOfFrames = this.findLongestVideoLength();

    await this.render(numberOfFrames);

    // only to test video node
    //await this.processFrame();
  }

  public stopProcessing() {
    this.isProcessing = false;
  }

  // find the frame time given the frame number
  private calculateFrameTime(frameNumber: number, frameRate: number): number {
    return frameNumber / frameRate;
  }

  // TODO render loop should be.
  // find longest video
  // then seek through each node 1 step.
  // stop ignore stepping if the duration is less.
  private async render(numberOfFrames: number) {
    if (!this.isProcessing) return;
    for (let j = 0; j < numberOfFrames; j++) {
      const videoNode = this.videoNodes[j];

      videoNode.stop();
      const numberOfFrames = videoNode.getNumberFrames();

      for (let i = 0; i <= numberOfFrames; i++) {
        const frameTime = this.calculateFrameTime(i, videoNode.fps);

        console.log(i);
        console.log(frameTime);
        console.log(videoNode.duration);

        if (frameTime < videoNode.duration) {
          await videoNode.seek(frameTime);
          this.offScreenCanvas.width = videoNode.node.getSize().width;
          this.offScreenCanvas.height = videoNode.node.getSize().height;

          if (this.context) {
            this.context.drawImage(
              videoNode.videoComponent,
              0,
              0,
              this.offScreenCanvas.width,
              this.offScreenCanvas.height,
            );

            this.frames.push(this.offScreenCanvas.transferToImageBitmap());
          }
        } // end of if
      } // end of for.
    }
  }

  //DO NOT USE: This code is to test whether or not we can seek frames on each video nodes.
  //To check the correctness of the seeking.
  private async processFrame() {
    if (!this.isProcessing) return;

    for (let j = 0; j < this.videoNodes.length; j++) {
      const videoNode = this.videoNodes[j];

      videoNode.stop();
      const numberOfFrames = videoNode.getNumberFrames();

      for (let i = 0; i <= numberOfFrames; i++) {
        const frameTime = this.calculateFrameTime(i, videoNode.fps);

        console.log(i);
        console.log(frameTime);
        console.log(videoNode.duration);

        if (frameTime < videoNode.duration) {
          await videoNode.seek(frameTime);
          this.offScreenCanvas.width = videoNode.node.getSize().width;
          this.offScreenCanvas.height = videoNode.node.getSize().height;

          if (this.context) {
            this.context.drawImage(
              videoNode.videoComponent,
              0,
              0,
              this.offScreenCanvas.width,
              this.offScreenCanvas.height,
            );
            console.log("Pushing");
            this.frames.push(this.offScreenCanvas.transferToImageBitmap());
          }
        } // end of if
      } // end of for.
    }

    console.log(this.frames);
  }

  private blobToFile(blob: Blob) {
    try {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "canvas-output.jpg";
      // Trigger the download
      link.click();
      // Clean up the URL object
      URL.revokeObjectURL(link.href);
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  }
}
