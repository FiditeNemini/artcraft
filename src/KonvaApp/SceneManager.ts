import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { MediaFilesApi, MediaUploadApi } from "~/Classes/ApiManager";
import { NodesManager, SelectionManager } from "./NodesManagers";
import { NodeData, TextNodeData, TransformationData } from "./types";
import { uiAccess } from "~/signals";
import { NavigateFunction } from "react-router-dom";
import { NodeType } from "./Nodes/constants";
import { ImageNode, VideoNode, TextNode } from "./Nodes";
import { RenderEngine } from "./RenderingPrimitives/RenderEngine";

export class SceneManager {
  private navigateRef: NavigateFunction;

  private mediaLayerRef: Konva.Layer;
  private nodesManagerRef: NodesManager;
  private selectionManagerRef: SelectionManager;
  private renderEngineRef: RenderEngine;
  private currentSceneToken: string | undefined;

  constructor({
    navigateRef,
    mediaLayerRef,
    nodesManagerRef,
    selectionManagerRef,
    renderEngineRef,
  }: {
    navigateRef: NavigateFunction;
    mediaLayerRef: Konva.Layer;
    nodesManagerRef: NodesManager;
    selectionManagerRef: SelectionManager;
    renderEngineRef: RenderEngine;
  }) {
    this.navigateRef = navigateRef;
    this.mediaLayerRef = mediaLayerRef;
    this.nodesManagerRef = nodesManagerRef;
    this.selectionManagerRef = selectionManagerRef;
    this.renderEngineRef = renderEngineRef;
  }

  public async saveScene() {
    const mediaUploadApi = new MediaUploadApi();
    const timestamp = new Date();
    const sceneTitle =
      "board_" + timestamp.toISOString().substring(0, 19).replace(/\D/g, "");

    const saveJson = this.extractAllNodesData();
    console.log("saveJson", saveJson);
    const file = new File([saveJson], `${sceneTitle}`, {
      type: "application/json",
    });
    if (!this.currentSceneToken) {
      const uploadResponse = await mediaUploadApi.UploadNewScene({
        blob: file,
        fileName: file.name,
        uuid: uuidv4(),
      });
      console.log(uploadResponse);
      if (!uploadResponse.success || !uploadResponse.data) {
        uiAccess.dialogError.show({
          title: "Save New Scene Error",
          message: uploadResponse.errorMessage,
        });
        return;
      }
      this.currentSceneToken = uploadResponse.data;
      this.navigateRef(`/${this.currentSceneToken}`);
    } else {
      const uploadResponse = await mediaUploadApi.UploadSavedScene({
        blob: file,
        fileName: file.name,
        uuid: uuidv4(),
        mediaToken: this.currentSceneToken,
      });
      console.log(uploadResponse);
      if (!uploadResponse.success || !uploadResponse.data) {
        uiAccess.dialogError.show({
          title: "Save Scene Error",
          message: uploadResponse.errorMessage,
        });
        return;
      }
    }
  }

  public async loadScene(mediaFileToken: string) {
    const mediaFileApi = new MediaFilesApi();
    const getSceneResponse = await mediaFileApi.GetMediaFileByToken({
      mediaFileToken: mediaFileToken,
    });
    if (!getSceneResponse.success || !getSceneResponse.data) {
      uiAccess.dialogError.show({
        title: "Load Scene Error",
        message: getSceneResponse.errorMessage,
      });
      return;
    }
    this.currentSceneToken = mediaFileToken;
    console.log(getSceneResponse.data);
    console.log(getSceneResponse.data.public_bucket_path);
    const fileResponse = await fetch(getSceneResponse.data.public_bucket_url);
    if (!fileResponse.ok) {
      uiAccess.dialogError.show({
        title: "Load Scene Error",
        message: "Failed to download Scene File",
      });
      return;
    }
    const fileBlob = await fileResponse.blob();

    const loadJson: NodeData[] = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      const readerError = () => {
        uiAccess.dialogError.show({
          title: "Load Scene Error",
          message: "Failed to read Scene File",
        });
        this.navigateRef("/");
        console.log("debug file Response", fileResponse);
        console.log("debug file Blob", fileBlob);
        reject();
      };
      reader.onloadend = () => {
        try {
          resolve(JSON.parse(reader.result as string));
        } catch {
          readerError();
        }
      };
      reader.onerror = () => {
        readerError();
      };
      reader.readAsText(fileBlob);
    });

    this.rebuildScene(loadJson);
  }

  private extractAllNodesData() {
    const nodesData: NodeData[] = [];
    this.nodesManagerRef.getAllNodes().forEach((node) => {
      nodesData.push(
        node.getNodeData(this.renderEngineRef.captureCanvas.position()),
      );
    });
    nodesData.sort((a, b) => a.transform.zIndex - b.transform.zIndex);
    return JSON.stringify(nodesData);
  }

  private rebuildScene(nodesData: NodeData[]) {
    console.log(nodesData);
    nodesData.forEach((nodeDatum) => {
      if (nodeDatum.type === NodeType.IMAGE && nodeDatum.mediaFileUrl) {
        this.addImage(nodeDatum.mediaFileUrl, nodeDatum.transform);
      } else if (nodeDatum.type === NodeType.VIDEO && nodeDatum.mediaFileUrl) {
        this.addVideo(nodeDatum.mediaFileUrl, nodeDatum.transform);
      } else if (
        nodeDatum.type === NodeType.TEXT &&
        nodeDatum.textNodeData &&
        nodeDatum.textChildrenTransforms
      ) {
        this.addText({
          textNodeData: nodeDatum.textNodeData,
          textChildrenTransforms: nodeDatum.textChildrenTransforms,
          transform: nodeDatum.transform,
        });
      }
    });
  }

  private addImage(mediaFileUrl: string, transform: TransformationData) {
    const imageNode = new ImageNode({
      mediaFileUrl: mediaFileUrl,
      mediaLayerRef: this.mediaLayerRef,
      canvasPosition: this.renderEngineRef.captureCanvas.position(),
      canvasSize: this.renderEngineRef.captureCanvas.size(),
      transform: transform,
      selectionManagerRef: this.selectionManagerRef,
    });
    this.nodesManagerRef.saveNode(imageNode);
    this.renderEngineRef.addNodes(imageNode);
  }
  private addVideo(mediaFileUrl: string, transform: TransformationData) {
    const videoNode = new VideoNode({
      videoURL: mediaFileUrl,
      mediaLayerRef: this.mediaLayerRef,
      canvasPosition: this.renderEngineRef.captureCanvas.position(),
      canvasSize: this.renderEngineRef.captureCanvas.size(),
      transform: transform,
      selectionManagerRef: this.selectionManagerRef,
    });
    this.nodesManagerRef.saveNode(videoNode);
    this.renderEngineRef.addNodes(videoNode);
  }
  private addText({
    textNodeData,
    transform,
    textChildrenTransforms,
  }: {
    textNodeData: TextNodeData;
    transform: TransformationData;
    textChildrenTransforms: {
      wrapperRectTransform: TransformationData;
      textNodeTransform: TransformationData;
    };
  }) {
    const textNode = new TextNode({
      textNodeData: textNodeData,
      transform: transform,
      textChildrenTransforms: textChildrenTransforms,
      mediaLayerRef: this.mediaLayerRef,
      canvasPosition: this.renderEngineRef.captureCanvas.position(),
      canvasSize: this.renderEngineRef.captureCanvas.size(),
      selectionManagerRef: this.selectionManagerRef,
    });
    this.nodesManagerRef.saveNode(textNode);
    this.renderEngineRef.addNodes(textNode);
  }
}
