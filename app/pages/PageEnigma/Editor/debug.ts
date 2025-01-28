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

export function deformBody(obj: THREE.Object3D<THREE.Object3DEventMap>) {
  if (!DEBUG_ENABLED) {
    return;
  }

  // https://discourse.threejs.org/t/solved-how-to-rotate-arm-of-skinned-and-rigged-character/5572
  // https://jsfiddle.net/bdmrg4oc/1/
  const leg = obj.getObjectByName("mixamorigLeftLeg")
  if (!leg) {
    return;
  }
  console.log('leg', leg);

  leg.rotation.x = 1;
  leg.rotation.y = 2;

  const arm = obj.getObjectByName("mixamorigRightArm")
  if (!arm) {
    return;
  }
  console.log('arm', arm);

  arm.rotation.x = 1;
  arm.rotation.y = 2;
}


export function globalExperiment() {
}
