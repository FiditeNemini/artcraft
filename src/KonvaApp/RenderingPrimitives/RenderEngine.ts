import { VideoNode } from "../Nodes/VideoNode";
import Konva from "konva";
import { RenderTask } from "./RenderTask";

// Hide these two to start. WIL
// uiAccess.toolbarMain.loadingBar.hide();
// uiEvents.toolbarMain.loadingBarRetry.onClick((e) => {
//   console.log(
//     "toolbarMain > loadingBar > retry : onClick heard in Engine",
//     e,
//   );
// });
// uiAccess.toolbarMain.loadingBar.updateProgress(100);

import { DiffusionSharedWorkerClient } from "../SharedWorkers/Diffusion/DiffusionSharedWorkerClient";
import {
  SharedWorkerRequest,
  SharedWorkerResponse,
} from "../WorkerPrimitives/SharedWorkerBase";
import {
  DiffusionSharedWorkerProgressData,
  DiffusionSharedWorkerResponseData,
  DiffusionSharedWorker,
  DiffusionSharedWorkerItemData,
} from "../SharedWorkers/Diffusion/DiffusionSharedWorker";
import { RenderingOptions } from "../Engine";
import { ImageNode } from "../Nodes/ImageNode";

// https://www.aiseesoft.com/resource/phone-aspect-ratio-screen-resolution.html#:~:text=16%3A9%20Aspect%20Ratio

export class RenderEngine {
  private videoNodes: VideoNode[];
  private imageNodes: ImageNode[];
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

  private canUseSharedWorker: boolean;

  private port: MessagePort | undefined;
  private upperMaxFrames: number;

  private captureCanvas: Konva.Rect;

  public videoLoadingCanvas: VideoNode | undefined;

  private onRenderingSystemMessageRecieved: (
    response: SharedWorkerResponse<
      DiffusionSharedWorkerResponseData,
      DiffusionSharedWorkerProgressData
    >,
  ) => void;

  private diffusionWorker:
    | DiffusionSharedWorkerClient<
        DiffusionSharedWorkerItemData,
        DiffusionSharedWorkerResponseData,
        DiffusionSharedWorkerProgressData
      >
    | undefined;

  async updateCaptureCanvas(
    width: number | undefined,
    height: number | undefined,
  ) {
    if (!this.captureCanvas) {
      return;
    }
    if (width) {
      this.width = width;
    }
    if (height) {
      this.height = height;
    }
    // Ensures that all the nodes stag in the same place should
    // there be a window resize.
    // recompute the position
    // to ensure that the position of this stays

    const oldPositionX = this.positionX;
    const oldPositionY = this.positionY;

    // recompute the position
    this.positionX = window.innerWidth / 2 - this.width / 2;
    this.positionY = window.innerHeight / 2 - this.height / 2;

    this.captureCanvas.setPosition({ x: this.positionX, y: this.positionY });
    this.captureCanvas.size({ width: this.width, height: this.height });

    // Setup loader and position it accordingly
    if (this.videoLoadingCanvas === undefined) {
      this.videoLoadingCanvas = new VideoNode(
        "",
        this.videoLayer,
        this.positionX,
        this.positionY,
        "wipe.mp4",
        undefined,
        this.width,
        this.height,
      );
    }
    this.videoLoadingCanvas.highlight();
    this.videoLoadingCanvas.kNode.hide();

    // this is the change in positions
    const deltaX = this.positionX - oldPositionX;
    const deltaY = this.positionY - oldPositionY;

    var children = this.videoLayer.getChildren();
    for (let i = 0; i < children.length; i++) {
      let node = children[i];

      // skip the capture canvas update.
      if (node.name() === "CaptureCanvas") {
        continue;
      }
      const pos = node.getPosition();
      node.setPosition({
        x: pos.x + deltaX,
        y: pos.y + deltaY,
      });
    }
    this.videoLayer.batchDraw();
  }
  constructor(
    videoLayer: Konva.Layer,
    offScreenCanvas: OffscreenCanvas,
    onRenderingSystemMessageRecieved: (
      response: SharedWorkerResponse<
        DiffusionSharedWorkerResponseData,
        DiffusionSharedWorkerProgressData
      >,
    ) => void,
  ) {
    this.videoLoadingCanvas = undefined;
    this.videoNodes = [];
    this.imageNodes = [];

    this.isProcessing = false;
    this.onRenderingSystemMessageRecieved = onRenderingSystemMessageRecieved;
    // TODO: Make this dynamic and update this on change of canvas.

    this.width = 720;
    this.height = 1280;
    this.positionX = window.innerWidth / 2 - this.width / 2;
    this.positionY = window.innerHeight / 2 - this.height / 2;

    this.offScreenCanvas = offScreenCanvas;
    this.offScreenCanvas.width = this.width;
    this.offScreenCanvas.height = this.height;
    this.context = this.offScreenCanvas.getContext("2d");

    this.frames = [];

    this.videoLayer = videoLayer;

    this.port = undefined;
    this.captureCanvas = new Konva.Rect({
      x: this.positionX,
      y: this.positionY,
      width: this.width,
      height: this.height,
      fill: "white",
      stroke: "black",
      strokeWidth: 1,
      draggable: false,
    });
    this.captureCanvas.addName("CaptureCanvas");

    this.upperMaxFrames = 7 * 24;

    this.videoLayer.add(this.captureCanvas);
    // send back
    this.captureCanvas.setZIndex(0);

    this.canUseSharedWorker = false;
    this.setupSharedWorker();

    //this.debug();
  }

  debug() {
    // DEBUG ONLY
    const rectangle = new Konva.Rect({
      x: this.positionX,
      y: this.positionY,
      width: 100,
      height: 100,
      fill: "green",
      stroke: "black",
      strokeWidth: 1,
      draggable: false,
    });
    this.videoLayer.add(rectangle);
  }

  async sendCanvasPayload(renderTask: RenderTask) {
    if (!this.port) {
      return console.log("Undefined Worker");
    }
    this.port.postMessage(renderTask);
  }

  setupSharedWorker() {
    if (typeof SharedWorker !== "undefined") {
      console.log("Shared Workers are supported in this browser.");
      // Debug chrome://inspect/#workers
      this.diffusionWorker = new DiffusionSharedWorkerClient(
        "src\\KonvaApp\\SharedWorkers\\Diffusion\\DiffusionSharedWorker.ts",
        this.onRenderingSystemMessageRecieved,
      );

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

  public addNodes(node: VideoNode | ImageNode) {
    if (node instanceof VideoNode) {
      this.videoNodes.push(node);
    } else if (node instanceof ImageNode) {
      this.imageNodes.push(node);
    }
  }

  public removeNodes(node: VideoNode) {
    const index = this.videoNodes.indexOf(node);
    if (index > -1) {
      this.videoNodes.splice(index, 1);
      this.videoLayer.draw();
    }
  }

  // Do a bunch of precondition checks and error out early on.
  public async startProcessing(renderingOptions: RenderingOptions) {
    // Start processing and lock everything

    this.isProcessing = true;

    try {
      // or not loaded
      if (this.videoNodes.length + this.imageNodes.length < 1) {
        throw Error("Must have atleast Media item on the board.");
      }
      // error out if nodes are not all loaded.
      // todo remove when we have error handling + and ui
      var failed = false;
      for (let i = 0; i < this.videoNodes.length; i++) {
        const item = this.videoNodes[i];
        item.kNode.listening(false);
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
        throw Error("Wait For Items to Finish Processing.");
      }

      this.videoNodes.forEach((item: VideoNode) => {});

      // find the longest video node
      let numberOfFrames = this.findLongestVideoLength();
      numberOfFrames = Math.min(numberOfFrames, this.upperMaxFrames);
      console.log(`Number Of Frames: ${numberOfFrames}`);

      await this.render(numberOfFrames, renderingOptions);
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      this.isProcessing = false;

      // enable all nodes again.
      for (let i = 0; i < this.videoNodes.length; i++) {
        const item = this.videoNodes[i];
        item.kNode.listening(true);
      }
    }
  }

  public stopProcessing() {
    this.isProcessing = false;
  }

  // find the frame time given the frame number
  private calculateFrameTime(frameNumber: number, frameRate: number): number {
    return frameNumber / frameRate;
  }

  /** 
  find longest video
  then seek through each node 1 step.
  stop ignore stepping if the duration is less.
  **/
  private async render(
    largestNumberOfFrames: number,
    renderingOptions: RenderingOptions,
  ) {
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

    // only pick nodes that intersect with the canvas on screen bounds to freeze.

    for (let j = 0; j < largestNumberOfFrames; j++) {
      // Seek Video Nodes first then draw
      let frameTime = undefined;

      for (let i = 0; i < this.videoNodes.length; i++) {
        const currentVideoNode = this.videoNodes[i];
        frameTime = this.calculateFrameTime(j, currentVideoNode.fps);
        frameTime = parseFloat(frameTime.toFixed(2));
        if (frameTime < currentVideoNode.duration) {
          // console.log(`CurrentFrame:${j}`);
          // console.log(`FrameTime:${frameTime}`);
          // console.log(`Duration:${currentVideoNode.duration}`);
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
          // TODO write the non webworker version

          // const blob = await this.offScreenCanvas.convertToBlob({
          //   quality: 1.0,
          //   type: "image/jpeg",
          // });

          //await this.blobToFile(blob, `${j}`);
        } // end of for each frame
      } else {
        // decode on the shared webworker.
        if (!this.context) {
          console.log("Context Didn't Initialize");
          return;
        }

        if (!this.diffusionWorker) {
          console.log("Didn't Initialize Diffusion");
          return;
        }

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

        // Test remove later.
        // const largestNumberOfFrames = 4;

        const data: DiffusionSharedWorkerItemData = {
          height: this.height,
          width: this.width,
          imageBitmap: this.offScreenCanvas.transferToImageBitmap(),
          frame: j,
          totalFrames: largestNumberOfFrames,
          prompt: renderingOptions,
        };

        let isDoneStreaming = false;

        console.log(`Processing Frame:${j} out of ${largestNumberOfFrames}`);

        if (j == Math.floor(largestNumberOfFrames)) {
          isDoneStreaming = true;
        }

        console.log(isDoneStreaming);

        this.diffusionWorker.sendData(1, data, isDoneStreaming);

        // To ensure there is no lingering frames.
        if (isDoneStreaming) {
          console.log("Done streaming");
          break;
        }
      }
    }
  }
}
