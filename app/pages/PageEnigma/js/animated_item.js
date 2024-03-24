import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { LipSync } from './lipsync.js';

class AnimatedItem {
    constructor(uuid) {
        this.name = uuid;
        this.anims = [];
        this.audiodrive = null;
        this.lipsync_comp = null;
        this.face = null;
        this.mixer = null;
        this.child = null;

        this.auto_blink = true;
        this.currentAction;

        this.blink_timer = 0.0;
        this.blink_every = 3.0;
        this.blink_position = 0.0;
        this.blink_speed = 8.0;
        this.blinking = false;
        this.st_blinking = false;
        this.blink_vrm = null;
    }

    load(filepath, callback) {
        this.load_glb(filepath, callback);
    }

    blink(delta) {
        if (this.blink_vrm == null) {
            return;
        }

        this.blink_timer += delta;
        if (this.blink_timer >= this.blink_every) {
            this.blinking = true;
        }

        if (this.blinking) {
            if (this.blink_position < 1 && this.st_blinking == false) {
                this.blink_position += delta * this.blink_speed;
            } else if (this.blink_position > 0) {
                this.blink_position -= delta * this.blink_speed;
                this.st_blinking = true;
            } else {
                this.blink_position = 0.0;
                this.blink_timer = 0.0;
                this.blinking = false;
                this.st_blinking = false;
            }
        }

        if (this.blink_position > 1.1) {
            this.blink_position = 1.0;
        }
        if (this.blink_position < -0.1) {
            this.blink_position = 0.0;
        }

        this.face.morphTargetInfluences[this.blink_vrm] = this.blink_position;
    }

    update(delta) {
        if (this.face != null && this.auto_blink) {
            this.blink(delta);
            if (this.mixer != null) {
                this.mixer.update(delta); // add speed here later.
            }
        }
    }

    // 3js clip
    animate(clip) {
        this.currentAction = this.mixer.clipAction(clip);
        this.currentAction.play();
    }

    // talking and plays the audio
    // takes audio clip from folder on the server .wav
    sync_lips(filepath) {
        if(this.lipsync_comp != null){
            return fetch(filepath)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error, status = ${response.status}`);
                    }
                    return response.arrayBuffer();
                }).then((arrayBuffer) => {
                    this.lipsync_comp.startFromAudioFile(arrayBuffer);
                });
        }
    }

    // Takes a glb animation loads from the server  
    load_animation(filepath, callback = null) {
        let glbLoader = new GLTFLoader();
        glbLoader.load(filepath,
            (object) => {
                let anim = object.animations[0];
                anim.name = this.name+'::'+anim.name;
                let animationAction = this.mixer.clipAction(anim);
                this.anims.push(animationAction);
                if (callback != null) {
                    callback(this.name);
                }
                this.child.animations.push(anim);
            }
        );
    }

    // loads the mesh of the character
    load_glb(filepath, callback = null) {
        let glbLoader = new GLTFLoader();
        glbLoader.load(filepath, (glb) => {
            glb.scene.children.forEach(child => {
                child.traverse(c => {
                    if (c.isMesh) {
                        c.material.metalness = 0.0;
                        c.material.specular = 0.0;
                        c.castShadow = true;
                        c.receiveShadow = true;
                        c.frustrumCulled = false;
                        c.material.transparent = false;
                        if (c.morphTargetInfluences && c.morphTargetDictionary) {
                            const blendShapeIndexI = c.morphTargetDictionary["E"];
                            if (blendShapeIndexI != null && this.face == null) {
                                this.face = c;
                                this.lipsync_comp = new LipSync(this.face);
                            }
                        }
                    }
                });
                child.frustrumCulled = false;
                child.userData.name = "CHAR::"+child.name; // Will be used for loading the character later.
                if(this.mixer == null) {
                    this.mixer = new THREE.AnimationMixer(child);
                }
                if(this.face == null) {
                    this.face = child;
                }
                this.child = child;
            });
            this.name = this.child.uuid;
            if (callback != null) {
                callback(this.name, glb.scene.children, this);
            }
        },
            (xhr) => {
            });
    }
}

export default AnimatedItem;
