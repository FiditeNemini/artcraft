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

const DEBUG_ENABLED = true;
const DEBUG_PRINT_ENABLED = true;

// NB: From James Bond image.
const EXAMPLE_POSE : any = {
  "RightUpperArm": {
      "x": -0.4230379402555594,
      "y": 1.7737168782435317,
      "z": -1.0277683620346483
  },
  "RightLowerArm": {
      "x": -0.3,
      "y": 0.9865853333958371,
      "z": 0.3779985683628639
  },
  "LeftUpperArm": {
      "x": 0.005554997408462992,
      "y": -1.4626850489681587,
      "z": 1.1226644661733884
  },
  "LeftLowerArm": {
      "x": -0.015415961257577574,
      "y": -0.3543613298595948,
      "z": 0
  },
  "RightHand": {
      "x": -0.42668629235907013,
      "y": -0.47942290499788864,
      "z": 0.5513363407475719
  },
  "LeftHand": {
      "x": 0.1791247835953645,
      "y": 0.6,
      "z": 0.9815028962744002
  },

  "RightUpperLeg": {
      "x": 0.48739810481744406,
      "y": 0.5335122086099788,
      "z": -0.26540331612091095,
      "rotationOrder": "XYZ"
  },
  "RightLowerLeg": {
      "x": -1.987357750417811,
      "y": 0,
      "z": 0,
      "rotationOrder": "XYZ"
  },
  "LeftUpperLeg": {
      "x": 0.5327440321782165,
      "y": 0.40825017329318186,
      "z": -0.31162463497702436,
      "rotationOrder": "XYZ"
  },
  "LeftLowerLeg": {
      "x": -1.7621100159383252,
      "y": 0,
      "z": 0,
      "rotationOrder": "XYZ"
  },
  "Hips": {
      "position": {
          "x": 0.009826546907424905,
          "y": 0,
          "z": -0.4867018217668233
      },
      "worldPosition": {
          "x": -0.00453158195232334,
          "y": 0,
          "z": -0.4611571078848962
      },
      "rotation": {
          "x": 0,
          "y": 0.2743397512486982,
          "z": 0.0003709216445107318
      }
  },
  "Spine": {
      "x": 0,
      "y": 0.2714237930344275,
      "z": 0.07454435135366712
  }
};

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

function mapRotation(obj: THREE.Object3D<THREE.Object3DEventMap>, sourceName: string, destinationName: string) {
  const sourceRotation = EXAMPLE_POSE[sourceName];
  if (!!!sourceRotation) {
    console.error(`No rotation named ${sourceName}`)
    return;
  }
  rotateChildBone(obj, destinationName, sourceRotation.x, sourceRotation.y, sourceRotation.z);
}

function mapRotationFrom(obj: THREE.Object3D<THREE.Object3DEventMap>, source: any, sourceName: string, destinationName: string) {
  const sourceRotation = source[sourceName];
  if (!!!sourceRotation) {
    console.error(`No rotation named ${sourceName}`)
    return;
  }
  rotateChildBone(obj, destinationName, sourceRotation.x, sourceRotation.y, sourceRotation.z);
}

export function testDeformBody(obj: THREE.Object3D<THREE.Object3DEventMap>) {
  if (!DEBUG_ENABLED) {
    return;
  }
  mapRotation(obj, "Spine", "mixamorigSpine");

  //mapRotation(obj, "RightUpperArm", "mixamorigRightArm");
  mapRotation(obj, "RightHand", "mixamorigRightHand");
  mapRotation(obj, "LeftHand", "mixamorigLeftHand");

  //mapRotation(obj, "RightUpperArm", "mixamorigRightShoulder");
  mapRotation(obj, "RightUpperArm", "mixamorigRightArm");
  //mapRotation(obj, "LeftUpperArm", "mixamorigLeftShoulder");
  mapRotation(obj, "LeftUpperArm", "mixamorigLeftArm");

  mapRotation(obj, "RightLowerArm", "mixamorigRightForeArm");
  mapRotation(obj, "LeftLowerArm", "mixamorigLeftForeArm");

  //obj.rotation.x = EXAMPLE_POSE.Hips.rotation.x;
  //obj.rotation.y = EXAMPLE_POSE.Hips.rotation.y;
  //obj.rotation.z = EXAMPLE_POSE.Hips.rotation.z;

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
  //rotateChildBone(characterRig, "mixamorigLeftLeg", 1, 2, 0);
  //rotateChildBone(characterRig, "mixamorigRightArm", 0, 1, 2);
  //rotateChildBone(characterRig, "mixamorigLeftShoulder", 2, 0, 2);
  //rotateChildBone(characterRig, "mixamorigHead", 1, 1, 1);

  //const poseHelper = new CharacterPoseHelper(editorEngine!);
  //const pose = poseHelper.extractPoseData(firstFrameUrl);

  const image = await loadImageFromAnonymousOriginUrl(firstFrameUrl);
  console.debug("Loaded image for inference", image, image.width, image.height);

  const solutions = await solveForImage(image);

  console.log('mediapipe solution', solutions);
  (window as any).solutions = solutions;

  // TODO
  const poseWorld3DArray : any = solutions.worldLandmarks[0];
  const poseLandmarkArray : any = solutions.landmarks[0];

  let solution = Kalidokit.Pose.solve(poseWorld3DArray, poseLandmarkArray, {
    runtime:'mediapipe', // default is 'mediapipe'
    //video: HTMLVideoElement,// specify an html video or manually set image size
    imageSize:{
        width: image.width,
        height: image.height,
    }
  });

  console.log('kalidokit solution', solution);

  mapRotationFrom(characterRig, solution, "Spine", "mixamorigSpine");

  mapRotationFrom(characterRig, solution, "RightHand", "mixamorigRightHand");
  mapRotationFrom(characterRig, solution, "LeftHand", "mixamorigLeftHand");

  mapRotationFrom(characterRig, solution, "RightUpperArm", "mixamorigRightArm");
  mapRotationFrom(characterRig, solution, "LeftUpperArm", "mixamorigLeftArm");

  mapRotationFrom(characterRig, solution, "RightLowerArm", "mixamorigRightForeArm");
  mapRotationFrom(characterRig, solution, "LeftLowerArm", "mixamorigLeftForeArm");
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
