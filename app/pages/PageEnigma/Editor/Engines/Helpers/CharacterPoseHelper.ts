import { loadImage } from "~/Helpers/ImageHelpers";
import { EditorExpandedI } from "~/pages/PageEnigma/contexts/EngineContext";
import { FilesetResolver, HandLandmarker, HandLandmarkerResult, PoseLandmarker, PoseLandmarkerResult } from "@mediapipe/tasks-vision"
import { MixamoInterpolationBoneNames, MixamoPoseMap } from "../Mappers/MixamoPoseMapper";
import { AxesHelper, Bone, Box3, Box3Helper, BufferGeometry, Euler, Matrix4, Object3D, Object3DEventMap, Quaternion, SkeletonHelper, Vector3 } from "three";

// TODO: Currently the class uses the scene to use as a detachment parent
// Maybe this would cause problems in the future
// Look into an alternative way to detach bone from parent temporarily because reattaching?
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

  async extractPoseData(url: string): Promise<{ hands: HandLandmarkerResult; pose: PoseLandmarkerResult; }> {
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
    const scene = this.editor.timeline.scene;
    const character = scene.get_object_by_uuid(characterId);
    if (!character) {
      console.error("Character not found with id: ", characterId);
      return;
    }

    // Apply the pose data to the character
    //
    // Get character dimensions with a bounding box (unreliable but works for now)
    const characterBox = new Box3().setFromObject(character);

    // Add a box helper to the scene
    const boxHelper = new Box3Helper(characterBox, 0xfff000);
    scene.scene.add(boxHelper);

    // Get the original hip position
    const hipPos = new Vector3();
    const hipBone = character.children[0].children.find((child) => child.name === "mixamorigHips")!;
    hipBone.getWorldPosition(hipPos);

    // Test only the rotation without pose application for now
    // TODO: Remove
    this.updateBoneRotations(character);
    return;

    // We'll do a triple pass, one that'll gather the bone data
    // and another that'll update the main mapped bones and then finally interpolate the extra bones
    //
    // First pass: Build a list of bones to update
    const mappedBones: Record<string, Object3D<Object3DEventMap>> = {};
    const interpolationBones: Record<string, Object3D<Object3DEventMap>> = {};
    character.traverse((child) => {
      if (child.type !== "Bone") {
        return;
      }

      if (MixamoPoseMap[child.name] !== undefined) {
        console.debug("Mapped bone found:", child.name);
        mappedBones[child.name] = child;
      } else {
        // console.debug("Interpolation bone found:", child.name);
        interpolationBones[child.name] = child;
      }
    });

    // Second pass: Update the mapped bones
    const scale = 1.1;
    Object.values(mappedBones).forEach((bone) => {
      const mapIndex = MixamoPoseMap[bone.name];
      const poseCoordinates = poseData.pose.worldLandmarks[0][mapIndex];
      const parent = bone.parent!;

      // Detach child from parent
      scene.scene.attach(bone);

      bone.position.set(poseCoordinates.x * scale, -poseCoordinates.y * scale, -poseCoordinates.z * scale);
      bone.position.add(hipPos); // Pose data world coordinates are centered at center of hips (left and right)

      // Reattach child to its parent
      parent.attach(bone);
    });

    // Third pass: Interpolate the extra bones
    if (interpolationBones[MixamoInterpolationBoneNames.DefLeftThigh]) {
      // Left thigh is lipo'd between left upper leg and knee
      const leftThigh = interpolationBones[MixamoInterpolationBoneNames.DefLeftThigh];
      const leftUpperLeg = mappedBones["mixamorigLeftUpLeg"];
      const leftKnee = mappedBones["mixamorigLeftLeg"];
      const parent = leftThigh.parent!;

      // Detach child from parent
      scene.scene.attach(leftThigh);

      // Calculate the lipo position
      const leftUpperLegPos = new Vector3();
      const leftKneePos = new Vector3();
      leftUpperLeg.getWorldPosition(leftUpperLegPos);
      console.debug("Left upper leg pos: ", leftUpperLegPos);
      leftKnee.getWorldPosition(leftKneePos);
      console.debug("Left knee pos: ", leftKneePos);
      const leftThighPos = new Vector3();
      leftThighPos.lerpVectors(leftUpperLegPos, leftKneePos, 0.6);
      console.debug("Left thigh pos: ", leftThighPos);
      leftThigh.position.set(leftThighPos.x, leftThighPos.y, leftThighPos.z);

      // Reattach child to its parent
      parent.attach(leftThigh);
    }

    if (interpolationBones[MixamoInterpolationBoneNames.DefRightUpperArm]) {
      // Right upper arm is lipo'd between shoulder and elbow
      const rightUpperArm = interpolationBones[MixamoInterpolationBoneNames.DefRightUpperArm];
      const rightShoulder = mappedBones["mixamorigRightArm"];
      const rightElbow = mappedBones["mixamorigRightForeArm"];
      const parent = rightUpperArm.parent!;

      // Detach child from parent
      scene.scene.attach(rightUpperArm);

      // Calculate the lipo position
      const rightShoulderPos = new Vector3();
      const rightElbowPos = new Vector3();
      rightShoulder.getWorldPosition(rightShoulderPos);
      console.debug("Right shoulder pos: ", rightShoulderPos);
      rightElbow.getWorldPosition(rightElbowPos);
      console.debug("Right elbow pos: ", rightElbowPos);
      const rightUpperArmPos = new Vector3();
      rightUpperArmPos.lerpVectors(rightShoulderPos, rightElbowPos, 0.5);
      console.debug("Right upper arm pos: ", rightUpperArmPos);
      rightUpperArm.position.set(rightUpperArmPos.x, rightUpperArmPos.y, rightUpperArmPos.z);

      // Reattach child to its parent
      parent.attach(rightUpperArm);
    }

    if (interpolationBones[MixamoInterpolationBoneNames.DefLeftUpperArm]) {
      // Left upper arm is lipo'd between shoulder and elbow
      const leftUpperArm = interpolationBones[MixamoInterpolationBoneNames.DefLeftUpperArm];
      console.log("Left def arm position:", leftUpperArm.position);
      const leftShoulder = mappedBones["mixamorigLeftArm"];
      const leftElbow = mappedBones["mixamorigLeftForeArm"];
      const parent = leftUpperArm.parent!;

      // Detach child from parent
      scene.scene.attach(leftUpperArm);

      // Calculate the lipo position
      const leftShoulderPos = new Vector3();
      const leftElbowPos = new Vector3();
      leftShoulder.getWorldPosition(leftShoulderPos);
      console.debug("Left shoulder pos: ", leftShoulderPos);
      leftElbow.getWorldPosition(leftElbowPos);
      console.debug("Left elbow pos: ", leftElbowPos);
      const leftUpperArmPos = new Vector3();
      leftUpperArmPos.lerpVectors(leftShoulderPos, leftElbowPos, 0.5);
      console.debug("Left upper arm pos: ", leftUpperArmPos);
      leftUpperArm.position.set(leftUpperArmPos.x, leftUpperArmPos.y, leftUpperArmPos.z);

      // Reattach child to its parent
      parent.attach(leftUpperArm);
      console.log("Left def arm position:", leftUpperArm.position);
    }

    // this.updateBoneRotations(character);
  }

  updateBoneRotations(character: Object3D<Object3DEventMap>) {
    const skeletonHelper = new SkeletonHelper(character);
    const rootBone = skeletonHelper.bones[0];
    const queue = [rootBone];
    const scene = this.editor.timeline.scene;

    const fromBone = skeletonHelper.bones.find((bone) => bone.name === "mixamorigLeftArm")!;
    const toBone = skeletonHelper.bones.find((bone) => bone.name === "mixamorigLeftForeArm")!;
    const fromHelper = new AxesHelper(10);
    const toHelper = new AxesHelper(10);
    fromHelper.material.transparent = true;
    fromHelper.material.depthTest = false;
    fromBone.add(fromHelper);
    toBone.add(toHelper);

    console.debug("Before rotations: ", fromBone, toBone);
    this.updateBoneRotationEuler(fromBone, toBone);
    console.debug("After rotations: ", fromBone, toBone);
  }

  updateBoneRotationEuler(bone: Bone, childBone: Bone) {
    // Get world positions
    const boneWorldPos = new Vector3();
    const childWorldPos = new Vector3();
    bone.getWorldPosition(boneWorldPos);
    childBone.getWorldPosition(childWorldPos);

    // Compute the new direction the bone should point to
    const targetDirection = new Vector3().subVectors(childWorldPos, boneWorldPos).normalize();
    console.debug("Target direction: ", targetDirection);

    // Convert world direction to local space (relative to bone)
    const parentMatrix = new Matrix4();
    if (bone.parent) {
      bone.parent.updateMatrixWorld(true);
      parentMatrix.copy(bone.matrixWorld).invert(); // Convert to local space
    }
    targetDirection.applyMatrix4(parentMatrix);
    console.debug("Target direction local: ", targetDirection);

    // Compute Euler angles from the target direction
    const eulerRotation = new Euler();
    eulerRotation.setFromVector3(targetDirection);

    // Apply rotation
    bone.rotation.copy(eulerRotation);
    bone.updateMatrixWorld(true);
  }

  getAlignmentMap(character: Object3D<Object3DEventMap>, poseData: { hands: HandLandmarkerResult, pose: PoseLandmarkerResult }) {
    const alignmentMap: Record<string, Vector3> = {};

    character.traverse((child) => {
      if (child.type !== "Bone") {
        return;
      }

      if (!MixamoPoseMap[child.name]) {
        return;
      }

      const mapIndex = MixamoPoseMap[child.name];
      const targetCoordinates = poseData.pose.worldLandmarks[0][mapIndex];
      const targetWorldCoordinates = new Vector3(
        targetCoordinates.x, -targetCoordinates.y, -targetCoordinates.z
      );

      alignmentMap[child.name] = targetWorldCoordinates;
    });

    return alignmentMap;
  }

  alignCharacterToPose(bones: Bone[], targetPositions: Record<string, Vector3>) {
    const tempVec1 = new Vector3();
    const tempVec2 = new Vector3();
    const quat = new Quaternion();

    bones.forEach(bone => {
      if (!targetPositions[bone.name]) return;  // Skip if no target is given

      const targetPos = targetPositions[bone.name];

      // Get current world position
      const currentPos = bone.getWorldPosition(new Vector3());

      // Compute position offset (not always needed for Mixamo rigs)
      const positionOffset = tempVec1.subVectors(targetPos, currentPos);
      bone.position.add(positionOffset); // Only apply if necessary

      if (bone.parent && bone.parent.type === "Bone") {
        // Compute world-space bone direction before and after transformation
        const childPos = bone.getWorldPosition(new Vector3());
        const parentPos = bone.parent.getWorldPosition(new Vector3());
        const parentQuat = bone.parent.getWorldQuaternion(new Quaternion());

        // Compute direction vectors
        tempVec1.subVectors(childPos, parentPos).normalize(); // Current direction
        tempVec2.subVectors(targetPos, parentPos).normalize(); // Target direction

        // Compute rotation needed to align current direction to target direction
        quat.setFromUnitVectors(tempVec1, tempVec2);

        // Convert world-space rotation to local-space
        const inverseParentQuat = parentQuat.clone().invert();
        quat.premultiply(inverseParentQuat);

        bone.quaternion.premultiply(quat);
      }
    });
  }

  testRun(characterId: string, poseData: { hands: HandLandmarkerResult, pose: PoseLandmarkerResult }) {
    const scene = this.editor.timeline.scene;
    const character = scene.get_object_by_uuid(characterId);
    if (!character) {
      console.error("Character not found with id: ", characterId);
      return;
    }
    const alignmentMap = this.getAlignmentMap(character, poseData);
    const sortedBones = this.getSortedBoneArray(character);
    this.alignCharacterToPose(sortedBones, alignmentMap);
  }

  getSortedBoneArray(character: Object3D<Object3DEventMap>) {
    function getBoneHierarchyDepth(bone: Bone, root: Bone): number {
      let depth = 0;
      while (bone !== root && bone.parent) {
        bone = bone.parent as Bone;
        depth++;
      }
      return depth;
    }

    const skeletonHelper = new SkeletonHelper(character);
    const rootBone = skeletonHelper.bones.find((bone) => bone.name === "mixamorigHips")!;
    skeletonHelper.bones.sort((a, b) => getBoneHierarchyDepth(a, rootBone) - getBoneHierarchyDepth(b, rootBone));
    return skeletonHelper.bones;
  }

}
