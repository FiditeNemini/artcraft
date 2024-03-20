import * as THREE from 'three';

import { FBXLoader } from 'three/addons/loaders/FBXLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import TransformObject from './components.js';
import Character from './character.js';

class Scene {
    constructor(name) {
        this.name = name;
        this.gridHelper = null;
        this.scene = new THREE.Scene();
        this.characters = {};
        this.activeCharacter = null;
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
        for (let [key, value] of Object.entries(this.characters)) {
            this.characters[key].update(delta);
        }
    }

    create_character(filepath, character_name = "New Character") {
        // Add check to make sure the character does not exist already HERE PLEASE!!

        let character = new Character(character_name);
        character.load(filepath, this.setup_character.bind(this))
        this.characters[character_name] = character;
    }

    setup_character(character_name, children) {
        let children_uuids = [];
        children.forEach(child => {
            this.scene.add(child);
            children_uuids.push(child.uuid);
        });
        this.characters[character_name].load_animation("/resources/models/fox/fox_idle.glb", this.play_anim_demo.bind(this));
    }

    play_anim_demo(character_name) {
        this.characters[character_name].animate(this.characters[character_name].anims[0]._clip);
        this.characters[character_name].sync_lips("/resources/sound/2pac.wav");
        this.activeCharacter = character_name;
    }

    load_glb(filepath, object_name = null, callback = null) {
        let glbLoader = new GLTFLoader();
        glbLoader.load(filepath, (glb) => {
            glb.scene.children.forEach(child => {
                child.traverse(c => {
                    if (c.isMesh) {
                        c.material.metalness = 0.0;
                        c.material.specular = 0.25;
                        c.castShadow = true;
                        c.receiveShadow = false;
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
            '/resources/skybox/mystic_ft.jpg',
            '/resources/skybox/mystic_bk.jpg',
            '/resources/skybox/mystic_up.jpg',
            '/resources/skybox/mystic_dn.jpg',
            '/resources/skybox/mystic_rt.jpg',
            '/resources/skybox/mystic_lf.jpg',
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
        const light = new THREE.HemisphereLight(color, 0x8d8d8d, 3.5);
        this.scene.add(light);

        const directional_light = new THREE.DirectionalLight(color, 3.5);

        directional_light.position.set(5, 10, 3);
        directional_light.shadow.mapSize.width = 4096;
        directional_light.shadow.mapSize.height = 4096;
        directional_light.shadow.map = null;
        directional_light.castShadow = true;

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
