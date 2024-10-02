import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import { NetworkedNodeContext } from "./NetworkedNodeContext";
import { uiAccess } from "~/signals";
import { NodeTransformer, SelectionManager } from "../NodesManagers";
import { Position, Size } from "../types";
import ChromaWorker from "./ChromaWorker?sharedworker";

// const toolbarNode = uiAccess.toolbarNode;
const loadingBar = uiAccess.loadingBar;

interface VideoNodeContructor {
  mediaLayer: Layer;
  position: Position;
  canvasSize: Size;
  videoURL: string;
  selectionManagerRef: SelectionManager;
  nodeTransformerRef: NodeTransformer;
}

export class VideoNode extends NetworkedNodeContext {
  public videoURL: string;
  public videoComponent: HTMLVideoElement;

  // Use Context Menu Item
  public duration: number = 0;
  private imageIndex: number = 0;
  public fps: number = 24;

  // This locks interaction when the render engine is rendering
  private videoCanvas: OffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D | null;
  chromaWorker: SharedWorker | undefined;
  drawingCanvas: OffscreenCanvas;
  drawingContext: OffscreenCanvasRenderingContext2D | null;
  blockSeeking: boolean;

  isChroma: boolean;
  chromaRed: number = 120;
  chromaGreen: number = 150;
  chromaBlue: number = 120;

  private imageSources: string[] = [
    "https://images-ng.pixai.art/images/orig/7ef23baa-2fc8-4e2f-8299-4f9241920090",
    "https://images-ng.pixai.art/images/orig/98196e9f-b968-4fe1-97ec-083ffd77c263",
    "https://images-ng.pixai.art/images/orig/a05a49dd-6764-4bfe-902f-1dfad67e49c9",
    "https://images-ng.pixai.art/images/orig/a449179c-c549-4627-8806-49dc5a30c429",
    "https://images-ng.pixai.art/images/orig/809eafc6-79c8-4c7a-89cd-bfc7ab39f142",
    "https://images-ng.pixai.art/images/orig/5f004e09-e3ac-4461-b2b1-0d70f2255c34",
    "https://images-ng.pixai.art/images/orig/56dcbb5f-7a31-4328-b4ea-1312df6e77a0",
    "https://videos.pixai.art/f7df019d-79a2-4ed2-bb99-775c941f7ec6",
  ];

  private frameDidFinishSeeking: Promise<void>;
  private finishedLoadingOnStart: Promise<void>;

  async setProcessing() {
    this.isProcessing = true;
  }

  getNumberFrames(): number {
    return this.fps * this.duration;
  }
  public getChroma() {
    return {
      isChromakeyEnabled: this.isChroma,
      chromakeyColor: {
        red: this.chromaRed,
        green: this.chromaGreen,
        blue: this.chromaBlue,
      },
    };
  }
  public setChroma(isChroma: boolean) {
    this.isChroma = isChroma;

    if (this.isChroma === false) {
      this.kNode?.image(this.videoComponent);
    } else {
      this.kNode?.image(this.videoCanvas);
      if (this.videoComponent.paused || this.videoComponent.ended) {
        this.chromaKeyRender(0, false, false, true);
      } else {
        this.chromaKeyRender(0);
      }
    }
  }

  public setChromaColor(red: number, green: number, blue: number) {
    this.chromaRed = red;
    this.chromaGreen = green;
    this.chromaBlue = blue;
  }

  constructor({
    mediaLayer,
    position,
    canvasSize,
    videoURL,
    selectionManagerRef,
    nodeTransformerRef,
  }: VideoNodeContructor) {
    // kNodes need to be created first to guaruntee it is not undefined in parent's context
    const kNode = new Konva.Image({
      image: undefined,
      x: position.x,
      y: position.y,
      width: 200, // to do fix this with placeholder
      height: 200,
      draggable: true,
      fill: "grey",
    });

    super({
      nodeTransfomerRef: nodeTransformerRef,
      selectionManagerRef: selectionManagerRef,
      mediaLayer: mediaLayer,
      kNode: kNode,
    });
    this.mediaLayer.add(this.kNode);

    // state manage the node
    // use web codecs to get the frame rate 89% support
    // assume 60fps for now.
    this.fps = 24; // need to query this from the media
    this.duration = -1; // video duration

    this.videoURL = videoURL;
    this.videoComponent = document.createElement("video");
    this.videoComponent.crossOrigin = "anonymous";

    this.videoCanvas = new OffscreenCanvas(1280, 720);
    this.drawingCanvas = new OffscreenCanvas(1280, 720);

    this.context = this.videoCanvas.getContext("2d");
    this.drawingContext = this.drawingCanvas.getContext("2d");

    // Wrapping events
    this.frameDidFinishSeeking = new Promise<void>(() => {});
    this.finishedLoadingOnStart = new Promise<void>(() => {});

    this.blockSeeking = false;

    this.isChroma = false;

    this.videoComponent.onloadstart = (event: Event) => {
      loadingBar.show();
      loadingBar.updateProgress(0);
    };
    this.videoComponent.onloadedmetadata = (event: Event) => {
      loadingBar.updateProgress(25);
      console.log("Loaded Metadata");
      if (!this.kNode) {
        console.log("KNode Not Initialized Video Component");
        return;
      }

      const renderSize = this.calculateRenderSizeOnLoad({
        componentSize: {
          width: this.videoComponent.videoWidth,
          height: this.videoComponent.videoHeight,
        },
        maxSize: canvasSize,
      });

      this.kNode.image(this.videoComponent);
      this.kNode.setSize(renderSize);

      this.videoComponent.currentTime = 0; // ensure it shows up on screen
      // it might have length here which we will need to trim down to 7 seconds.
      console.log(`Video Duration: ${this.videoComponent.duration}`);
      this.duration = this.videoComponent.duration;
      this.kNode.fill(null);
      loadingBar.updateProgress(50);
    };

    this.videoComponent.onerror = (
      event: Event | string,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error,
    ) => {
      loadingBar.hide();
      loadingBar.updateProgress(0);
      console.error("Error loading video:", event);
    };

    this.finishedLoadingOnStart = new Promise<void>((resolve, reject) => {
      this.videoComponent.oncanplaythrough = (event: Event) => {
        this.didFinishLoading = true;
        // Might have to auto click? on first load this doesn't work in general how about after ?
        loadingBar.updateProgress(100);
        loadingBar.hide();

        this.setChroma(this.isChroma);
        resolve();
      };
    });

    // assign video to start process.
    this.videoComponent.src = this.videoURL;

    this.listenToBaseKNode();
    // only for video
    this.kNode.on("mouseup", () => {
      console.log("Mouse Up");
      // Shouldn't play if anything things are true
      if (this.didFinishLoading == false) {
        return;
      }
      if (this.isProcessing == true) {
        return;
      }

      if (this.videoComponent.paused) {
        console.log("Playing");
        this.videoComponent.play();
        this.chromaKeyRender(0); // For starting Chroma
      } else {
        console.log("Pause");
        this.videoComponent.pause();
      }
    });

    this.createChromaWorker();
  }

  uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (
        +c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
      ).toString(16),
    );
  }

  createChromaWorker() {
    this.chromaWorker = new ChromaWorker({
      name: "ChromaWorker-" + this.uuidv4(),
    });
    this.chromaWorker.port.start();
  }

  async reset() {
    this.videoComponent.pause();
    await this.seek(0);
  }

  async chromaKeyRender(
    _timestamp: number | undefined,
    doLoop: boolean = true,
    stopLoopIfVideoIsPausedOrEnded: boolean = true,
    blockSeeking: boolean = false,
  ) {
    if (this.isChroma === false) return;
    if (this.videoComponent !== undefined) {
      if (stopLoopIfVideoIsPausedOrEnded)
        if (this.videoComponent.paused || this.videoComponent.ended) return;
      if (this.drawingContext != null) {
        if (
          this.videoCanvas.width !== this.videoComponent.videoWidth ||
          this.videoCanvas.height !== this.videoComponent.videoHeight ||
          this.drawingCanvas.width !== this.videoComponent.videoWidth ||
          this.drawingCanvas.height !== this.videoComponent.videoHeight
        ) {
          this.videoCanvas.width = this.videoComponent.videoWidth;
          this.videoCanvas.height = this.videoComponent.videoHeight;
          this.drawingCanvas.width = this.videoComponent.videoWidth;
          this.drawingCanvas.height = this.videoComponent.videoHeight;
        }
        if (blockSeeking) {
          this.blockSeeking = true;
        }

        this.drawingContext.drawImage(
          this.videoComponent,
          0,
          0,
          this.drawingCanvas.width,
          this.drawingCanvas.height,
        );

        const dataTransfer = this.drawingCanvas.transferToImageBitmap();

        await this.waitForWorkerResponse(dataTransfer, blockSeeking);
      } else {
        console.error("Context does not exist!");
      }
    } else {
      console.error("Video component does not exist!");
    }

    if (doLoop) requestAnimationFrame(this.chromaKeyRender.bind(this));
  }

  // Method to post the message and wait for the response
  async waitForWorkerResponse(
    dataTransfer: ImageBitmap,
    blockSeeking: boolean,
  ) {
    return new Promise<void>((resolve, reject) => {
      // Add an event listener for the worker response
      const onMessage = (event: MessageEvent) => {
        const { imageData } = event.data;
        this.context?.putImageData(imageData, 0, 0);
        this.mediaLayer.draw();
        if (this.blockSeeking) {
          this.blockSeeking = false;
        }

        // Clean up the event listener after receiving the message
        this.chromaWorker?.port.removeEventListener("message", onMessage);
        resolve();
      };

      // Attach the event listener
      this.chromaWorker?.port.addEventListener("message", onMessage);

      // Send the data to the worker
      this.chromaWorker?.port.postMessage(
        {
          dataTransfer: dataTransfer,
          color: {
            red: this.chromaRed,
            green: this.chromaGreen,
            blue: this.chromaBlue,
          },
        },
        [dataTransfer],
      );
    });
  }

  async updateImage(newImageSrc: string) {
    const newImage = new Image();
    newImage.src = newImageSrc;
    newImage.onload = () => {
      if (!this.kNode) {
        console.log("selectedNode KNode is initialized");
        return;
      }
      this.kNode.image(newImage);
      this.kNode.draw();
    };
  }

  public async createVideoElement(newURL: string) {
    // try catch here with a retry button.
    if (!this.kNode) {
      console.log("selectedNode KNode is initialized");
      return;
    }
    this.kNode.fill("grey"); // todo fix with loader
    const videoComponent = document.createElement("video");
    videoComponent.crossOrigin = "anonymous";

    // Update to use image.
    videoComponent.src = newURL;
    console.log("Video Data");
    console.log(newURL);

    videoComponent.onloadstart = (event: Event) => {
      this.didFinishLoading = false;
      console.log("OnLoadStart");
    };

    videoComponent.onloadedmetadata = (event: Event) => {
      console.log("Loaded Metadata");
      if (!this.kNode) {
        console.log("selectedNode KNode is initialized");
        return;
      }
      this.kNode.width(videoComponent.videoWidth);
      this.kNode.height(videoComponent.videoHeight);
      this.kNode.image(videoComponent);
      // it might have length here which we will need to trim down to 7 seconds.
      console.log(`Video Duration: ${videoComponent.duration}`);
      videoComponent.currentTime = 0; // ensure it shows up on screen
      this.duration = videoComponent.duration;
      this.videoComponent = videoComponent;
    };
  }

  async simulatedLoading() {
    // need to block playing while loading
    this.didFinishLoading = false;

    console.log(this.imageIndex);

    if (this.imageIndex == 0) {
      loadingBar.show();
    }

    await this.updateImage(this.imageSources[this.imageIndex]);
    this.imageIndex = this.imageIndex + 1;

    this.updateLoadingBarPosition();

    loadingBar.updateMessage("Generating");

    if (this.imageIndex == this.imageSources.length - 1) {
      // show final video
      console.log("Final Video Element");
      await this.createVideoElement(
        this.imageSources[this.imageSources.length - 1],
      );
      console.log("Done Video Element");
    }

    if (this.imageIndex < this.imageSources.length - 1) {
      loadingBar.updateProgress(
        (this.imageIndex / this.imageSources.length) * 100,
      );
      setTimeout(this.simulatedLoading.bind(this), 500); // Update every second
    }
  }

  // use sub milisecond for frames.
  async seek(second: number) {
    // prevent interaction

    if (this.didFinishLoading === false) {
      console.log("Didn't finish loading so cannot seek");
      return;
    }

    if (this.videoComponent.seekable) {
      if (!this.videoComponent) {
        console.log("Didn't setup Video Component?");
        return;
      }
      //console.log(`Seeking to Position ${second}`);

      this.videoComponent.currentTime = second;

      this.frameDidFinishSeeking = new Promise<void>((resolve, reject) => {
        this.videoComponent.onseeked = async (event: Event) => {
          //console.log("Seeked Finished");
          // reimplement using the function
          // ensure that this doesn't race.
          await this.chromaKeyRender(0, false, false, true);
          resolve();
        };
      });
      await this.frameDidFinishSeeking;
    } else {
      console.log("Video Not Seekable");
    }
  }
}
