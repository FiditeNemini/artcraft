import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Scene {
    name: string;
    gridHelper: THREE.GridHelper | undefined;
    scene: THREE.Scene;
    hot_items: THREE.Object3D[] | undefined;
    selected: THREE.Object3D | undefined;

    constructor(name: string) {
        this.name = name;
        this.gridHelper;
        this.scene = new THREE.Scene();
        this.hot_items = [];
        this.selected = undefined;
    }

    initialize() {
        this.scene = new THREE.Scene();
        this._createGrid();
        this._create_base_lighting();
        this._create_skybox();
        this._create_camera_obj();
    }

    instantiate(name: string) {
        let material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        let geometry;
        if (name == "Box") {
            geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        else if (name == "Cone") {
            geometry = new THREE.ConeGeometry(0.5, 1, 16);
        }
        else if (name == "Cylinder") {
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 12);
        }
        else if (name == "Sphere") {
            geometry = new THREE.SphereGeometry(0.5, 18, 12);
        }
        else if (name == "Donut") {
            geometry = new THREE.TorusGeometry(0.5, 0.25, 8, 24);
        }

        let obj = new THREE.Mesh(geometry, material);
        obj.receiveShadow = true;
        obj.castShadow = true;
        //obj.type = "Object3D";
        obj.name = name;
        this.scene.add(obj);
        return obj.uuid;
    }

    get_object_by_uuid(uuid: string) {
        return this.scene.getObjectByProperty('uuid', uuid);
    }

    get_object_by_name(name: string) {
        return this.scene.getObjectByName(name);
    }

    createPoint(pos: THREE.Vector3, visable: boolean = true) {
        let geometry = new THREE.SphereGeometry(0.1, 18, 12);
        let material = new THREE.MeshBasicMaterial({ color: 0x05C3DD });
        let obj = new THREE.Mesh(geometry, material);
        obj.position.copy(pos);
        obj.receiveShadow = visable;
        if (this.hot_items != undefined) {
            this.hot_items.push(obj);
        }
        this.scene.add(obj);
    }

    _disable_skybox() {
        this.scene.background = null;
    }

    _create_camera_obj() {
        this.load_glb("/resources/models/camera/camera.glb", false).then((cam_obj) => {
            cam_obj.userData["name"] = "::CAM::";
            cam_obj.name = "::CAM::";
            cam_obj.position.set(0, 0.6, 1.5);
            this.scene.add(cam_obj);
        });
    }


    renderMode(enabled: boolean = true) {
        if (this.gridHelper == undefined) { return; }
        if (enabled) {
            this._disable_skybox();
            this.scene.remove(this.gridHelper);
        } else {
            this.scene.add(this.gridHelper);
            this._create_skybox();
        }
    }

    async load_glb(filepath: string, auto_add: boolean = true): Promise<THREE.Object3D> { //: Promise<THREE.Object3D> {
        return new Promise((resolve) => {
            let glbLoader = new GLTFLoader();
            glbLoader.load(filepath, (glb) => {
                glb.scene.children.forEach(child => {
                    child.traverse((c: THREE.Object3D) => {
                        if (c instanceof THREE.Mesh) {
                            c.material.metalness = 0.0;
                            c.material.specular = 0.5;
                            c.castShadow = true;
                            c.receiveShadow = true;
                            c.material.transparent = false;
                        }
                    });
                    if (child.type == "Group") {
                        if (auto_add) { this.scene.add(child.children[0]); }
                        resolve(child.children[0]);
                        return;
                    }
                    if (auto_add) { this.scene.add(child); }
                    resolve(child);
                });
            });
        });
    }

    // default skybox.
    _create_skybox() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            '/resources/skybox/night/Night_Moon_Burst_Cam_2_LeftX.png',
            '/resources/skybox/night/Night_Moon_Burst_Cam_3_Right-X.png',
            '/resources/skybox/night/Night_Moon_Burst_Cam_4_UpY.png',
            '/resources/skybox/night/Night_Moon_Burst_Cam_5_Down-Y.png',
            '/resources/skybox/night/Night_Moon_Burst_Cam_0_FrontZ.png',
            '/resources/skybox/night/Night_Moon_Burst_Cam_1_Back-Z.png',
        ]);
        this.scene.background = texture;
        console.log("Backround creation..")
    }

    // deafult image skybox.
    _create_single_skybox() {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            '/resources/skybox/single.jpg',
            () => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
                this.scene.background = texture;
            });
    }

    _create_base_lighting() {
        const color = 0xFCECE7;
        const light = new THREE.HemisphereLight(color, 0x8d8d8d, 3.0);
        this.scene.add(light);

        const directional_light = new THREE.DirectionalLight(color, 2.0);

        directional_light.position.set(5, 10, 3);
        directional_light.shadow.mapSize.width = 2048;
        directional_light.shadow.mapSize.height = 2048;
        directional_light.shadow.map = null;
        directional_light.castShadow = true;
        directional_light.shadow.bias = 0.00004;

        this.scene.add(directional_light);
        this.scene.add(directional_light.target);
        return directional_light;
    }

    _createGrid() {
        const size = 25;
        const divisions = 50;
        this.gridHelper = new THREE.GridHelper(size, divisions, new THREE.Color("rgb(199,195,195)"), new THREE.Color("rgb(161,157,157)"));
        this.scene.add(this.gridHelper);
    }
}

export default Scene;
