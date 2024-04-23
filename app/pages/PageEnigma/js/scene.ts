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

    instantiate(name: string, pos: THREE.Vector3 = new THREE.Vector3(0,0,0)) {
        let material = new THREE.MeshPhongMaterial({ color: 0xDACBCE });
        material.shininess = 0.0;
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
        obj.userData["media_id"] = "Parim";
        //obj.type = "Object3D";
        obj.name = name;
        obj.position.copy(pos);
        obj.userData["color"] = "#FFFFFF";
        obj.userData["metalness"] = 0.0;
        obj.userData["shininess"] = 0.5;
        obj.userData["specular"] = 0.0;
        this.scene.add(obj);
        return obj.uuid;
    }

    get_object_by_uuid(uuid: string) {
        return this.scene.getObjectByProperty('uuid', uuid);
    }

    get_object_by_name(name: string) {
        return this.scene.getObjectByName(name);
    }

    createPoint(pos: THREE.Vector3, keyframe_uuid: string): THREE.Object3D {
        let geometry = new THREE.SphereGeometry(0.1, 18, 12);
        let material = new THREE.MeshBasicMaterial({ color: 0x05C3DD });
        let obj = new THREE.Mesh(geometry, material);
        obj.position.copy(pos);
        obj.receiveShadow = false;
        obj.castShadow = false;
        obj.userData['media_id'] = "Point::" + keyframe_uuid;
        obj.layers.set(1); // Enable default layer
        if (this.hot_items != undefined) {
            this.hot_items.push(obj);
        }
        this.scene.add(obj);
        return obj;
    }

    deletePoint(keyframe_uuid: string) {
        this.scene.traverse((object) => {
            if (object.userData.media_id) {
                let obj_keyframe_uuid = object.userData.media_id.replace("Point::", "");
                console.log(obj_keyframe_uuid);
                if (obj_keyframe_uuid === keyframe_uuid) {
                    console.log("Found!", object);
                    this.scene.remove(object);
                    return;
                }
            }
        });
    }

    _disable_skybox() {
        //this.scene.background = null;
    }

    _create_camera_obj() {
        this.load_glb("m_cxh4asqhapdz10j880755dg4yevshb", false).then((cam_obj) => {
            cam_obj.userData["name"] = "::CAM::";
            cam_obj.name = "::CAM::";
            cam_obj.position.set(0, 0.6, 1.5);
            cam_obj.layers.set(1);
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

    async getMediaURL(media_id: string) {
        //This is for prod when we have the proper info on the url.
        let api_base_url = "https://api.fakeyou.com";
        let url = `${api_base_url}/v1/media_files/file/${media_id}`
        let responce = await fetch(url);
        let json = await JSON.parse(await responce.text());
        let bucketPath = json["media_file"]["public_bucket_path"];
        let media_base_url = "https://storage.googleapis.com/vocodes-public"
        let media_url = `${media_base_url}${bucketPath}`
        return media_url;
    }

    async load_glb(media_id: string, auto_add: boolean = true): Promise<THREE.Object3D> { //: Promise<THREE.Object3D> {
        return new Promise(async (resolve) => {
            let glbLoader = new GLTFLoader();
            glbLoader.load(await this.getMediaURL(media_id), (glb) => {
                glb.scene.children.forEach(child => {
                    child.traverse((c: THREE.Object3D) => {
                        if (c instanceof THREE.Mesh) {
                            c.material.side = THREE.FrontSide;
                            c.material.metalness = 0.0;
                            c.material.specular = 0.5;
                            c.material.shininess = 0.0;
                            c.castShadow = true;
                            c.receiveShadow = true;
                            c.frustumCulled = false;
                            c.material.transparent = false;
                        }
                    });
                    child.frustumCulled = false;
                    child.userData["media_id"] = media_id;
                    child.userData["color"] = "#FFFFFF";
                    child.userData["metalness"] = 0.0;
                    child.userData["shininess"] = 0.5;
                    child.userData["specular"] = 0.5;
                    child.layers.enable(0);
                    child.layers.enable(1);
                    if (auto_add) { this.scene.add(child); }
                    resolve(child);
                });
            });
        });
    }

    async load_glb_absolute(filepath: string, auto_add: boolean = true): Promise<THREE.Object3D> { //: Promise<THREE.Object3D> {
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
                    child.userData["color"] = "#FFFFFF";
                    if (auto_add) { this.scene.add(child); }
                    resolve(child);
                });
            });
        });
    }

    // default skybox.
    _create_skybox() {
        const loader = new THREE.CubeTextureLoader();

        // const texture = loader.load([
        //     '/resources/skybox/night/Night_Moon_Burst_Cam_2_LeftX.png',
        //     '/resources/skybox/night/Night_Moon_Burst_Cam_3_Right-X.png',
        //     '/resources/skybox/night/Night_Moon_Burst_Cam_4_UpY.png',
        //     '/resources/skybox/night/Night_Moon_Burst_Cam_5_Down-Y.png',
        //     '/resources/skybox/night/Night_Moon_Burst_Cam_0_FrontZ.png',
        //     '/resources/skybox/night/Night_Moon_Burst_Cam_1_Back-Z.png',
        // ]);
        
        const texture = loader.load([
            '/resources/skybox/day/px.png',
            '/resources/skybox/day/nx.png',
            '/resources/skybox/day/py.png',
            '/resources/skybox/day/ny.png',
            '/resources/skybox/day/pz.png',
            '/resources/skybox/day/nz.png',
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
        directional_light.castShadow = false;
        directional_light.shadow.bias = 0.00004;
        directional_light.userData["media_id"] = "DirectionalLight";

        this.scene.add(directional_light);
        this.scene.add(directional_light.target);
        return directional_light;
    }

    _createGrid() {
        const size = 25;
        const divisions = 50;
        this.gridHelper = new THREE.GridHelper(size, divisions, new THREE.Color("rgb(199,195,195)"), new THREE.Color("rgb(161,157,157)"));
        this.gridHelper.layers.set(1); // Enable default layer
        this.scene.add(this.gridHelper);
    }
}

export default Scene;
