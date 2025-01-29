import * as THREE from "three";

//import * as Kalidokit from "kalidokit";
import * as Kalidokit from "kalidokit"
import { TFace } from "kalidokit";
//import { Pose } from "kalidokit";
//const Kalidokit = require('kalidokit');

import { FilesetResolver, PoseLandmarker, PoseLandmarkerResult } from "@mediapipe/tasks-vision"
import { CharacterPoseHelper } from "./Engines/Helpers/CharacterPoseHelper";
import { loadImageFromAnonymousOriginUrl } from "~/Helpers/ImageHelpers";

// TODO(bt,2025-01-28): I don't understand this codebase well yet, and I'm trying to apply bone rotations.
// This is a simple set of experiments for me to come up to speed with Threejs, our code, and the theoretical 
// task at hand. IF THIS CODE IS PRESENT IN THE FUTURE IT SHOULD BE REMOVED AS IT SERVES NO OTHER PURPOSE.

const DEBUG_ENABLED = false;
const DEBUG_PRINT_ENABLED = false;

export function print_children(obj: THREE.Object3D<THREE.Object3DEventMap>) {
  if(DEBUG_PRINT_ENABLED) { 
    do_print_children(obj);
  }
}

function do_print_children(obj: THREE.Object3D<THREE.Object3DEventMap>, level: number = 0) {
  const space = "  ".repeat(level);
  console.log(`${space} - ${obj.name}`);

  for(let i in obj.children) {
    let child = obj.children[i];
    do_print_children(child, level + 1);
  }
}

function rotateChildBone(obj: THREE.Object3D<THREE.Object3DEventMap>, name: string, x: number, y: number, z: number) {
  // https://discourse.threejs.org/t/solved-how-to-rotate-arm-of-skinned-and-rigged-character/5572
  // https://jsfiddle.net/bdmrg4oc/1/
  const child = obj.getObjectByName(name);
  if (!!!child) {
    return;
  }
  child.rotation.x = x;
  child.rotation.y = y;
  child.rotation.z = z;
}

export function testDeformBody(obj: THREE.Object3D<THREE.Object3DEventMap>) {
  if (!DEBUG_ENABLED) {
    return;
  }
  rotateChildBone(obj, "mixamorigLeftLeg", 1, 2, 0);
  rotateChildBone(obj, "mixamorigRightArm", 0, 1, 2);
  rotateChildBone(obj, "mixamorigLeftShoulder", 2, 0, 2);
  rotateChildBone(obj, "mixamorigHead", 1, 1, 1);
}


export async function testGlobalExperiment() {
  const firstFrameUrl : string | undefined = (window as any).firstFrameMediaUrl;
  const characterRig : THREE.Object3D<THREE.Object3DEventMap> | undefined = (window as any).lastCharacter;
  if (!!!firstFrameUrl || !!!characterRig) {
    return;
  }
  doTest(firstFrameUrl, characterRig);
}

async function doTest(firstFrameUrl: string, characterRig: THREE.Object3D<THREE.Object3DEventMap>) {
  rotateChildBone(characterRig, "mixamorigLeftLeg", 1, 2, 0);
  rotateChildBone(characterRig, "mixamorigRightArm", 0, 1, 2);
  rotateChildBone(characterRig, "mixamorigLeftShoulder", 2, 0, 2);
  rotateChildBone(characterRig, "mixamorigHead", 1, 1, 1);

  //const poseHelper = new CharacterPoseHelper(editorEngine!);
  //const pose = poseHelper.extractPoseData(firstFrameUrl);

  const image = await loadImageFromAnonymousOriginUrl(firstFrameUrl);
  console.debug("Loaded image for inference", image, image.width, image.height);

  const solutions = await solveForImage(image);

  console.log('mediapipe solution', solutions);

  // TODO
  const poseWorld3DArray : any = solutions.worldLandmarks;
  const poseLandmarkArray : any = solutions.landmarks;

  let solution = Kalidokit.Pose.solve(poseWorld3DArray, poseLandmarkArray, {
    runtime:'mediapipe', // default is 'mediapipe'
    //video: HTMLVideoElement,// specify an html video or manually set image size
    imageSize:{
        width: 640,
        height: 480,
    }
  });

  console.log('kalidokit solution', solution);
}


async function solveForImageUrl(imageUrl: string) : Promise<PoseLandmarkerResult> {
  const image = await loadImageFromAnonymousOriginUrl(imageUrl);
  console.debug("Loaded image for inference", image, image.width, image.height);
  return solveForImage(image);
}

async function solveForImage(image: HTMLImageElement) : Promise<PoseLandmarkerResult> {
  //const image : string = await loadImageFromAnonymousOriginUrl(imageUrl);
  //console.debug("Loaded image for inference", image, image.width, image.height);

  // TODO: Cache this.
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  
  const numPoses = 1;
  const runningMode = "IMAGE";

  const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numPoses: numPoses
  });

  const poseResults = poseLandmarker.detect(image)
  console.debug("Pose results: ", poseResults);

  return poseResults;
}
