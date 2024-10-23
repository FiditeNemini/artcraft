import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { SelectionManager } from "../NodesManagers";
import { BaseNode } from "./BaseNode";
import { Size } from "../types";
import { LoadingVideosProvider } from "../LoadingVideosProvider";

export enum UploadStatus {
  INIT = "init",
  FILE_STAGED = "file_staged",
  ERROR_ON_FILE = "error_on_file",
  UPLOADING = "uploading",
  ERROR_ON_UPLOAD = "error_on_upload",
  RETREIVING = "retreiving",
  ERROR_ON_RETREIVE = "error_on_retreive",
  LOADING = "loading",
  ERROR_ON_LOAD = "error_on_load",
  SUCCESS = "success",
}

export abstract class NetworkedNode extends BaseNode {
  public kNode: Konva.Image;
  public didFinishLoading: boolean = false;
  protected _progress: number = 0;
  protected _progressMessage?: string;
  protected localFile?: File;
  protected mediaFileToken?: string;
  protected mediaFileUrl?: string;
  protected mediaFileSize?: Size;
  protected mediaFileStatus: UploadStatus = UploadStatus.INIT;
  protected loadingVideosProviderRef?: LoadingVideosProvider;
  public errorMessage?: string;
  abstract retry(): void;
  constructor({
    kNode,
    selectionManagerRef,
    mediaLayerRef,
    localFile,
    loadingVideosProviderRef,
  }: {
    kNode: Konva.Image;
    selectionManagerRef: SelectionManager;
    mediaLayerRef: Konva.Layer;
    loadingVideosProviderRef?: LoadingVideosProvider;
    localFile?: File;
  }) {
    super({
      kNode,
      selectionManagerRef,
      mediaLayerRef,
    });
    this.kNode = kNode;
    this.loadingVideosProviderRef = loadingVideosProviderRef;
    this.didFinishLoading = false;
    this.localFile = localFile;
  }
  public progress() {
    return this._progress;
  }
  public progressMessage() {
    return this._progressMessage;
  }
  public status() {
    return this.mediaFileStatus;
  }
  public isError() {
    const errorStatues = [
      UploadStatus.ERROR_ON_FILE,
      UploadStatus.ERROR_ON_UPLOAD,
      UploadStatus.ERROR_ON_RETREIVE,
      UploadStatus.ERROR_ON_LOAD,
    ];
    return errorStatues.includes(this.mediaFileStatus);
  }

  protected uuidGenerate() {
    return uuidv4();
  }
  protected setStatus(newStatus: UploadStatus, message?: string) {
    this.mediaFileStatus = newStatus;
    this.errorMessage = message;
    this.selectionManagerRef.updateContextComponents(this);
  }
  protected setProgress(
    newProgress: number,
    progressProps?: {
      newStatus?: UploadStatus;
      message?: string;
    },
  ) {
    this._progress = newProgress;
    if (progressProps?.message) {
      this._progressMessage = progressProps.message;
    }
    if (progressProps?.newStatus) {
      this.mediaFileStatus = progressProps.newStatus;
    }

    if (this._progress === 100) {
      this.didFinishLoading = true;
    }
    this.selectionManagerRef.updateContextComponents(this);
  }
}
