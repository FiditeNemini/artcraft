import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import Scene from './scene.js';
import SaveManager from './serialization.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';

// Main editor class that will call everything else all you need to call is " initialize(); ".
class Editor {

    // Default params.
    constructor() {
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

        this.locked = false;

        // Debug & Movement.
        this.stats = null;
        this.orbit = null;

        // Recording params.
        this.capturer = null;
        this.cap_fps = 24;

        // Timeline settings.
        this.playback = false;
        this.playback_location = 0;
        this.max_length = 10;

        // Save & Load.
        this.save_manager = new SaveManager(this.version);
    }

    // Initializes the main scene and ThreeJS essentials.
    initialize() {
        // Gets the canvas.
        this.canvReference = document.getElementById("video-scene");

        // Base width and height.
        let width = this.canvReference.width;
        let height = this.canvReference.height;

        // Sets up camera and base position.
        this.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
        this.camera.position.z = 2;
        this.camera.position.y = 2;
        this.camera.position.x = 2;

        // Base WebGL render and clock for delta time.
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvReference });
        this.renderer.shadowMap.enabled = true;
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
        //this.orbit.movementSpeed = 1;
        //this.orbit.rollSpeed = Math.PI / 24;
        //this.orbit.autoForward = false;
        //this.orbit.dragToLook = true;
        //this.orbit.damping = 0.2;

        this.control = new TransformControls(this.camera, this.renderer.domElement);

        // OnClick and MouseMove events.
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('click', this.onMouseClick.bind(this), false);

        window.addEventListener("keypress", this._setup_keys.bind(this), false)

        //window.addEventListener('contextmenu', this.onContextMenu.bind(this), false);
        //window.addEventListener("mouseup", this.onMouseUp.bind(this), false);

        // Base control and debug stuff remove debug in prod.
        this._initialize_control();
        this._debug_stats(); // REMOVE IN PRODUCTION

        // UI & UX stuff.
        // this._setup_buttons();

        // Example scene remove in prod.
        this._initialize_example_scene();

        // Resets canvas size.
        this.onWindowResize();
        // Creates the main update loop.
        this.renderer.setAnimationLoop(this.update_loop.bind(this));

        //this.create_geometry("Box");
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

        this.saoPass.params.saoBias = 3.0;
        this.saoPass.params.saoIntensity = 0.1;
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

    _setup_keys(event) {
        let boundTranlationMode = this.change_mode.bind(this);
        switch (event.key){
            case 'e':
                boundTranlationMode("scale");
                break;
            case 'r':
                boundTranlationMode("rotate");
                break;
            case 't':
                boundTranlationMode("translate");
                break;
            case ' ':
                //this.startPlayback();
                break;
        }
    }

    // Sets up the UI buttons
    _setup_buttons() {
        document.getElementById("playButton").addEventListener("click", this.togglePlay.bind(this));
        document.getElementById("fps-60").addEventListener("click", () => this.set_fps(60));
        document.getElementById("fps-30").addEventListener("click", () => this.set_fps(30));
        document.getElementById("fps-24").addEventListener("click", () => this.set_fps(24));

        // Creation buttons.
        let boundCreateGeometry = this.create_geometry.bind(this);
        document.getElementById("C-Box").addEventListener("click", () => boundCreateGeometry("Box"));
        document.getElementById("C-Cone").addEventListener("click", () => boundCreateGeometry("Cone"));
        document.getElementById("C-Cylinder").addEventListener("click", () => boundCreateGeometry("Cylinder"));
        document.getElementById("C-Sphere").addEventListener("click", () => boundCreateGeometry("Sphere"));
        document.getElementById("C-Donut").addEventListener("click", () => boundCreateGeometry("Donut"));

        let boundTranlationMode = this.change_mode.bind(this);
        document.getElementById("mov-transform").addEventListener("click", () => boundTranlationMode("translate"));
        document.getElementById("mov-scale").addEventListener("click", () => boundTranlationMode("scale"));
        document.getElementById("mov-rotate").addEventListener("click", () => boundTranlationMode("rotate"));

        document.getElementById("btn-save").addEventListener("click", this.save.bind(this));
        document.getElementById("btn-load").addEventListener("click", () => document.getElementById("load-upload").click());
        document.getElementById('load-upload').addEventListener('change', this.load.bind(this));

        // Rendering buttons
        document.getElementById("render-btn").addEventListener("click", this.togglePlayback.bind(this));
    }

    togglePlay() {
        this.playback = !this.playback;
        this.playback_location = 0;
        if (this.playback == false) {
            this.stopPlayback();
        } else {
            // REMOVE THIS NEXT LINE IN PROD ONLY FOR TEST!!!!!
            this.activeScene.play_anim_demo(this.activeScene.activeCharacter);
        }
    }

    save() {
        this.control.detach(this.selected);
        this.activeScene.scene.remove(this.control);
        this.activeScene.scene.remove(this.activeScene.gridHelper);
        this.save_manager.save(this.activeScene.scene, this.activeScene.sceneData["scene_properties"], this.activeScene.sceneData["characters"]);
        this.activeScene._createGrid();
    }

    load() {
        let uploadedFile = document.getElementById("load-upload").files[0];
        this.save_manager.load(uploadedFile, this.load_callback.bind(this));
    }

    load_callback(scene, scene_data, characters) {
        this.activeScene.scene = scene;
        this.activeScene.load_data(scene_data, characters);
        this.activeScene._createGrid();
    }

    change_mode(type) {
        this.control.mode = type;
        this.transform_interaction = true;
    }

    create_geometry(name) {
        this.activeScene.instantiate(name);
    }

    // Sets the fps to a specific number
    set_fps(fps_number) {
        this.cap_fps = fps_number;
    }

    // Toggles playback and recording.
    togglePlayback() {
        this.togglePlay();
        if (this.playback == false) {
            this.stopPlayback();
        } else {
            this.startPlayback();
        }
    }

    stopPlayback() {
        if (this.capturer != null) {
            this.capturer.stop();
            this.capturer.save();
        }
        this.activeScene.scene.add(this.activeScene.gridHelper);
    }

    frameCounter() {
        if (this.playback) {
            this.playback_location++;
            let max = this.cap_fps * this.max_length;
            if (this.playback_location >= max) {
                this.togglePlayback();
            }
        }
    }

    startPlayback() {
        this.playback_location = 0;
        this._initialize_recording();
    }

    // Initializes debug example scene.
    _initialize_example_scene() {
        this.activeScene.create_character("./resources/models/fox/fox.glb", "Fox");
    }

    // Example default size of object.
    _example_default_size() {
        this.activeScene.scene.children[this.activeScene.scene.children.length - 1].scale.set(.01, .01, .01);
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
        this.capturer = new CCapture({
            verbose: false,
            display: false,
            framerate: this.cap_fps,
            quality: 100,
            format: 'webm',
            frameLimit: 0,
            autoSaveTime: 0
        });
        if (this.control != null && this.activeScene.gridHelper != null) {
            this.activeScene.scene.remove(this.control);
            this.activeScene.scene.remove(this.activeScene.gridHelper);
            this.capturer.start();
        } else {
            console.error("Failed to start camera recording!");
        }
    }

    // Debug stats using ThreJS built in FPS and MS counter.
    _debug_stats() {
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    // Basicly Unity 3D's update loop.
    update_loop(time) {
        // Updates debug stats.
        if (this.stats != null) { this.stats.update(); }

        // All calls that are not super important like timeline go here.
        this.activeScene.update(this.clock.getDelta());
        //this.orbit.update(0.1);

        this.render_scene();
        if (this.capturer != null) { this.capturer.capture(this.renderer.domElement); } // Record scene.
        this.frameCounter();
    }

    // Render the scene to the camera.
    render_scene() {
        if (this.composer != null) {
            //this.renderer.render(this.activeScene.scene, this.camera);
            this.composer.render();
        }
    }

    update_properties() {
        let properties = this.activeScene.sceneData['scene_properties'][this.selected.uuid];
        if (properties != null) {
            properties.forEach(component => {
                if (component.name == "Transform") {
                    let pos = this.selected.position;
                    let rot = this.selected.rotation;
                    let scale = this.selected.scale;
                    component.position = new THREE.Vector3(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
                    component.rotation = new THREE.Vector3(Math.floor(rot.x), Math.floor(rot.y), Math.floor(rot.z));
                    component.scale = new THREE.Vector3(Math.floor(scale.x), Math.floor(scale.y), Math.floor(scale.z));
                }
                let html_content = component.get_html();
                if (html_content == null) { return; }
            });
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
        this.composer.setSize(width, height);
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
