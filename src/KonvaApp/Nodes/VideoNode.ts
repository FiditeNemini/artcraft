import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import { NetworkedNodeContext } from "./NetworkedNodeContext";
import { v4 as uuidv4 } from "uuid";
import { storytellerColors } from "./tailwind.stcolors";

export class VideoNode extends NetworkedNodeContext {
  public videoURL: string;
  public videoComponent: HTMLVideoElement;

  public node: Konva.Image;

  private didFinishLoading: boolean;
  private videoLayer: Layer;

  public uuid: string;
  public offScreenCanvas: OffscreenCanvas;

  private shouldPlay: boolean = true;

  // Use Context Menu Item
  private duration: number = 0;
  private imageIndex: number = 0;
  private imageSources: [] = [
    "https://images-ng.pixai.art/images/orig/7ef23baa-2fc8-4e2f-8299-4f9241920090",
    "https://images-ng.pixai.art/images/orig/98196e9f-b968-4fe1-97ec-083ffd77c263",
    "https://images-ng.pixai.art/images/orig/a05a49dd-6764-4bfe-902f-1dfad67e49c9",
    "https://images-ng.pixai.art/images/orig/a449179c-c549-4627-8806-49dc5a30c429",
    "https://images-ng.pixai.art/images/orig/809eafc6-79c8-4c7a-89cd-bfc7ab39f142",
    "https://images-ng.pixai.art/images/orig/5f004e09-e3ac-4461-b2b1-0d70f2255c34",
    "https://images-ng.pixai.art/images/orig/56dcbb5f-7a31-4328-b4ea-1312df6e77a0",
    "https://videos.pixai.art/f7df019d-79a2-4ed2-bb99-775c941f7ec6",
  ];

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
    this.fps = 60; // need to query this from the media

    this.duration = -1;

    this.didFinishLoading = false;

    this.videoURL = videoURL;
    this.videoComponent = document.createElement("video");

    this.videoComponent.onloadedmetadata = (event: Event) => {
      console.log("Loaded Metadata");
      this.node.width(this.videoComponent.videoWidth);
      this.node.height(this.videoComponent.videoHeight);
      this.videoComponent.currentTime = 0; // ensure it shows up on screen
      // it might have length here which we will need to trim down to 7 seconds.
      console.log(`Video Duration: ${this.videoComponent.duration}`);
      this.duration = this.videoComponent.duration;
    };

    this.videoComponent.onloadstart = (event: Event) => {
      console.log("OnLoadStart");
      this.startLoading();
    };

    this.videoComponent.onloadeddata = (event: Event) => {
      console.log("LoadedData");
    };

    this.videoComponent.onload = (event: Event) => {
      console.log("OnLoaded");
    };

    this.videoComponent.onseeked = (event: Event) => {
      console.log("Seeked");
    };

    // assign listeners to manage state
    this.videoComponent.oncanplay = (event: Event) => {
      this.didFinishLoading = true;
      // remove loading ui

      this.endLoading();
    };

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
    });

    this.node.on("mouseover", () => {
      console.log("MouseOver");
      this.node.stroke("salmon");
      this.node.strokeWidth(5);
      this.node.draw();
    });

    this.node.on("mouseout", () => {
      this.node.stroke(null);
      this.node.strokeWidth(0);
      this.node.draw();
    });

    this.node.on("dragend", () => {
      console.log("Drag End");
    });

    this.node.on("mousedown", () => {
      if (this.didFinishLoading && this.shouldPlay === true) {
        this.shouldPlay = false;
        this.videoComponent.play();
      } else {
        this.shouldPlay = true;
        this.videoComponent.pause();

        console.log("Pausing");
      }
    });
  }

  async updateImage(newImageSrc: string) {
    const newImage = new Image();
    newImage.src = newImageSrc;
    newImage.onload = () => {
      this.node.image(newImage);
      this.videoLayer.draw();
    };
  }

  async animate() {
    this.updateImage(this.imageSources[this.imageIndex]);
    const imageIndex = (this.imageIndex + 1) % this.imageSources.length;
    setTimeout(this.animate.bind(this), 1000); // Update every second
  }

  // use sub milisecond for frames.
  async seek(second: number) {
    if (this.videoComponent.seekable) {
      if (!this.videoComponent) {
        console.log("Didn't setup Video Component?");
        return;
      }

      this.videoComponent.currentTime = second;
    } else {
      console.log("Video Not Seekable");
    }
  }
}
