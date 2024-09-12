import { VideoNode } from "../Nodes/VideoNode";
import Konva from "konva";

import { RenderTask, WorkerEvent } from "./RenderTask";

// https://www.aiseesoft.com/resource/phone-aspect-ratio-screen-resolution.html#:~:text=16%3A9%20Aspect%20Ratio
export class RenderEngine {
  private videoNodes: VideoNode[];
  private offScreenCanvas: OffscreenCanvas;
  private context: OffscreenCanvasRenderingContext2D | null;

  private offscreenCanvasCache: OffscreenCanvas[] = [];
  private isProcessing: boolean;

  private frames: ImageBitmap[];

  // capturing composite within window
  private videoLayer: Konva.Layer;

  private height: number;
  private width: number;
  private positionX: number;
  private positionY: number;

  private canUseSharedWorker: boolean;
  private sharedWorker: SharedWorker | undefined;
  private port: MessagePort | undefined;
  private maxFrames: number;
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

    this.port = undefined;
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

    this.maxFrames = 7 * 24;

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
    // set back
    captureCanvas.setZIndex(0);

    this.sharedWorker = undefined;
    this.canUseSharedWorker = false;
    this.setupSharedWorker();
  }

  // Manage the worker
  onMessage(event: MessageEvent) {
    const message = event.data;
    console.log("Main script received:", message);
    // Send a response back to the worker
    if (!this.port) {
      return console.log("Undefined Worker");
    }
  }

  sendMessage() {
    if (!this.port) {
      return console.log("Undefined Worker");
    }
    this.port.postMessage("Hello from Main Script");
  }

  async sendCanvasPayload(renderTask: RenderTask) {
    if (!this.port) {
      return console.log("Undefined Worker");
    }
    this.port.postMessage(renderTask);
  }

  setupSharedWorker() {
    if (typeof SharedWorker !== "undefined") {
      this.offscreenCanvasCache = [];
      // canvas size should be defined here
      for (let i = 0; i < this.maxFrames; i++) {
        let offScreenCanvas = new OffscreenCanvas(this.width, this.height);
        this.offscreenCanvasCache.push(offScreenCanvas);
      }

      console.log("Shared Workers are supported in this browser.");
      // Debug chrome://inspect/#workers
      // TODO ensure that the cors is solved for this.
      this.sharedWorker = new SharedWorker(
        "src\\KonvaApp\\RenderingPrimitives\\RenderSharedWorker.ts",
        {
          type: "module",
        },
      );

      // Get the port for communication
      this.port = this.sharedWorker.port;
      this.port.start();
      // Set up the message event listener
      this.port.onmessage = this.onMessage.bind(this);

      this.canUseSharedWorker = true;
    } else {
      console.log("Shared Workers are not supported in this browser.");
      // Handle the lack of Shared Worker support (e.g., fallback to another solution)
      this.canUseSharedWorker = false;
    }
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

      // use main thread
      if (this.canUseSharedWorker === false) {
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
      } else {
        console.log("Using Shared Worker");
        const canvas = this.offscreenCanvasCache[j];
        const context = canvas.getContext("2d");
        // decode on the shared webworker.
        context?.drawImage(
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

        this.sendCanvasPayload({
          jobID: 1,
          isDone: false,
          event: WorkerEvent.DATA,
          data: {
            offscreenCanvas: canvas,
            id: j,
          },
        });

        if (j == this.maxFrames - 1) {
          this.sendCanvasPayload({
            jobID: 1,
            isDone: true,
            event: WorkerEvent.DATA,
            data: undefined,
          });
        }
      }
    }
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

// //DO NOT USE: This code is to test whether or not we can seek frames on each video nodes.
// //To check the correctness of the seeking.
// private async processFrame() {
//   if (!this.isProcessing) return;

//   for (let j = 0; j < this.videoNodes.length; j++) {
//     const videoNode = this.videoNodes[j];

//     videoNode.stop();
//     const numberOfFrames = videoNode.getNumberFrames();

//     for (let i = 0; i <= numberOfFrames; i++) {
//       const frameTime = this.calculateFrameTime(i, videoNode.fps);

//       console.log(i);
//       console.log(frameTime);
//       console.log(videoNode.duration);

//       if (frameTime < videoNode.duration) {
//         await videoNode.seek(frameTime);
//         this.offScreenCanvas.width = videoNode.node.getSize().width;
//         this.offScreenCanvas.height = videoNode.node.getSize().height;

//         if (this.context) {
//           this.context.drawImage(
//             videoNode.videoComponent,
//             0,
//             0,
//             this.offScreenCanvas.width,
//             this.offScreenCanvas.height,
//           );
//           console.log("Pushing");
//           this.frames.push(this.offScreenCanvas.transferToImageBitmap());
//         }
//       } // end of if
//     } // end of for.
//   }
//   console.log(this.frames);
// }
