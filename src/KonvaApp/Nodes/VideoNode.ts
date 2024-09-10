import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import { NetworkedNodeContext } from "./NetworkedNodeContext";
import { v4 as uuidv4 } from "uuid";

import { uiAccess } from "~/signals";
const imageToolbar = uiAccess.imageToolbar;
const loadingBar = uiAccess.loadingBar;

export class VideoNode extends NetworkedNodeContext {
  public videoURL: string;
  public videoComponent: HTMLVideoElement;

  public node: Konva.Image;

  // do not modify internal
  public didFinishLoading: boolean;
  private videoLayer: Layer;

  public uuid: string;
  public offScreenCanvas: OffscreenCanvas;

  private shouldPlay: boolean = true;

  // Use Context Menu Item
  public duration: number = 0;
  private imageIndex: number = 0;

  public fps: number = 24;

  // This locks interaction when the render engine is rendering
  private isProcessing: boolean = false;

  async setProcessing() {
    this.isProcessing = true;
  }

  private finishedLoadingOnStart: Promise<void>;

  getNumberFrames(): number {
    return this.fps * this.duration;
  }

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
  constructor(
    uuid: string = uuidv4(),
    offScreenCanvas: OffscreenCanvas,
    videoLayer: Layer,
    x: number,
    y: number,
    videoURL: string,
  ) {
    super();

    this.shouldPlay = true; // start
    this.offScreenCanvas = offScreenCanvas;
    this.uuid = uuid;
    this.videoLayer = videoLayer;
    // state manage the node

    // use web codecs to get the frame rate 89% support
    // assume 60fps for now.
    this.fps = 24; // need to query this from the media

    this.duration = -1;

    this.didFinishLoading = false;

    this.videoURL = videoURL;

    this.videoComponent = document.createElement("video");

    // Wrapping events
    this.frameDidFinishSeeking = new Promise<void>(() => {});
    this.finishedLoadingOnStart = new Promise<void>(() => {});

    this.videoComponent.onloadedmetadata = (event: Event) => {
      console.log("Loaded Metadata");
      this.node.width(this.videoComponent.videoWidth);
      this.node.height(this.videoComponent.videoHeight);
      this.videoComponent.currentTime = 0; // ensure it shows up on screen
      // it might have length here which we will need to trim down to 7 seconds.
      console.log(`Video Duration: ${this.videoComponent.duration}`);
      this.duration = this.videoComponent.duration;
    };

    this.finishedLoadingOnStart = new Promise<void>((resolve, reject) => {
      this.videoComponent.oncanplaythrough = (event: Event) => {
        this.didFinishLoading = true;
        // Might have to auto click? on first load this doesn't work in general how about after ?
        this.videoComponent.play(); //sometimes race condition with the
        resolve();
      };
    });

    // assign video to start process.
    this.videoComponent.src = this.videoURL;

    this.node = new Konva.Image({
      image: this.videoComponent,
      x: x,
      y: y,
      draggable: true,
    });

    this.videoLayer.add(this.node);

    this.node.on("dragstart", () => {
      console.log("Drag Start");
      this.updateContextMenuPosition();

      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      }
    });

    this.node.on("dragmove", () => {
      // shouldn't be able to move if processing.

      this.updateContextMenuPosition();

      if (this.isProcessing) {
        return;
      }

      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      }
    });

    this.node.on("mouseover", () => {
      console.log("MouseOver");
      this.node.stroke("salmon");
      this.node.strokeWidth(12);
      this.node.draw();
    });

    this.node.on("mouseout", () => {
      this.node.stroke(null);
      this.node.strokeWidth(0);
      this.node.draw();
    });

    this.node.on("dragend", () => {
      this.updateContextMenuPosition();
      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      }
    });

    this.node.on("mousedown", () => {
      imageToolbar.show();
      this.updateContextMenuPosition();

      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      } else {
        loadingBar.hide();
      }
    });

    this.node.on("mouseup", () => {
      if (this.didFinishLoading == false) {
        return;
      }
      this.play();
    });
  }

  stop() {
    if (this.shouldPlay == false) {
      this.shouldPlay = true;
      this.videoComponent.pause();
    }
  }

  async updateImage(newImageSrc: string) {
    const newImage = new Image();
    newImage.src = newImageSrc;
    newImage.onload = () => {
      this.node.image(newImage);
      this.node.draw();
    };
  }

  updateContextMenuPosition() {
    imageToolbar.setPosition({
      x: this.node.getPosition().x + this.node.getSize().width / 4,
      y: this.node.getPosition().y - 150,
    });
  }

  updateLoadingBarPosition() {
    loadingBar.updatePosition({
      x: this.node.getPosition().x + this.node.getSize().width / 4,
      y: this.node.getPosition().y - 60,
    });
  }

  private async createVideoElement(newURL: string) {
    // try catch here with a retry button.
    const videoComponent = document.createElement("video");
    // Update to use image.
    videoComponent.src = newURL;
    // assign video to start process.
    this.videoComponent = videoComponent;
    console.log(newURL);

    videoComponent.onseeked = (event: Event) => {
      console.log("Seeked Finished");
      // reimplement using the function
    };

    videoComponent.onloadedmetadata = (event: Event) => {
      console.log("Loaded Metadata");

      // it might have length here which we will need to trim down to 7 seconds.
      console.log(`Video Duration: ${videoComponent.duration}`);
      this.duration = videoComponent.duration;
    };

    videoComponent.onloadstart = (event: Event) => {
      this.didFinishLoading = false;
      console.log("OnLoadStart");
    };

    videoComponent.onloadeddata = (event: Event) => {
      try {
        console.log("LoadedData");

        this.node.image(videoComponent);
        this.node.draw();
        this.videoComponent.loop = true;
        this.videoComponent.currentTime = 0; // ensure it shows up on screen

        this.shouldPlay = true; // means its play state
      } catch (error) {
        console.log(error);
      }
    };

    videoComponent.oncanplaythrough = (event: Event) => {
      // remove loading ui
      loadingBar.updateProgress(100);
      loadingBar.hide();
      this.didFinishLoading = true;
      // Might have to auto click? on first load this doesn't work in general how about after ?
      //this.play(); //sometimes race condition with the
    };
  }

  private play() {
    try {
      if (this.didFinishLoading === false || this.isProcessing) {
        return;
      }

      console.log(`${this.didFinishLoading} ${this.shouldPlay}`);
      if (this.didFinishLoading && this.shouldPlay === true) {
        console.log("Playing");
        this.shouldPlay = false;
        this.videoComponent.play();
      } else {
        this.shouldPlay = true;
        this.videoComponent.pause();

        console.log("Pausing");
      }
    } catch (error) {
      console.log(error);
    }
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
      console.log(`Seeking to Position ${second}`);

      this.videoComponent.currentTime = second;

      this.frameDidFinishSeeking = new Promise<void>((resolve, reject) => {
        this.videoComponent.onseeked = (event: Event) => {
          console.log("Seeked Finished");
          // reimplement using the function
          // ensure that this doesn't race.
          resolve();
        };
      });
      // await
      await this.frameDidFinishSeeking;
    } else {
      console.log("Video Not Seekable");
    }
  }
}
