import Konva from "konva";
import { v4 as uuidv4 } from "uuid";

import { NetworkedNode, UploadStatus } from "./NetworkedNode";
import { uiAccess } from "~/signals";
import ChromaWorker from "./ChromaWorker?sharedworker";
import { transparent, NodeType } from "./constants";
import { SelectionManager } from "../NodesManagers";
import {
  Position,
  Size,
  NodeData,
  TransformationData,
  RGBColor,
} from "../types";
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
  extractionURL?: string;
  transform?: TransformationData;
  isChroma?: boolean;
  chormaColor?: RGBColor;
}

export class VideoNode extends NetworkedNode {
  public kNode: Konva.Image;
  public videoURL: string;
  public extractionURL: string | undefined;
  public videoComponent: HTMLVideoElement;
  protected _isVideoEventListening: boolean = false;

  // Use Context Menu Item
  public duration: number = 0;
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
  chromaColor: RGBColor;

  // todo move to seg manager
  selectedPointsForSegmentation: Coordinates[] = [];

  private videoSegmentationAPI = new SegmentationApi();

  private frameDidFinishSeeking: Promise<void>;

  public isSegmentationMode: boolean = false;
  private segmentationSession: { session_id: string } | undefined = undefined;

  constructor({
    mediaLayerRef,
    canvasPosition,
    canvasSize,
    videoURL,
    extractionURL,
    isChroma,
    chormaColor,
    selectionManagerRef,
    transform: existingTransform,
  }: VideoNodeContructor) {
    const transform = NodeUtilities.getInitialTransform({
      existingTransform,
      canvasPosition,
      canvasSize,
    });
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
    this.extractionURL = extractionURL;
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
    this.isChroma = isChroma ?? false;
    this.chromaColor = chormaColor ?? {
      red: 120,
      blue: 150,
      green: 120,
    };

    this.loadVideoFromUrl({
      mediaFileUrl: this.videoURL,
      existingTransform,
      canvasPosition,
      canvasSize,
    });

    this.listenToBaseKNode();

    // TODO: for controling video playpause, can be improved with bette ui
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
        // console.log("Not Playing because Segmenting");
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
  private async loadVideoFromUrl({
    mediaFileUrl,
    existingTransform,
    canvasSize,
    canvasPosition,
  }: {
    mediaFileUrl: string;
    existingTransform?: TransformationData;
    canvasSize?: Size;
    canvasPosition?: Position;
  }) {
    if (!this._isVideoEventListening) {
      this.videoComponent.onloadstart = () => {
        this.setProgress(25, UploadStatus.LOADING);
      };
      this.videoComponent.onloadedmetadata = () => {
        this.setProgress(50, UploadStatus.LOADING);
        console.log("Loaded Metadata");
        this.mediaFileSize = {
          width: this.videoComponent.videoWidth,
          height: this.videoComponent.videoHeight,
        };
        if (!existingTransform && canvasSize && canvasPosition) {
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
        this.setProgress(75, UploadStatus.LOADING);
      };

      this.videoComponent.onerror = () =>
        // event: Event | string,
        // source?: string,
        // lineno?: number,
        // colno?: number,
        // error?: Error,
        {
          this.setProgress(0, UploadStatus.ERROR_ON_LOAD);
        };
    }
    //can play through
    this.finishedLoadingOnStart = new Promise<void>((resolve, reject) => {
      this.videoComponent.oncanplaythrough = () => {
        this.didFinishLoading = true;
        this.setProgress(100, UploadStatus.SUCCESS);
        this.setChroma(this.isChroma);
        resolve();
      };
    });
    this.videoComponent.src = mediaFileUrl;
    try {
      await this.finishedLoadingOnStart;
      console.log("Finished Loading, Can play through");
    } catch (err) {
      //nothing
    }
  }

  async setProcessing() {
    this.isProcessing = true;
  }
  async reset() {
    this.videoComponent.pause();
    await this.seek(0);
  }
  getNumberFrames(): number {
    return this.fps * this.duration;
  }
  public getChroma() {
    return {
      isChromakeyEnabled: this.isChroma,
      chromakeyColor: this.chromaColor,
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
    this.chromaColor = {
      red,
      green,
      blue,
    };
  }

  createChromaWorker() {
    this.chromaWorker = new ChromaWorker({
      name: "ChromaWorker-" + uuidv4(),
    });
    this.chromaWorker.port.start();
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
          color: this.chromaColor,
        },
        [dataTransfer],
      );
    });
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

  public async startSegmentation() {
    if (this.segmentationSession === undefined) {
      this.didFinishLoading = false;
      this.videoComponent.pause();
      this.videoComponent.currentTime = 0;
      this.selectionManagerRef.updateContextComponents(this);
      this.selectionManagerRef.showContextComponents(this);
      loadingBar.update({
        progress: 25,
        message: "Loading Video Extractor...",
      });

      console.log("loadingbar should show");

      const blob = await NodeUtilities.urlToBlob(this.videoURL);
      loadingBar.update({
        progress: 75,
        message: "Loading Video Extractor...",
      });
      this.segmentationSession =
        await this.videoSegmentationAPI.createSession(blob);
      console.log("Sessions", this.segmentationSession);

      // this.didFinishLoading = true;
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
    uiAccess.toolbarNode.update({
      locked: this.isLocked(),
      lockDisabled: this.isSegmentationMode,
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
    uiAccess.toolbarNode.update({
      locked: this.isLocked(),
      lockDisabled: this.isSegmentationMode,
      buttonStates: buttonStates,
    });
  }

  private isStillProcessingSegmentationEvent: Boolean = false;

  public async handleSegmentation() {
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
    console.log("mediaFileSize:", this.mediaFileSize);
    if (!localPos || !this.mediaFileSize) {
      return;
    }
    const adjustedLocalPos = {
      x:
        (localPos.x / this.kNode.width()) *
        this.kNode.scaleX() *
        this.mediaFileSize.width,
      y:
        (localPos.y / this.kNode.height()) *
        this.kNode.scaleY() *
        this.mediaFileSize.height,
    };
    // handle undo as well.
    this.selectedPointsForSegmentation.push({
      coordinates: [adjustedLocalPos.x, adjustedLocalPos.y],
      include: true,
    });

    loadingBar.update({ progress: 0, message: "Start Processing Mask" });
    try {
      console.log("Requesting");
      const response = await this.videoSegmentationAPI.addPointsToSession(
        this.segmentationSession.session_id,
        24,
        [
          {
            timestamp: 0,
            objects: [
              {
                style: {
                  color: [0, 0, 1],
                },
                object_id: 0,
                points: this.selectedPointsForSegmentation,
              },
            ],
          },
        ],
        false,
      );
      loadingBar.update({ progress: 50, message: "Processing" });
      const previewImageUrl = response.frames[0].preview_image_url;

      // TODO: we assumed success of the loading of the AssetUrl
      await NodeUtilities.isAssetUrlAvailable({ url: previewImageUrl });
      loadingBar.update({ progress: 50, message: "Processing..." });
      await this.setSegementationPreview(previewImageUrl);
      loadingBar.update({ progress: 100, message: "Masking Region Done" });
    } catch (error) {
      console.error(error);
      loadingBar.update({
        progress: 0,
        message: `Error:${error} Please try picking extraction points again`,
      });
    }
    this.disableAllExceptSegmentation();
    this.isStillProcessingSegmentationEvent = false;
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
    loadingBar.update({ progress: 0, message: "Processing Video..." });

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
            timestamp: 0,
            objects: [
              {
                style: {
                  color: [0, 0, 1],
                },
                object_id: 0,
                points: this.selectedPointsForSegmentation,
              },
            ],
          },
        ],
        true, // propagation = true, this requests the entire video to be processed
      );
      loadingBar.update({ progress: 25, message: "Processing Video..." });

      // replace the video component and reregister all the other elements.
      console.log(
        "Masked Video URL",
        response["masked_video_cdn_url"],
        response,
      );
      // TODO: we assume the URL to be checked will eventually return true
      const videoUrl = response["masked_video_cdn_url"];
      await NodeUtilities.isAssetUrlAvailable({
        url: videoUrl,
        sleepDurationMs: 2000,
      });
      loadingBar.update({ progress: 50, message: "Processing Video..." });

      // set chroma automatically.
      this.isChroma = true;
      await this.loadVideoFromUrl({ mediaFileUrl: videoUrl });

      // loadingBar.updateProgress(100);

      // loadingBar.hide();
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

  private async setSegementationPreview(previewImageUrl: string) {
    const imageObj = new Image();

    const imageLoadPromise = new Promise<void>((resolve, reject) => {
      imageObj.onload = () => {
        this.kNode.image(imageObj);
        this.mediaLayerRef.draw();
        resolve();
      };
      imageObj.onerror = () => {
        reject("Image Failed To Load");
      };
    });
    imageObj.src = previewImageUrl;
    return imageLoadPromise;
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

      // video specific values
      videoNodeData: {
        mediaFileUrl: this.videoURL,
        mediaFileToken: this.mediaFileToken,
        isChroma: this.isChroma,
        chromaColor: this.chromaColor,
        extractionURL: this.extractionURL,
      },
    };
    return data;
  }

  // BACKUPS

  // 1. DUMMY VIDEO with IMAGES
  // private imageIndex: number = 0;
  // private imageSources: string[] = [
  //   "https://images-ng.pixai.art/images/orig/7ef23baa-2fc8-4e2f-8299-4f9241920090",
  //   "https://images-ng.pixai.art/images/orig/98196e9f-b968-4fe1-97ec-083ffd77c263",
  //   "https://images-ng.pixai.art/images/orig/a05a49dd-6764-4bfe-902f-1dfad67e49c9",
  //   "https://images-ng.pixai.art/images/orig/a449179c-c549-4627-8806-49dc5a30c429",
  //   "https://images-ng.pixai.art/images/orig/809eafc6-79c8-4c7a-89cd-bfc7ab39f142",
  //   "https://images-ng.pixai.art/images/orig/5f004e09-e3ac-4461-b2b1-0d70f2255c34",
  //   "https://images-ng.pixai.art/images/orig/56dcbb5f-7a31-4328-b4ea-1312df6e77a0",
  //   "https://videos.pixai.art/f7df019d-79a2-4ed2-bb99-775c941f7ec6",
  // ];

  // async updateImage(newImageSrc: string) {
  //   const newImage = new Image();
  //   newImage.src = newImageSrc;
  //   newImage.onload = () => {
  //     if (!this.kNode) {
  //       console.log("selectedNode KNode is initialized");
  //       return;
  //     }
  //     this.kNode.image(newImage);
  //     this.kNode.draw();
  //   };
  // }
  // async simulatedLoading() {
  //   // need to block playing while loading
  //   this.didFinishLoading = false;

  //   console.log(this.imageIndex);

  //   if (this.imageIndex == 0) {
  //     loadingBar.show();
  //   }

  //   await this.updateImage(this.imageSources[this.imageIndex]);
  //   this.imageIndex = this.imageIndex + 1;

  //   // this.updateLoadingBarPosition();

  //   loadingBar.updateMessage("Generating");

  //   if (this.imageIndex == this.imageSources.length - 1) {
  //     // show final video
  //     console.log("Final Video Element");
  //     await this.createVideoElement(
  //       this.imageSources[this.imageSources.length - 1],
  //     );
  //     console.log("Done Video Element");
  //   }

  //   if (this.imageIndex < this.imageSources.length - 1) {
  //     loadingBar.updateProgress(
  //       (this.imageIndex / this.imageSources.length) * 100,
  //     );
  //     setTimeout(this.simulatedLoading.bind(this), 500); // Update every second
  //   }
  // }
}
