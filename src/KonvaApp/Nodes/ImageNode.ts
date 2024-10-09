import Konva from "konva";
import { MediaFilesApi, MediaUploadApi } from "~/Classes/ApiManager";

import { SelectionManager } from "../NodesManagers";
import { Position, Size } from "../types";

import { NetworkedNode, UploadStatus } from "./NetworkedNode";
import { minNodeSize, transparent } from "./constants";
import { NodeUtilities } from "./NodeUtilities";

interface ImageNodeContructor {
  canvasPosition: Position;
  canvasSize: Size;
  imageFile: File;
  mediaLayerRef: Konva.Layer;
  selectionManagerRef: SelectionManager;
}

export class ImageNode extends NetworkedNode {
  public kNode: Konva.Image;
  private imageSize: Size;

  constructor({
    canvasPosition,
    canvasSize,
    imageFile,
    mediaLayerRef,
    selectionManagerRef,
  }: ImageNodeContructor) {
    // kNodes need to be created first to guaruntee
    // that it is not undefined in parent's context
    const kNode = new Konva.Image({
      image: undefined, // to do replace with placeholder
      size: minNodeSize,
      position: NodeUtilities.positionNodeOnCanvasCenter({
        canvasOffset: canvasPosition,
        componentSize: minNodeSize,
        maxSize: canvasSize,
      }),
      fill: "gray",
      draggable: true,
      strokeScaleEnabled: false,
    });
    super({
      selectionManagerRef: selectionManagerRef,
      mediaLayerRef: mediaLayerRef,
      kNode: kNode,
      localFile: imageFile,
    });
    this.kNode = kNode;
    this.imageSize = minNodeSize;
    this.mediaLayerRef.add(this.kNode);

    const imageComponent = new Image();

    imageComponent.onload = () => {
      this.setProgress(0, UploadStatus.FILE_STAGED);
      this.imageSize = {
        width: imageComponent.width,
        height: imageComponent.height,
      };
      const adjustedSize = NodeUtilities.adjustNodeSizeToCanvas({
        componentSize: this.imageSize,
        maxSize: canvasSize,
      });
      const centerPosition = NodeUtilities.positionNodeOnCanvasCenter({
        canvasOffset: canvasPosition,
        componentSize: adjustedSize,
        maxSize: canvasSize,
      });
      this.kNode.image(imageComponent);
      this.kNode.setSize(adjustedSize);
      this.kNode.setPosition(centerPosition);

      this.kNode.fill(transparent);
      this.listenToBaseKNode();
      this.mediaLayerRef.draw();
      this.uploadImage(imageFile);
    };
    imageComponent.onerror = () => {
      this.setProgress(0, UploadStatus.ERROR_ON_FILE);
    };
    imageComponent.src = URL.createObjectURL(imageFile);
  }

  private async updateImage(newImageSrc: string) {
    this.setProgress(75, UploadStatus.LOADING);
    const newImage = new Image();
    newImage.src = newImageSrc;
    newImage.onerror = () => {
      this.setProgress(90, UploadStatus.ERROR_ON_LOAD);
    };
    newImage.onload = () => {
      // console.log("network image", newImage);
      this.kNode.image(newImage);
      this.kNode.draw();
      this.setProgress(100, UploadStatus.SUCCESS);
    };
  }

  private async uploadImage(imageFile: File) {
    this.setProgress(10, UploadStatus.UPLOADING);
    const mediaUploadApi = new MediaUploadApi();
    const uploadResponse = await mediaUploadApi.UploadImage({
      blob: imageFile,
      uuid: this.uuidGenerate(),
      fileName: imageFile.name,
    });
    // console.log(uploadResponse);
    if (!uploadResponse.success || !uploadResponse.data) {
      this.setStatus(UploadStatus.ERROR_ON_UPLOAD, uploadResponse.errorMessage);
      return;
    }
    this.mediaFileToken = uploadResponse.data;
    this.retreiveImage(this.mediaFileToken);
  }

  private async retreiveImage(mediaFileToken: string) {
    this.setProgress(50, UploadStatus.RETREIVING);
    const mediaFileApi = new MediaFilesApi();
    const mediaFileResponse = await mediaFileApi.GetMediaFileByToken({
      mediaFileToken: mediaFileToken,
    });
    // console.log(mediaFileResponse);
    if (!mediaFileResponse.success || !mediaFileResponse.data) {
      this.setStatus(
        UploadStatus.ERROR_ON_RETREIVE,
        mediaFileResponse.errorMessage,
      );
      return;
    }
    this.mediaFileUrl = mediaFileResponse.data.public_bucket_url;
    this.updateImage(this.mediaFileUrl);
  }

  public async retry() {
    if (this.mediaFileUrl) {
      this.updateImage(this.mediaFileUrl);
      return;
    }
    if (this.mediaFileToken) {
      this.retreiveImage(this.mediaFileToken);
      return;
    }
    if (this.localFile) {
      this.uploadImage(this.localFile);
      return;
    }
    console.warn("Image Node has no data to recontruct itself!");
  }
}
