import { FilesetResolver, HandLandmarker, HandLandmarkerResult, NormalizedLandmark, PoseLandmarker, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import * as Kalidokit from "kalidokit";
import { Box3, Box3Helper, Euler, EulerOrder, Object3D, Object3DEventMap, SkeletonHelper, Vector3 } from "three";
import { EulerRotation, XYZ } from "vendor/kalidokit/dist";
import { loadImage } from "~/Helpers/ImageHelpers";
import { EditorExpandedI } from "~/pages/PageEnigma/contexts/EngineContext";
import { HandMixamoBonesMap, mixamorigTransformations } from "../../debug";
import { MixamoInterpolationBoneNames, MixamoPoseMap } from "../Mappers/MixamoPoseMapper";

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

  rigRotation(boneName: string, rotation: EulerRotation = { x: 0, y: 0, z: 0 }, skeleton: SkeletonHelper) {
    // Find the corresponding bone via bone name and mapping
    const skeletalBoneMap = mixamorigTransformations[boneName];
    const bone = skeleton.bones.find((bone) => bone.name === skeletalBoneMap.name);

    if (!bone) {
      console.error("Bone not found with name: ", skeletalBoneMap.name);
      return;
    }

    const bindingFunc = skeletalBoneMap.func;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const x = rotation.x;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const y = rotation.y;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const z = rotation.z;
    const evalX = eval(bindingFunc.fx);
    const evalY = eval(bindingFunc.fy);
    const evalZ = eval(bindingFunc.fz);

    const order = skeletalBoneMap.order.toUpperCase();
    const euler = new Euler(
      bone.rotation.x + evalX,
      bone.rotation.y + evalY,
      bone.rotation.z + evalZ,
      (order || rotation.rotationOrder?.toUpperCase() || "XYZ") as EulerOrder
    );

    // Apply rotation to bone
    bone.quaternion.setFromEuler(euler);
  }

  rigPosition(boneName: string, position: XYZ, skeleton: SkeletonHelper) {
    // Find the corresponding bone via bone name and mapping
    const skeletalBoneMap = mixamorigTransformations[boneName];
    const bone = skeleton.bones.find((bone) => bone.name === skeletalBoneMap.name);

    if (!bone) {
      console.error("Bone not found with name: ", skeletalBoneMap.name);
      return;
    }

    bone.position.set(position.x, position.y * 1.2, -position.z);
  }

  rigHandRotation(boneName: string, rotation: EulerRotation = { x: 0, y: 0, z: 0 }, skeleton: SkeletonHelper) {
    // Find the corresponding bone via bone name and mapping
    const skeletalBoneName = HandMixamoBonesMap[boneName];
    const bone = skeleton.bones.find((bone) => bone.name === skeletalBoneName);

    if (!bone) {
      console.error("Bone not found with name: ", skeletalBoneName);
      return;
    }

    const order = "XYZ";
    const euler = new Euler(
      bone.rotation.x + rotation.x,
      bone.rotation.y - rotation.y,
      bone.rotation.z - rotation.z,
      order
    );

    // Apply rotation to bone
    bone.quaternion.setFromEuler(euler);
  }

  getHandedLandmarks(handLandmarks: HandLandmarkerResult) {
    if (handLandmarks.handedness.length < 2) {
      console.error("Not enough hands detected");
      return undefined;
    }

    // TODO: Use handedness score value to sort by confidence
    // For now assume the top confidence is first result in handedness 
    const topHandedness = handLandmarks.handedness[0][0];

    let leftHandIndex = 0, rightHandIndex = 1;
    if (topHandedness.categoryName === "Right") {
      rightHandIndex = topHandedness.index;
      leftHandIndex = 1 - rightHandIndex;
    } else {
      leftHandIndex = topHandedness.index;
      rightHandIndex = 1 - leftHandIndex;
    }

    return {
      leftHand: handLandmarks.landmarks[leftHandIndex],
      rightHand: handLandmarks.landmarks[rightHandIndex]
    }
  }


  testRun(characterId: string, poseData: { hands: HandLandmarkerResult, pose: PoseLandmarkerResult }) {
    const scene = this.editor.timeline.scene;
    const character = scene.get_object_by_uuid(characterId)!;

    const kkitPoseData = Kalidokit.Pose.solve(poseData.pose.worldLandmarks[0], poseData.pose.landmarks[0], {
      runtime: "mediapipe"
    })!;

    const handLandmarks = this.getHandedLandmarks(poseData.hands);
    if (!handLandmarks) {
      console.error("Hand landmarks not found");
    }

    const skeleton = new SkeletonHelper(character);

    // Rig the bones according to our new data
    // Hips move first - we must do it hierarchically 
    this.rigRotation("Hips", {
      x: kkitPoseData.Hips.rotation!.x,
      y: kkitPoseData.Hips.rotation!.y,
      z: kkitPoseData.Hips.rotation!.z,
    }, skeleton);

    this.rigPosition("Hips", {
      x: kkitPoseData.Hips.position!.x,
      y: kkitPoseData.Hips.position!.y,
      z: kkitPoseData.Hips.position!.z,
    }, skeleton);

    this.rigRotation("Spine", kkitPoseData.Spine, skeleton);

    this.rigRotation("RightUpperArm", kkitPoseData.RightUpperArm, skeleton);
    this.rigRotation("RightLowerArm", kkitPoseData.RightLowerArm, skeleton);
    this.rigRotation("LeftUpperArm", kkitPoseData.LeftUpperArm, skeleton);
    this.rigRotation("LeftLowerArm", kkitPoseData.LeftLowerArm, skeleton);

    this.rigRotation("RightUpperLeg", kkitPoseData.RightUpperLeg, skeleton);
    this.rigRotation("RightLowerLeg", kkitPoseData.RightLowerLeg, skeleton);
    this.rigRotation("LeftUpperLeg", kkitPoseData.LeftUpperLeg, skeleton);
    this.rigRotation("LeftLowerLeg", kkitPoseData.LeftLowerLeg, skeleton);

    if (handLandmarks) {
      this.applyHandData(handLandmarks, skeleton, kkitPoseData);
    }
  }

  applyHandData(handLandmarks: { leftHand: NormalizedLandmark[], rightHand: NormalizedLandmark[] }, skeleton: SkeletonHelper, kkitPoseData: Kalidokit.TPose) {
    const kkitLeftHandData = Kalidokit.Hand.solve(handLandmarks.leftHand, "Left");
    const kkitRightHandData = Kalidokit.Hand.solve(handLandmarks.rightHand, "Right");

    console.debug("Left hand data: ", kkitLeftHandData);
    console.debug("Right hand data: ", kkitRightHandData);

    if (!kkitLeftHandData || !kkitRightHandData) {
      console.error("One of more hand data not found");
      return;
    }

    // Rig the hands
    // Left hand
    this.rigHandRotation("LeftWrist", {
      x: kkitPoseData.LeftHand!.x,
      y: kkitPoseData.LeftHand!.y,
      z: kkitPoseData.LeftHand!.z,
    }, skeleton);
    // Left thumb
    this.rigHandRotation("LeftThumbProximal", kkitLeftHandData?.LeftThumbProximal, skeleton);
    this.rigHandRotation("LeftThumbIntermediate", kkitLeftHandData?.LeftThumbIntermediate, skeleton);
    this.rigHandRotation("LeftThumbDistal", kkitLeftHandData?.LeftThumbDistal, skeleton);
    // Left index
    this.rigHandRotation("LeftIndexProximal", kkitLeftHandData?.LeftIndexProximal, skeleton);
    this.rigHandRotation("LeftIndexIntermediate", kkitLeftHandData?.LeftIndexIntermediate, skeleton);
    this.rigHandRotation("LeftIndexDistal", kkitLeftHandData?.LeftIndexDistal, skeleton);
    // Left middle
    this.rigHandRotation("LeftMiddleProximal", kkitLeftHandData?.LeftMiddleProximal, skeleton);
    this.rigHandRotation("LeftMiddleIntermediate", kkitLeftHandData?.LeftMiddleIntermediate, skeleton);
    this.rigHandRotation("LeftMiddleDistal", kkitLeftHandData?.LeftMiddleDistal, skeleton);
    // Left ring
    this.rigHandRotation("LeftRingProximal", kkitLeftHandData?.LeftRingProximal, skeleton);
    this.rigHandRotation("LeftRingIntermediate", kkitLeftHandData?.LeftRingIntermediate, skeleton);
    this.rigHandRotation("LeftRingDistal", kkitLeftHandData?.LeftRingDistal, skeleton);
    // Left little/pinky
    this.rigHandRotation("LeftLittleProximal", kkitLeftHandData?.LeftLittleProximal, skeleton);
    this.rigHandRotation("LeftLittleIntermediate", kkitLeftHandData?.LeftLittleIntermediate, skeleton);
    this.rigHandRotation("LeftLittleDistal", kkitLeftHandData?.LeftLittleDistal, skeleton);


    // Right hand
    this.rigHandRotation("RightWrist", {
      x: kkitPoseData.RightHand!.x,
      y: kkitPoseData.RightHand!.y,
      z: kkitPoseData.RightHand!.z,
    }, skeleton);
    // Right thumb
    this.rigHandRotation("RightThumbProximal", kkitRightHandData?.RightThumbProximal, skeleton);
    this.rigHandRotation("RightThumbIntermediate", kkitRightHandData?.RightThumbIntermediate, skeleton);
    this.rigHandRotation("RightThumbDistal", kkitRightHandData?.RightThumbDistal, skeleton);
    // Right index
    this.rigHandRotation("RightIndexProximal", kkitRightHandData?.RightIndexProximal, skeleton);
    this.rigHandRotation("RightIndexIntermediate", kkitRightHandData?.RightIndexIntermediate, skeleton);
    this.rigHandRotation("RightIndexDistal", kkitRightHandData?.RightIndexDistal, skeleton);
    // Right middle
    this.rigHandRotation("RightMiddleProximal", kkitRightHandData?.RightMiddleProximal, skeleton);
    this.rigHandRotation("RightMiddleIntermediate", kkitRightHandData?.RightMiddleIntermediate, skeleton);
    this.rigHandRotation("RightMiddleDistal", kkitRightHandData?.RightMiddleDistal, skeleton);
    // Right ring
    this.rigHandRotation("RightRingProximal", kkitRightHandData?.RightRingProximal, skeleton);
    this.rigHandRotation("RightRingIntermediate", kkitRightHandData?.RightRingIntermediate, skeleton);
    this.rigHandRotation("RightRingDistal", kkitRightHandData?.RightRingDistal, skeleton);
    // Right little/pinky
    this.rigHandRotation("RightLittleProximal", kkitRightHandData?.RightLittleProximal, skeleton);
    this.rigHandRotation("RightLittleIntermediate", kkitRightHandData?.RightLittleIntermediate, skeleton);
    this.rigHandRotation("RightLittleDistal", kkitRightHandData?.RightLittleDistal, skeleton);
  }

}
