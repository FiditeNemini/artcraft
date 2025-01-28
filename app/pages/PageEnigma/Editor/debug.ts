import * as THREE from "three";

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


export function testGlobalExperiment() {
}
