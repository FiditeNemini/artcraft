import { uiAccess } from "~/signals";
import { VideoNode } from "../Nodes";
import {
  NodeIsolator,
  SelectionManager,
  SelectorSquare,
} from "../NodesManagers";
import { RGBColor } from "../types";
import { UndoStackManager } from "../UndoRedo";
import { CommandManager } from "./CommandManager";
import {
  VideoExtractionEventDetails,
  VideoExtractionEvents,
} from "../types/events";

export class VideoExtractionHandler {
  private node?: VideoNode;
  private prevIsChroma?: boolean;
  private prevChromaColor?: RGBColor;
  // engine subclass references
  private commandManagerRef: CommandManager;
  private nodeIsolatorRef: NodeIsolator;
  private selectionManagerRef: SelectionManager;
  private selectorSquareRef: SelectorSquare;
  private undoStackManagerRef: UndoStackManager;

  constructor({
    commandManagerRef,
    nodeIsolatorRef,
    selectionManagerRef,
    selectorSquareRef,
    undoStackManagerRef,
  }: {
    commandManagerRef: CommandManager;
    nodeIsolatorRef: NodeIsolator;
    selectionManagerRef: SelectionManager;
    selectorSquareRef: SelectorSquare;
    undoStackManagerRef: UndoStackManager;
  }) {
    this.commandManagerRef = commandManagerRef;
    this.nodeIsolatorRef = nodeIsolatorRef;
    this.selectionManagerRef = selectionManagerRef;
    this.selectorSquareRef = selectorSquareRef;
    this.undoStackManagerRef = undoStackManagerRef;
  }

  private updateLoadingBar({
    detail,
  }: CustomEvent<VideoExtractionEventDetails>) {
    const { progress, status, message } = detail;
    const disabled = progress !== 100;
    const shouldShow = status !== VideoExtractionEvents.SESSION_CLOSED;
    uiAccess.toolbarVideoExtraction.update({
      isShowing: shouldShow,
      disabled: disabled,
      loadingBarState: {
        progress: progress,
        status: status,
        message: message,
      },
    });
  }
  public async startVideoExtraction(node: VideoNode) {
    console.log("VideoExtraction on node", node);
    if (this.node || this.prevIsChroma || this.prevChromaColor) {
      if (import.meta.env.DEV) {
        console.error("Video Extraction: Handler already has node");
      }
      return;
    }
    this.node = node;
    this.prevIsChroma = node.isChroma;
    this.prevChromaColor = node.chromaColor;
    this.node.progressEvent.addEventListener(
      "videoextraction",
      this.updateLoadingBar as EventListener,
    );
    // when the button is pressed to enter extraction mode
    console.log("ENGEINE prepare Extraction Session.", node);
    // disable most of the UI before we get a session
    document.body.style.cursor = "wait";
    this.selectionManagerRef.disable();
    this.selectorSquareRef.disable();
    node.lock();
    this.undoStackManagerRef.setDisabled(true);
    // if the video has chroma, disable it
    if (this.prevIsChroma) {
      node.setChroma(false);
    }
    // if the video is already using extraction
    // bring the original video back
    if (node.extractionUrl === node.videoComponent.src) {
      await node.loadVideoFromUrl({
        videoUrl: node.mediaFileUrl,
        hasExistingTransform: true,
      });
    }
    // actually start and wait for session
    await node.startSegmentation();
    this.nodeIsolatorRef.enterIsolation(node);
    node.videoSegmentationMode(true);
    this.selectionManagerRef.updateContextComponents();
    uiAccess.toolbarVideoExtraction.update({
      isShowing: true,
      disabled: false,
      loadingBarState: {
        progress: 0,
        status: VideoExtractionEvents.SESSION_IDLE,
        message: "Select Points for Extraction",
      },
    });
    document.body.style.cursor = "default";
  }

  public async endVideoExtraction() {
    // when the button is pressed to exit extraction mode
    console.log("ENGINE Attemping to close Extraction Session.");
    document.body.style.cursor = "wait";
    if (
      !this.node ||
      this.prevIsChroma === undefined ||
      !this.prevChromaColor
    ) {
      if (import.meta.env.DEV) {
        console.error("Video Extraction: node or chroma info unavailable");
      }
      return;
    }
    uiAccess.toolbarVideoExtraction.disable();
    const endSessionResult = await this.node.endSession();
    if (typeof endSessionResult === "string") {
      this.node.videoSegmentationMode(false);
      this.node.progressEvent.removeEventListener(
        "videoextraction",
        this.updateLoadingBar as EventListener,
      );
      this.commandManagerRef.useVideoExtraction({
        videoNode: this.node,
        extractionUrl: endSessionResult,
        prevIsChroma: this.prevIsChroma,
        prevChromaColor: this.prevChromaColor,
      });
      this.nodeIsolatorRef.exitIsolation();

      // unlock the ui
      this.undoStackManagerRef.setDisabled(false);

      this.selectorSquareRef.enable();
      this.node.unlock();
      this.selectionManagerRef.updateContextComponents();
      this.selectionManagerRef.enable();
      uiAccess.toolbarVideoExtraction.update({
        isShowing: false,
        disabled: false,
      });
      this.node = undefined;
      this.prevIsChroma = undefined;
      this.prevChromaColor = undefined;
      // to close off the session.
    } else {
      uiAccess.toolbarVideoExtraction.enable();
      console.log("Busy Processing Video.");
    }
    document.body.style.cursor = "default";
  }
}
