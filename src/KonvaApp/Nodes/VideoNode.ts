import Konva from "konva";
import { NetworkedNode } from "./NetworkedNode";
import { uiAccess } from "~/signals";
import ChromaWorker from "./ChromaWorker?sharedworker";
import { v4 as uuidv4 } from "uuid";
// const toolbarNode = uiAccess.toolbarNode;
import { minNodeSize, transparent, NodeType } from "./constants";
import { SelectionManager } from "../NodesManagers";
import { Position, Size, NodeData, TransformationData } from "../types";
import { NodeUtilities } from "./NodeUtilities";

const loadingBar = uiAccess.loadingBar;
import {
  Coordinates,
  SegmentationApi,
} from "~/Classes/ApiManager/SegmentationApi";
import { ToolbarNodeButtonNames } from "~/components/features/ToolbarNode/enums";
interface VideoNodeContructor {
  mediaLayerRef: Konva.Layer;
  canvasPosition: Position;
  canvasSize: Size;
  videoURL: string;
  selectionManagerRef: SelectionManager;
  transform?: TransformationData;
}

export class VideoNode extends NetworkedNode {
  public kNode: Konva.Image;
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
  finishedLoadingOnStart?: Promise<void>;

  isChroma: boolean;
  chromaRed: number = 120;
  chromaGreen: number = 150;
  chromaBlue: number = 120;

  // todo move to seg manager
  selectedPointsForSegmentation: Coordinates[] = [];

  private videoSegmentationAPI = new SegmentationApi();
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
  // private finishedLoadingOnStart: Promise<void>;
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
    mediaLayerRef,
    canvasPosition,
    canvasSize,
    videoURL,
    selectionManagerRef,
    transform: existingTransform,
  }: VideoNodeContructor) {
    const transform = existingTransform
      ? {
          ...existingTransform,
          position: {
            x: existingTransform.position.x + canvasPosition.x,
            y: existingTransform.position.y + canvasPosition.y,
          },
          fill: transparent,
        }
      : {
          position: NodeUtilities.positionNodeOnCanvasCenter({
            canvasOffset: canvasPosition,
            componentSize: minNodeSize,
            maxSize: canvasSize,
          }),
          size: minNodeSize,
          fill: "gray",
        };
    // kNodes need to be created first to guaruntee it is not undefined in parent's context
    const kNode = new Konva.Image({
      image: undefined,
      // to do fix this with placeholder
      ...transform,
      draggable: true,
      strokeScaleEnabled: false,
    });

    super({
      selectionManagerRef: selectionManagerRef,
      mediaLayerRef: mediaLayerRef,
      kNode: kNode,
    });
    this.kNode = kNode;
    this.mediaLayerRef.add(this.kNode);

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

      if (!existingTransform) {
        const adjustedSize = NodeUtilities.adjustNodeSizeToCanvas({
          componentSize: {
            width: this.videoComponent.videoWidth,
            height: this.videoComponent.videoHeight,
          },
          maxSize: canvasSize,
        });
        const centerPosition = NodeUtilities.positionNodeOnCanvasCenter({
          canvasOffset: canvasPosition,
          componentSize: adjustedSize,
          maxSize: canvasSize,
        });
        this.kNode.setSize(adjustedSize);
        this.kNode.setPosition(centerPosition);
      }

      this.kNode.image(this.videoComponent);
      this.videoComponent.currentTime = 0; // ensure it shows up on screen
      // it might have length here which we will need to trim down to 7 seconds.
      console.log(`Video Duration: ${this.videoComponent.duration}`);
      this.duration = this.videoComponent.duration;
      this.kNode.fill(transparent);
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
    this.kNode.on("click", () => {
      console.log("click");
      // Shouldn't play if anything things are true
      if (this.didFinishLoading == false) {
        return;
      }
      if (this.isProcessing == true) {
        return;
      }

      if (this.isSegmentationMode) {
        console.log("Not Playing because Segmenting");
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

    // Testing code for segmentation
    //this.videoSegmentationMode(true);
  }

  createChromaWorker() {
    this.chromaWorker = new ChromaWorker({
      name: "ChromaWorker-" + uuidv4(),
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
        this.mediaLayerRef.draw();
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
      console.log("selectedNode KNode is not initialized");
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
      loadingBar.show();
      loadingBar.updateProgress(0);
      console.log("OnLoadStart");
    };

    videoComponent.onerror = (
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
      videoComponent.oncanplaythrough = (event: Event) => {
        this.didFinishLoading = true;
        // Might have to auto click? on first load this doesn't work in general how about after ?
        loadingBar.updateProgress(100);
        loadingBar.hide();

        this.setChroma(this.isChroma);

        resolve();
      };
    });

    videoComponent.onloadedmetadata = (event: Event) => {
      console.log("Loaded Metadata");
      loadingBar.updateProgress(25);
      if (!this.kNode) {
        console.log("selectedNode KNode is not initialized");
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
      // make this transparent.
      this.kNode.fill(transparent);
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

    // this.updateLoadingBarPosition();

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
      this.videoComponent.pause();
      this.videoComponent.currentTime = second;

      this.frameDidFinishSeeking = new Promise<void>((resolve, reject) => {
        this.videoComponent.onseeked = async (event: Event) => {
          console.log("Seeked Finished");
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

  public isSegmentationMode: boolean = false;

  public videoSegmentationMode(on: boolean) {
    if (on) {
      this.removeListenToBaseKNode();
      this.kNode.on("click", this.handleSegmentation.bind(this));
      this.isSegmentationMode = true;
    } else {
      this.isSegmentationMode = false;
      this.kNode.off("click", this.handleSegmentation.bind(this));
      this.listenToBaseKNode();
    }
  }

  private segmentationSession: { session_id: string } | undefined = undefined;

  public async urlToBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource: ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Function to check if the URL returns a 200 status
  public async checkUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      return response.status === 200;
    } catch (error) {
      console.error("Error fetching URL:", error);
      return false;
    }
  }

  // to do debug code

  public async startSegmentation() {
    if (this.segmentationSession === undefined) {
      await this.seek(0);

      loadingBar.show();
      loadingBar.updateProgress(0);

      const blob = await this.urlToBlob(this.videoURL);
      this.segmentationSession =
        await this.videoSegmentationAPI.createSession(blob);
      console.log("Sessions", this.segmentationSession);
      loadingBar.updateMessage("Start Adding Mask Points To the Video");
      loadingBar.updateProgress(100);
    }
  }

  public disableAllExceptSegmentation() {
    const buttonNames = Object.values(ToolbarNodeButtonNames);
    const buttonStates: any = {};
    for (const name of buttonNames) {
      const value = name === ToolbarNodeButtonNames.SEGMENTATION ? false : true;

      buttonStates[name] = {
        disabled: value,
        active: false,
      };
    }
    uiAccess.toolbarNode.show({
      buttonStates: buttonStates,
    });
  }

  public disableAllForSegmentation() {
    const buttonNames = Object.values(ToolbarNodeButtonNames);
    const buttonStates: any = {};
    for (const name of buttonNames) {
      buttonStates[name] = {
        disabled: name,
        active: false,
      };
    }
    uiAccess.toolbarNode.show({
      buttonStates: buttonStates,
    });
  }

  private isStillProcessingSegmentationEvent: Boolean = false;

  public async handleSegmentation(event) {
    // Get the local coordinates of the click relative to the rectangle
    if (!this.isSegmentationMode) {
      console.log("Segmentation Mode Not On");
      return;
    }

    this.disableAllForSegmentation();

    if (!this.segmentationSession) {
      console.log("Segmentation Session Not Ready");
      loadingBar.updateMessage("Still Processing Please Wait");
      return;
    }
    if (this.isStillProcessingSegmentationEvent) {
      console.log("Still Processing");
      loadingBar.updateMessage("Still Processing Please Wait");
      return;
    }
    this.isStillProcessingSegmentationEvent = true;
    loadingBar.show();
    const localPos = this.kNode.getRelativePointerPosition();
    console.log("Local coordinates:", localPos);
    if (!localPos) {
      return;
    }
    // handle undo as well.
    this.selectedPointsForSegmentation.push({
      coordinates: [localPos.x, localPos.y],
      include: true,
    });

    loadingBar.updateMessage("Start Processing Mask");
    loadingBar.updateProgress(0);
    try {
      console.log("Requesting");
      const response = await this.videoSegmentationAPI.addPointsToSession(
        this.segmentationSession.session_id,
        24,
        [
          {
            b64_image_data: 0,
            idx: 0,
            timestamp: 0,
            objects: [
              {
                style: "<mask style - default transparent>",
                object_id: 0,
                points: this.selectedPointsForSegmentation,
              },
            ],
          },
        ],
        false,
      );
      loadingBar.updateMessage("Processing");
      loadingBar.updateProgress(50);

      var image = response.frames[0].b64_image_data;

      await this.setBase64ImageForSegementationPreview(image);
      loadingBar.updateProgress(100);

      this.disableAllExceptSegmentation();
      loadingBar.updateMessage("Masking Region Done");
      this.isStillProcessingSegmentationEvent = false;
    } catch (error) {
      console.error(error);
      loadingBar.updateMessage(`Error:${error} Try Segmenting Again`);
      loadingBar.updateProgress(0);
      this.disableAllExceptSegmentation();
      this.isStillProcessingSegmentationEvent = false;
    }
  }

  async endSession(): Promise<boolean> {
    // wait for url to come through and fake load
    // edge case
    if (this.isStillProcessingSegmentationEvent) {
      console.log("Still Processing Frame Cannot Clip Please Wait");
      loadingBar.updateMessage("Still Processing Please Wait");
      return false;
    }
    // prevent requests to add points while doing this.
    this.isStillProcessingSegmentationEvent = true;
    loadingBar.updateMessage("Processing.");
    loadingBar.updateProgress(0);
    this.disableAllForSegmentation();
    if (!this.segmentationSession) {
      console.log("Segmentation Session Lost?");
      return false;
    }

    try {
      console.log("Requesting a close");
      const response = await this.videoSegmentationAPI.addPointsToSession(
        this.segmentationSession.session_id,
        24,
        [
          {
            b64_image_data: 0,
            idx: 0,
            timestamp: 0,
            objects: [
              {
                style: "<mask style - default transparent>",
                object_id: 0,
                points: this.selectedPointsForSegmentation,
              },
            ],
          },
        ],
        true, // this makes it all
      );
      loadingBar.updateProgress(25);

      console.log(response);
      // replace the video component and reregister all the other elements.
      console.log(response["masked_video_cdn_url"]); // wait using a while loop to display the result.
      // URL to check
      const videoUrl = response["masked_video_cdn_url"];
      // While loop to repeatedly check the URL

      loadingBar.updateMessage("Processing..");

      while (true) {
        const isAvailable = await this.checkUrl(videoUrl);
        if (isAvailable) {
          console.log("Video is available:", videoUrl);
          loadingBar.updateMessage("Processing...");
          loadingBar.updateProgress(50);

          break;
        }
        console.log("Video not available yet, retrying...");
        await this.sleep(2000);
      }

      loadingBar.updateProgress(75);

      // set chroma automatically.
      this.isChroma = true;
      await this.createVideoElement(videoUrl);

      loadingBar.updateProgress(100);

      loadingBar.hide();
      this.disableAllExceptSegmentation();

      this.isStillProcessingSegmentationEvent = false;
      return true;
    } catch (error) {
      console.error(error);
      this.disableAllExceptSegmentation();
      this.isStillProcessingSegmentationEvent = false;
      return false;
    }
  }

  public base64: Promise<void> | undefined;
  public async setBase64ImageForSegementationPreview(baseImage64: number) {
    const imageObj = new Image();

    this.base64 = new Promise((resolve, reject) => {
      imageObj.onload = () => {
        this.kNode.image(imageObj);
        this.mediaLayerRef.draw();
        resolve();
      };
      imageObj.onerror = () => {
        reject("Image Failed To Load");
      };
    });
    imageObj.src = `data:image/png;base64,${baseImage64}`;
  }
  public async retry() {
    console.log("Video Node has not implement retry");
  }
  public getNodeData(canvasPostion: Position) {
    const data: NodeData = {
      type: NodeType.VIDEO,
      transform: {
        position: {
          x: this.kNode.position().x - canvasPostion.x,
          y: this.kNode.position().y - canvasPostion.y,
        },
        size: this.kNode.size(),
        rotation: this.kNode.rotation(),
        scale: {
          x: this.kNode.scaleX(),
          y: this.kNode.scaleY(),
        },
        zIndex: this.kNode.getZIndex(),
      },
    };
    data.mediaFileUrl = this.videoURL;
    if (this.mediaFileToken) {
      data.mediaFileToken = this.mediaFileToken;
    }
    return data;
  }
}
