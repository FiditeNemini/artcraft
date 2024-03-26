import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import Scene from './scene.ts';
import APIManager from './api_manager.ts';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

import AudioEngine from './audio_engine.ts';
import TransformEngine from './transform_engine.ts';
import { TimeLine } from './timeline.ts';
import { ClipUI } from '../datastructures/clips/clip_offset.ts';

import { LipSync } from './lipsync.js';
import { LipSyncEngine } from "./lip_sync_engine.ts";
import { AnimationEngine} from "./animation_engine.ts";
import { faL } from '@fortawesome/pro-solid-svg-icons';

if (typeof window !== 'undefined') {
    import('ccapture.js').then(module => {
        const CCapture = module.CCapture;
        // You can use CCapture here
    }).catch(error => {
        console.error('Failed to load CCapture:', error);
    });
}

class EditorState {
    constructor() {
        this.selected_object = null
        this.is_loading = false 
    }
}
// Main editor class that will call everything else all you need to call is " initialize(); ".
class Editor {

    // Default params.
    constructor() {
        console.log("If you see this message twice! then it rendered twice, if you see it once it's all good.")
        // For making sure the editor only gets created onece.
        this.can_initailize = false;
        let one_element = document.getElementById("created-one-element");
        //if (one_element != null) { return; }
        this.can_initailize = true;
        let newElement = document.createElement("div");
        newElement.id = "created-one-element";
        document.body.appendChild(newElement);
        
        // Version and name.
        this.version = "v0.1";
        // Clock, scene and camera essentials.
        this.activeScene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        this.canvReference = null;
        this.composer;
        this.effectFXAA;
        this.outlinePass;
        this.last_cam_pos;
        this.saoPass;
        this.outputPass;
        this.bloomPass;
        this.smaaPass;
        this.bokehPass;
        // Transform control and selection.
        this.control = null;
        this.raycaster = null;
        this.mouse = null;
        this.selected = null;
        this.last_selected = null;
        this.transform_interaction;
        this.rendering = false;
        // API.
        this.api_manager = new APIManager();
        // Debug & Movement.
        this.stats = null;
        this.orbit = null;
        this.locked = false;
        // Recording params.
        this.capturer = null;
        this.frame_buffer = [];
        this.render_timer = 0;
        this.fps_number = 60;
        this.cap_fps = 60;
        // Timeline settings.
        this.playback = false;
        this.playback_location = 0;
        this.max_length = 10;
        // Audio Engine Test.

        this.audio_engine = new AudioEngine();
        this.transform_engine = new TransformEngine();
        this.lipsync_engine = new LipSyncEngine();
        this.animation_engine = new AnimationEngine();
        this.timeline = new TimeLine(this.audio_engine,
                                     this.transform_engine, 
                                     this.lipsync_engine,
                                     this.animation_engine, 
                                     this.activeScene);

        this.test_box_uuid = null;
        this.current_frame = 0;
        this.test_playback = false;
    }

    // Initializes the main scene and ThreeJS essentials.
    initialize() {
        if (this.can_initailize == false) { return; }
        // Gets the canvas.
        this.canvReference = document.getElementById("video-scene");
        // Base width and height.
        let width = this.canvReference.width;
        let height = this.canvReference.height;
        // Sets up camera and base position.
        this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 50);
        this.camera.position.z = 3;
        this.camera.position.y = 3;
        this.camera.position.x = -3;
        // Base WebGL render and clock for delta time.
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvReference, preserveDrawingBuffer: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMapSoft = true;
        this.clock = new THREE.Clock();
        // Resizes the renderer.
        this.renderer.setSize(width, height);
        //document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.onWindowResize.bind(this));
        // Current scene for saving and loading.
        this.activeScene = new Scene();
        this._configure_post_pro();
        this.activeScene.initialize();
        // Controls and movement.
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.control = new TransformControls(this.camera, this.renderer.domElement);
        // OnClick and MouseMove events.
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('click', this.onMouseClick.bind(this), false);
        // Base control and debug stuff remove debug in prod.
        this._initialize_control();
        // Resets canvas size.
        this.onWindowResize();
        // Creates the main update loop.
        this.renderer.setAnimationLoop(this.update_loop.bind(this));
        this.test_playback = false;

        this.timeline.scene = this.activeScene;
        
        this._test_demo()
    }

    // uploading some objects for testing to get their media ids from my account.
    async _upload_for_testing() {
        // have to upload as a file first

        // This is the default scene.
        // "m_189p8hj0eyypbg74kkhcpehwpjhnkz" scene with the fox.
        let result = await this.api_manager.saveSceneState(this.activeScene.scene)
        console.log(result)
    }

    async _test_demo() {
        // note the database from the server is the source of truth for all the data.
        // Test code here
        let object = await this.activeScene.load_glb("./resources/models/fox/fox.glb")

        // load object into the engine for lip syncing
        this.lipsync_engine.load_object(object.uuid, "m_f1jxx4zwy4da2zn0cvdqhha7kqkj72");

        // create the clip with the same id for a reference to the media
        this.timeline.addPlayableClip(new ClipUI(1.0, "lipsync", "clip1", "m_f1jxx4zwy4da2zn0cvdqhha7kqkj72", object.uuid, 150, 400));
        
        // media id for this is up in the air but when a path is created you should be able to store and delete it
        this.timeline.addPlayableClip(new ClipUI(1.0, "transform", "clip2", object.uuid, object.uuid, 0, 150));

        // media id for this as well it can be downloaded
        this.timeline.addPlayableClip(new ClipUI(1.0, "animation", "clip3", "/resources/models/fox/fox_idle.glb", object.uuid, 0, 400));
        this.animation_engine.load_object(object.uuid, "/resources/models/fox/fox_idle.glb", "clip3");
    }

    // Configure post processing.
    _configure_post_pro() {
        let width = this.canvReference.width;
        let height = this.canvReference.height;

        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.activeScene.scene, this.camera);
        this.composer.addPass(this.renderPass);

        this.outlinePass = new OutlinePass(new THREE.Vector2(width, height), this.activeScene.scene, this.camera);

        this.outlinePass.edgeStrength = 6.0;
        this.outlinePass.edgeGlow = 0.2;
        this.outlinePass.edgeThickness = 1.0;
        this.outlinePass.pulsePeriod = 3;
        this.outlinePass.rotate = false;
        this.outlinePass.usePatternTexture = false;
        this.outlinePass.visibleEdgeColor.set(0xe66462);

        this.composer.addPass(this.outlinePass);

        this.saoPass = new SAOPass(this.activeScene.scene, this.camera);

        this.saoPass.params.saoBias = 3.1;
        this.saoPass.params.saoIntensity = 1.0;
        this.saoPass.params.saoScale = 6.0;
        this.saoPass.params.saoKernelRadius = 5.0;
        this.saoPass.params.saoMinResolution = 0.0;

        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
        this.bloomPass.strength = 0.25;

        this.smaaPass = new SMAAPass(width * this.renderer.getPixelRatio(), height * this.renderer.getPixelRatio());

        this.bokehPass = new BokehPass(this.activeScene.scene, this.camera, {
            focus: 3.0,
            aperture: 0.00001,
            maxblur: 0.01
        });

        this.composer.addPass(this.saoPass);
        this.composer.addPass(this.bloomPass);
        this.composer.addPass(this.smaaPass);
        this.composer.addPass(this.bokehPass);

        this.outputPass = new OutputPass();
        this.composer.addPass(this.outputPass);
    }

    render_mode() {
        this.rendering = !this.rendering;
        this.activeScene.render_mode(this.rendering);

        //if (this.rendering) {
        //    this._remove_post_processing();
        //} else {
        //    this._add_post_processing();
        //}
    }

    togglePlay() {
        this.playback = !this.playback;
        this.playback_location = 0;
        if (this.playback == false) {
            this.stopPlayback();
        } else {
            // REMOVE THIS NEXT LINE IN PROD ONLY FOR TEST!!!!!
            //this.activeScene.play_anim_demo(this.activeScene.activeCharacter);
        }
    }

    save() {
        //console.log(this.control);
        //if(this.selected != null){ this.control.detach(this.selected); }
        //this.activeScene.scene.remove(this.control);
        //this.activeScene.scene.remove(this.activeScene.gridHelper);
        //this.save_manager.save(this.activeScene.scene, this._save_to_cloud.bind(this), this.audio_manager, this.timeline, this.activeScene.animations);
        //this.activeScene._createGrid();
        //this.audio_engine.playClip("m_f7jnwt3d1ddchatdk5vaqt0n4mb1hg");
        //console.log(this.selected);
        
        if(this.selected == null) {return;}
        this.transform_engine.addFrame(this.selected)
        console.log("Frame taken.")
    }

    change_camera_view() {
        //let obj = this.activeScene.get_object_by_uuid(this.test_box_uuid);
        //this.transform_engine.clips[this.test_box_uuid].step(obj);
        //console.log(this.transform_engine.clips[this.test_box_uuid].current_pos)
        //this.current_frame += 1;
        this.test_playback = !this.test_playback;
        //this.transform_engine.clips[this.test_box_uuid].reset(this.activeScene.get_object_by_uuid(this.test_box_uuid));
    }


    // Basicly Unity 3D's update loop.
    update_loop(time) {
        // Updates debug stats.
        if (this.stats != null) { this.stats.update(); }

        let delta_time = this.clock.getDelta()

        // All calls that are not super important like timeline go here.
        //this.activeScene.update(delta_time);
        //this.orbit.update(0.1);

        //console.log(this.transform_engine.clips[this.test_box_uuid]);

        this.timeline.update(delta_time);

        this.render_scene();
        if (this.capturer != null) { this.capturer.capture(this.renderer.domElement); } // Record scene.
    }

    start_playback() {
        this.timeline.isPlaying = true;
    }

    // _save_to_cloud(blob) {
    //     this.api_manager.uploadGLB(blob, "test.glb");
    // }

    change_mode(type) {
        this.control.mode = type;
        this.transform_interaction = true;
    }

    // Sets the fps to a specific number
    set_fps(fps_number) {
        this.cap_fps = fps_number;
    }

    // Toggles playback and recording.
    togglePlayback() {
        this.togglePlay();
        if (this.playback == false) {
            //this.stopPlayback();
            this.render_mode();
        } else {
            //this.startPlayback();
            this.render_mode();
        }
    }

    async loadWavAsBlob(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        return blob;
    }

    async stopPlayback() {
        this.render_mode();
        let ffmpeg = createFFmpeg({ log: true });
        await ffmpeg.load();
        for (let index = 0; index < this.frame_buffer.length; index++) {
            const element = this.frame_buffer[index];
            await ffmpeg.FS('writeFile', `image${index}.png`, await fetchFile(element));
        }
        await ffmpeg.run('-framerate', '' + this.cap_fps, '-i', 'image%d.png', 'output.mp4');
        let output = await ffmpeg.FS('readFile', 'output.mp4');
        // Create a Blob from the output file for downloading
        const blob = new Blob([output.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        await this.api_manager.uploadMedia(blob, "output.mp4");
        // Create a link to download the file
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'output.mp4';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(downloadLink);
    }

    startPlayback() {
        this.playback_location = 0;
        this._initialize_recording();
    }

    // Initializes transform x y z changes.
    _initialize_control() {
        this.control.addEventListener('change', this.render_scene.bind(this));
        this.control.addEventListener('dragging-changed', function (event) {
            this.orbit.enabled = !event.value;
            // this.update_properties();
        }.bind(this));
        this.control.setSize(0.5); // Good default value for visuals.
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.activeScene.scene.add(this.control);
    }

    // Initializes CCapture for capturing the scene to send over to backend.
    _initialize_recording() {
        this.frame_buffer = [];
        this.render_timer = 0;
    }

    // Render the scene to the camera.
    render_scene() {
        if (this.composer != null) {
            this.composer.render();
        }
        else {
            this.renderer.render(this.activeScene.scene, this.camera);
        }

        if (this.rendering) {
            this.playback_location++;
            let imgData = this.renderer.domElement.toDataURL();
            this.frame_buffer.push(imgData);
            this.render_timer += this.clock.getDelta();
            if (this.playback_location >= this.fps_number * 3) {
                this.stopPlayback();
                this.playback_location = 0;
                this.rendering = false;
            }
        }
    }

    // Automaticly resize scene.
    onWindowResize() {
        // Calculate the maximum possible dimensions while maintaining the aspect ratio
        let width = window.innerWidth;// / aspect_adjust;
        let height = window.innerHeight;// / aspectRatio;

        // Set the camera aspect to the desired aspect ratio
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // Set the renderer size to the calculated dimensions
        this.renderer.setSize(width, height);
        if (this.composer != null) {
            this.composer.setSize(width, height);
        }
    }

    // Sets new mouse location usually used in raycasts.
    onMouseMove(event) {
        const rect = this.canvReference.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    // When the mouse clicks the screen.
    onMouseClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let interactable = []
        this.activeScene.scene.children.forEach(child => {
            if (child.name != "") {
                if (child.type == "Mesh" || child.type == "Object3D") {
                    interactable.push(child);
                }
            }
        });
        let intersects = this.raycaster.intersectObjects(interactable, true);

        if (intersects.length > 0) {
            if (intersects[0].object.type != "GridHelper") {
                let currentObject = intersects[0].object;
                while (currentObject.parent.type !== "Scene") {
                    currentObject = currentObject.parent;
                }
                this.selected = currentObject;
                if (this.selected.type == "Scene") {
                    this.selected = intersects[0].object;
                }
                // this.update_properties();
                this.activeScene.scene.add(this.control);
                this.control.attach(this.selected);
                this.outlinePass.selectedObjects = [this.selected];
                this.transform_interaction = true;
            }
        } else if (this.transform_interaction == false) {
            this.last_selected = this.selected
            this.control.detach(this.selected);
            this.activeScene.scene.remove(this.control);
            this.outlinePass.selectedObjects = [];
        } else {
            this.transform_interaction = false;
        }
    }
}

export default Editor;
