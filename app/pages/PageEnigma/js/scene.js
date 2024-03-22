import * as THREE from 'three';

import { FBXLoader } from 'three/addons/loaders/FBXLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import TransformObject from './components.js';
import AnimatedItem from './animated_item.js';

class Scene {
    constructor(name) {
        this.name = name;
        this.gridHelper = null;
        this.scene = new THREE.Scene();
        this.animated_items = {};
        this.activeItem = null;
        this.animations = [];
    }

    initialize() {
        this._createGrid();
        this._create_base_lighting();
        this._create_skybox();
    }

    instantiate(name) {
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
    }

    update(delta) {
        for (let [key, value] of Object.entries(this.animated_items)) {
            this.animated_items[key].update(delta);
        }
    }

    create_character(filepath, character_name = "New Character") {
        // Add check to make sure the character does not exist already HERE PLEASE!!

        let animated = new AnimatedItem(character_name);
        animated.load(filepath, this.setup_character.bind(this))
        this.animated_items[character_name] = animated;
    }

    setup_character(character_name, children) {
        let children_uuids = [];
        children.forEach(child => {
            this.scene.add(child);
            children_uuids.push(child.uuid);
        });
        this.animated_items[character_name].load_animation("/resources/models/pose/walking.glb", this.play_anim_demo.bind(this));
        //this.animated_items[character_name].load_animation("/resources/models/fox/fox_idle.glb", this.play_anim_demo.bind(this));
    }

    _disable_skybox() {
        this.scene.background = null;
    }

    render_mode(enabled=true) {
        if(enabled) {
            this._disable_skybox();
            this.scene.remove(this.gridHelper);
        } else {
            this.scene.add(this.gridHelper);
            this._create_skybox();
        }
    }

    accept_animation_clip(clip) {
        this.animations.push(clip)
    }

    play_anim_demo(character_name) {
        this.animated_items[character_name].animate(this.animated_items[character_name].anims[0]._clip);
        this.animated_items[character_name].sync_lips("/resources/sound/2pac.wav");
        this.activeItem = character_name;
        this.accept_animation_clip(this.animated_items[character_name].anims[0]._clip);
    }

    load_glb(filepath, object_name = null, callback = null) {
        let glbLoader = new GLTFLoader();
        glbLoader.load(filepath, (glb) => {
            glb.scene.children.forEach(child => {
                child.traverse(c => {
                    if (c.isMesh) {
                        c.material.metalness = 0.0;
                        c.material.specular = 0.5;
                        c.castShadow = true;
                        c.receiveShadow = true;
                        c.material.transparent = false;
                        //if (c.morphTargetInfluences && c.morphTargetDictionary) {
                        //    const blendShapeIndexI = c.morphTargetDictionary["vrc.v_e"];
                        //    if (blendShapeIndexI != null){
                        //        c.morphTargetInfluences[blendShapeIndexI] = 1.0;
                        //    }
                        //}
                    }
                });
                if (object_name == null) {
                    child.name = filepath;
                } else {
                    child.name = object_name;
                }
                child.type = "Mesh";
                this.scene.add(child);
            });
            if (callback != null) {
                callback();
            }
        },
            (xhr) => {
            },
            (error) => {
                console.log(error)
            });
    }

    load_fbx(filepath, object_name = null, callback = null) {
        let fbxLoader = new FBXLoader();
        fbxLoader.load(filepath, (fbx) => {
            fbx.traverse(c => {
                c.castShadow = true;
                c.receiveShadow = true;
                if (c.isMesh) {
                    c.material.transparent = false;
                }
            });
            if (object_name == null) {
                fbx.name = filepath;
            } else {
                fbx.name = object_name;
            }
            fbx.type = "Mesh";
            this.scene.add(fbx);

            if (callback != null) {
                callback();
            }
        },
            (xhr) => {
                let loading_div = document.getElementById("loading-div");
                if (xhr.loaded / xhr.total < 1) {
                    loading_div.style.display = "block";
                } else {
                    loading_div.style.display = "none";
                }
            },
            (error) => {
                console.log(error)
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
    }

    _createGrid() {
        const size = 25;
        const divisions = 50;
        this.gridHelper = new THREE.GridHelper(size, divisions, new THREE.Color("rgb(199,195,195)"), new THREE.Color("rgb(161,157,157)"));
        this.scene.add(this.gridHelper);
    }
}

export default Scene;
