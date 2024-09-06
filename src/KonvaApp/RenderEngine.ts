import { faL } from "@fortawesome/pro-thin-svg-icons";
import { VideoNode } from "./Nodes/VideoNode";

export class RenderEngine {
  private videoNodes: VideoNode[];
  private offScreenCanvas: OffscreenCanvas;
  private context: OffscreenCanvasRenderingContext2D | null;
  private isProcessing: boolean;

  private frameLength: number;
  private frames: ImageBitmap[];
  constructor(offScreenCanvas: OffscreenCanvas) {
    this.videoNodes = [];
    this.offScreenCanvas = offScreenCanvas;
    this.context = this.offScreenCanvas.getContext("2d");
    this.isProcessing = false;
    this.frames = [];
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

    // find the longest video
    const numberOfFrames = this.findLongestVideoLength();
    this.processFrame();
  }

  public stopProcessing() {
    this.isProcessing = false;
  }

  // find the frame time given the frame number
  private calculateFrameTime(frameNumber: number, frameRate: number): number {
    return frameNumber / frameRate;
  }

  private async processFrame() {
    if (!this.isProcessing) return;

    this.videoNodes.forEach((videoNode: VideoNode) => {
      videoNode.stop();
      const numberOfFrames = videoNode.getNumberFrames();

      for (let i = 0; i <= numberOfFrames; i++) {
        const frameTime = this.calculateFrameTime(i, videoNode.fps);

        console.log(i);
        console.log(frameTime);
        console.log(videoNode.duration);

        if (frameTime < videoNode.duration) {
          videoNode.seek(frameTime, () => {
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
              //   this.offScreenCanvas.convertToBlob().then((blob) => {
              //     // Save or process the blob as needed
              //     console.log("Frame saved as blob:", blob);
              //     this.blobToFile(blob);
              //   });
            }
          }); // end of seek
        } // end of if
      } // end of for.
    });

    console.log(frames);
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
