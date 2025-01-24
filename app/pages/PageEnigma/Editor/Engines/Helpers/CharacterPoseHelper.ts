import { loadImage } from "~/Helpers/ImageHelpers";
import { EditorExpandedI } from "~/pages/PageEnigma/contexts/EngineContext";
import { FilesetResolver, HandLandmarker, HandLandmarkerResult, PoseLandmarker, PoseLandmarkerResult } from "@mediapipe/tasks-vision"

export class CharacterPoseHelper {

  editor: EditorExpandedI;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filesetResolver: any;
  numHands = 2;
  numPoses = 1;
  runningMode = "IMAGE";

  constructor(editor: EditorExpandedI) {
    this.editor = editor;
    this.filesetResolver = undefined;
  }

  async initResolver() {
    if (this.filesetResolver) {
      return;
    }

    this.filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
  }

  async extractPoseData(url: string): { hands: HandLandmarkerResult, pose: PoseLandmarkerResult } {
    const frameImage = new Image();
    frameImage.crossOrigin = "anonymous";
    frameImage.src = url;

    // Wait for image to load before extracting pose data
    await loadImage(frameImage);
    console.debug("Loaded image for inference", frameImage, frameImage.height, frameImage.width)

    // Initialize mediapipe for the image
    await this.initResolver(); // Make sure the resolver is loaded

    const handLandmarker = await HandLandmarker.createFromOptions(this.filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      numHands: this.numHands,
      runningMode: this.runningMode
    })

    const poseLandmarker = await PoseLandmarker.createFromOptions(this.filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "GPU"
      },
      runningMode: this.runningMode,
      numPoses: this.numPoses
    })

    // Run the detection on image
    const handResults = handLandmarker.detect(frameImage)
    console.debug("Hand results: ", handResults);

    const poseResults = poseLandmarker.detect(frameImage)
    console.debug("Pose results: ", poseResults);

    return { hands: handResults, pose: poseResults };
  }

  applyPoseDataToCharacter(characterId: string, poseData: { hands: HandLandmarkerResult, pose: PoseLandmarkerResult }) {
    // Apply the pose data to the character
    const character = this.editor.timeline.scene.get_object_by_uuid(characterId);
    if (!character) {
      console.error("Character not found with id: ", characterId);
      return;
    }

    // Apply the pose data to the character
    console.debug("Character:", character)
  }

}
