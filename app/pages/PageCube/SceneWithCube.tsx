import * as THREE from 'three';

export class SceneWithCube {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cube: THREE.Mesh;
  stopped: boolean;
  callback: ({x,y}:{x:number;y:number})=>void;

  update(){
    if(!this.stopped){
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
      if(this.callback && typeof this.callback === "function")
        this.callback({
          x: this.cube.rotation.x,
          y: this.cube.rotation.y
        })
    }
    this.renderer.render(this.scene, this.camera);
  }

  constructor(callback: ({x,y}:{x:number;y:number})=>void) {
    const width = 1000;
    const height = 750;

    this.callback = callback;
    this.stopped = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
  
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
  
    this.camera.position.z = 5;
  }

}

