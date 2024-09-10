import { VideoNode } from "./Nodes/VideoNode";
import Konva from "konva";

// https://www.aiseesoft.com/resource/phone-aspect-ratio-screen-resolution.html#:~:text=16%3A9%20Aspect%20Ratio
export class RenderEngine {
  private videoNodes: VideoNode[];
  private offScreenCanvas: OffscreenCanvas;
  private context: OffscreenCanvasRenderingContext2D | null;
  private isProcessing: boolean;

  private frames: ImageBitmap[];

  // capturing composite within window
  private videoLayer: Konva.Layer;

  private height: number;
  private width: number;
  private positionX: number;
  private positionY: number;

  constructor(videoLayer: Konva.Layer, offScreenCanvas: OffscreenCanvas) {
    this.videoNodes = [];

    this.isProcessing = false;

    // TODO make this dynamic

    this.width = 720;
    this.height = 1280;
    this.positionX = window.innerWidth / 2 - 720 / 2;
    this.positionY = window.innerHeight / 2 - 1080 / 2;

    this.offScreenCanvas = offScreenCanvas;
    this.offScreenCanvas.width = this.width;
    this.offScreenCanvas.height = this.height;
    this.context = this.offScreenCanvas.getContext("2d");

    this.frames = [];

    this.videoLayer = videoLayer;

    const captureCanvas = new Konva.Rect({
      x: this.positionX,
      y: this.positionY,
      width: this.width,
      height: this.height,
      fill: "white",
      stroke: "black",
      strokeWidth: 1,
      draggable: false,
    });

    // DEBUG ONLY
    // const rectangle = new Konva.Rect({
    //   x: this.positionX,
    //   y: this.positionY,
    //   width: 100,
    //   height: 100,
    //   fill: "green",
    //   stroke: "black",
    //   strokeWidth: 1,
    //   draggable: false,
    // });
    //this.videoLayer.add(rectangle);
    this.videoLayer.add(captureCanvas);
    // set furest back
    captureCanvas.setZIndex(0);
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

  // Do a bunch of precondition checks and error out early on.
  public async startProcessing() {
    // Start processing and lock everything
    this.isProcessing = true;
    try {
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
        // throw error
        return;
      }

      this.videoNodes.forEach((item: VideoNode) => {});

      // find the longest video node
      const numberOfFrames = this.findLongestVideoLength();
      console.log(`Number Of Frames: ${numberOfFrames}`);

      await this.render(numberOfFrames);

      // only to test video node
      //await this.processFrame();
    } catch (error) {
      console.log(error);
    } finally {
      this.isProcessing = false;
    }
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
  private async render(largestNumberOfFrames: number) {
    if (!this.isProcessing) return;

    // Stop all nodes first
    console.log(`LargestNumberOfFrames:${largestNumberOfFrames}`);

    for (let k = 0; k < this.videoNodes.length; k++) {
      const videoNode = this.videoNodes[k];
      if (videoNode.didFinishLoading === false) {
        throw Error("Videos Did Not Finish Loading Please Try Again.");
      }
      videoNode.stop();
    }

    // only pick nodes that intersect with the canvas on screen bounds

    for (let j = 0; j < largestNumberOfFrames; j++) {
      // Seek Video Nodes first then draw

      let frameTime = undefined;

      for (let i = 0; i < this.videoNodes.length; i++) {
        const currentVideoNode = this.videoNodes[i];
        frameTime = this.calculateFrameTime(j, currentVideoNode.fps);
        frameTime = parseFloat(frameTime.toFixed(2));
        if (frameTime < currentVideoNode.duration) {
          console.log(`CurrentFrame:${j}`);
          console.log(`FrameTime:${frameTime}`);
          console.log(`Duration:${currentVideoNode.duration}`);
          await currentVideoNode.seek(frameTime);
        } // end of if context
      } // End frame time
      this.videoLayer.draw();

      // SCOPES the capture for the context
      // Correct size for the mobile canvas.
      this.offScreenCanvas.width = this.width;
      this.offScreenCanvas.height = this.height;

      if (this.context) {
        // This crops it starting at position X / Y where the mobile canvas is
        // Then picks the height and width range
        // then we draw it at 0,0,width and height of the canvas
        this.context.drawImage(
          this.videoLayer.canvas._canvas,
          this.positionX,
          this.positionY,
          this.width,
          this.height,
          0,
          0,
          this.width,
          this.height,
        );
        const blob = await this.offScreenCanvas.convertToBlob({
          quality: 1.0,
          type: "image/jpeg",
        });
        await this.blobToFile(blob, `${j}`);
      } // end of for each frame
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

  private blobToFile(blob: Blob, index: string) {
    try {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const formattedIndex = String(index).padStart(4, "0");
      link.download = `${formattedIndex}.jpg`;
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
