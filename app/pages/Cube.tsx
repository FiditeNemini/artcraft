import * as THREE from 'three';

export class SceneWithCube {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cube: THREE.Mesh;
  stopped: boolean;

  update(){
    
    console.log("animating in Cube");

    if(!this.stopped){
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
    }
    this.renderer.render(this.scene, this.camera);
  }

  constructor() {
    const width = 1000;
    const height = 750;

    this.stopped = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    // mountRef?.current?.appendChild(renderer.domElement);
  
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
  
    this.camera.position.z = 5;
  }

}

