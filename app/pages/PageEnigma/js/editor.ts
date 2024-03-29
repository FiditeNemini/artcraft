import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FreeCam } from "./free_cam";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import Scene from "./scene.js";
import APIManager from "./api_manager.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { SAOPass } from "three/addons/postprocessing/SAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import AudioEngine from "./audio_engine.js";
import TransformEngine from "./transform_engine.js";
import { TimeLine, TimelineDataState } from "./timeline.js";
import { ClipUI } from "../datastructures/clips/clip_offset.js";
import { LipSyncEngine } from "./lip_sync_engine.js";
import { AnimationEngine } from "./animation_engine.js";

import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { APPUI_ACTION_TYPES } from "../reducers";

class EditorState {
  // {
  //   action: "ShowLoadingIndicator"
  //   source: "Editor"
  //   data: { "message" : "saving scene" }
  // }

  selected_object: THREE.Object3D | undefined;
  is_loading: boolean;

  constructor() {
    this.selected_object;
    this.is_loading = false;
  }
}
// Main editor class that will call everything else all you need to call is " initialize() ".
class Editor {
  version: number;
  activeScene: Scene;
  camera: any;
  renderer: THREE.WebGLRenderer | undefined;
  clock: THREE.Clock | undefined;
  canvReference: any;
  composer: EffectComposer | undefined;
  effectFXAA: EffectComposer | undefined;
  outlinePass: OutlinePass | undefined;
  last_cam_pos: THREE.Vector3;
  last_cam_rot: THREE.Euler;
  saoPass: SAOPass | undefined;
  outputPass: OutputPass | undefined;
  bloomPass: UnrealBloomPass | undefined;
  smaaPass: SMAAPass | undefined;
  bokehPass: BokehPass | undefined;
  control: TransformControls | undefined;
  raycaster: THREE.Raycaster | undefined;
  mouse: THREE.Vector2 | undefined;
  selected: THREE.Object3D | undefined;
  last_selected: THREE.Object3D | undefined;
  transform_interaction: any;
  rendering: boolean;
  api_manager: APIManager;
  stats: any;
  cameraViewControls: FreeCam | undefined;
  orbitControls: OrbitControls | undefined;
  locked: boolean;
  capturer: any;
  frame_buffer: any;
  render_timer: number;
  fps_number: number;
  cap_fps: number;
  playback: boolean;
  playback_location: number;
  max_length: number;
  audio_engine: AudioEngine;
  transform_engine: TransformEngine;
  lipsync_engine: LipSyncEngine;
  animation_engine: AnimationEngine;
  timeline: TimeLine;
  current_frame: number;
  lockControls: PointerLockControls | undefined;
  cam_obj: THREE.Object3D | undefined;
  renderPass: RenderPass | undefined;

  current_scene_media_token: string | null;
  current_scene_glb_media_token: string | null;

  can_initialize: boolean;
  dispatchAppUiState: any; // todo figure out the type
  camera_person_mode: boolean;

  // Default params.
  constructor() {
    console.log(
      "If you see this message twice! then it rendered twice, if you see it once it's all good.",
    );

    // Special async react lifecycle fix
    // For making sure the editor only gets created onece.
    this.can_initialize = false;
    let one_element = document.getElementById("created-one-element");
    this.can_initialize = true;
    let newElement = document.createElement("div");
    newElement.id = "created-one-element";
    document.body.appendChild(newElement);
    // life cycle fix

    // Version and name.
    this.version = 1.0;
    // Clock, scene and camera essentials.
    this.activeScene = new Scene("" + this.version);
    this.activeScene.initialize();
    this.camera;
    this.renderer;
    this.clock;
    this.canvReference = null;
    this.cam_obj;
    this.composer;
    this.effectFXAA;
    this.outlinePass;
    this.last_cam_pos = new THREE.Vector3(0, 0, 0);
    this.last_cam_rot = new THREE.Euler(0, 0, 0);
    this.lockControls;
    this.saoPass;
    this.outputPass;
    this.bloomPass;
    this.smaaPass;
    this.bokehPass;
    // Transform control and selection.
    this.control;
    this.raycaster;
    this.mouse;
    this.selected;
    this.last_selected;
    this.transform_interaction;
    this.rendering = false;
    // API.
    this.api_manager = new APIManager();
    // Debug & Movement.
    this.stats = null;
    this.cameraViewControls;
    this.orbitControls;
    this.camera_person_mode = false;
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
    this.transform_engine = new TransformEngine(this.version);
    this.lipsync_engine = new LipSyncEngine();
    this.animation_engine = new AnimationEngine(this.version);

    this.timeline = new TimeLine(
      this.audio_engine,
      this.transform_engine,
      this.lipsync_engine,
      this.animation_engine,
      this.activeScene,
    );

    this.current_frame = 0;

    // Dispatcher
    this.dispatchAppUiState = null;

    // Scene State
    this.current_scene_media_token = null;
    this.current_scene_glb_media_token = null;
  }

  initialize(config: any) {
    //setup reactland Callbacks
    this.dispatchAppUiState = config.dispatchAppUiState;

    // this is called by the parent for some reason
    // this.dispatchAppUiState({
    //   type: APPUI_ACTION_TYPES.SHOW_EDITOR_LOADER
    // });

    if (this.can_initialize == false) {
      console.log("Editor Already Initialized");
      return;
    }
    this.can_initialize = false;

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
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvReference,
      preserveDrawingBuffer: true,
    });

    this.renderer.shadowMap.enabled = true;
    this.clock = new THREE.Clock();
    // Resizes the renderer.
    this.renderer.setSize(width, height);
    //document.body.appendChild(this.renderer.domElement)
    window.addEventListener("resize", this.onWindowResize.bind(this));
    this._configure_post_pro();
    // Controls and movement.

    this.lockControls = new PointerLockControls(
      this.camera,
      this.renderer.domElement,
    );
    this.cameraViewControls = new FreeCam(
      this.camera,
      this.renderer.domElement,
    );
    this.cameraViewControls.movementSpeed = 1;
    this.cameraViewControls.domElement = this.renderer.domElement;
    this.cameraViewControls.rollSpeed = Math.PI / 24;
    this.cameraViewControls.autoForward = false;
    this.cameraViewControls.dragToLook = true;
    this.cameraViewControls.enabled = false;

    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement,
    );

    this.control = new TransformControls(this.camera, this.renderer.domElement);
    // OnClick and MouseMove events.
    window.addEventListener("mousemove", this.onMouseMove.bind(this), false);
    window.addEventListener("click", this.onMouseClick.bind(this), false);
    // Base control and debug stuff remove debug in prod.
    this._initialize_control();
    // Resets canvas size.
    this.onWindowResize();
    // Creates the main update loop.
    this.renderer.setAnimationLoop(this.update_loop.bind(this));

    this.timeline.scene = this.activeScene;

    this._test_demo();

    // saving state of the scene
    this.current_scene_media_token = null;
    this.current_scene_glb_media_token = null;

    this.renderer.domElement.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this),
      false,
    );
    this.renderer.domElement.addEventListener(
      "mouseup",
      this.onMouseUp.bind(this),
      false,
    );
    this.renderer.domElement.addEventListener(
      "onContextMenu",
      this.onContextMenu.bind(this),
      false,
    );

    this.cam_obj = this.activeScene.get_object_by_name("::CAM::");
    if (this.cam_obj) {
      this.add_transform_clip_base("Camera Object", this.cam_obj, 0, 150);
    }

    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.UPDATE_EDITOR_LOADINGBAR,
      payload: {
        showEditorLoadingBar: {
          progress: 100,
        },
      },
    });

    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.HIDE_EDITOR_LOADINGBAR,
    });
  }

  // Token comes in from the front end to load the scene from the site.
  public async testBatchRequest() {
    const result = await this.api_manager.getMediaBatch(["m_8fmp9hrvsqcryzka1fra597kg42s50","m_z4jzbst3xfh64h0qn4bqh4afenfps9"]);
    console.log(result);
  }
  public async loadScene(scene_media_token: string) {
    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.SHOW_EDITOR_LOADER,
    });

    if (scene_media_token != null) {
      this.current_scene_media_token = scene_media_token;
    }

    const load_scene_state_response = await this.api_manager.loadSceneState(
      this.current_scene_media_token,
    );

    console.log(load_scene_state_response);
    if (load_scene_state_response.data == null) {
      console.log("load_scene_state_response Missing Data");
      return;
    }

    const loaded_scene = load_scene_state_response.data["scene"];

    // Load these so you can rewrite the scene glb using it's token.
    this.current_scene_media_token =
      load_scene_state_response.data["scene_media_file_token"];
    this.current_scene_glb_media_token =
      load_scene_state_response.data["scene_glb_media_file_token"];

    console.log(
      `loadScene => SceneMediaToken:${this.current_scene_media_token} SceneGLBMediaToken:${this.current_scene_glb_media_token}`,
    );

    this.activeScene.scene.children = loaded_scene.children;

    this.activeScene.scene.children.forEach((child: THREE.Object3D) => {
      child.parent = this.activeScene.scene;

      if (child.type == "DirectionalLight") {
        let pos = child.position;
        let rot = child.rotation;
        let light = this.activeScene._create_base_lighting();
        light.position.set(pos.x, pos.y, pos.z);
        light.rotation.set(rot.x, rot.y, rot.z);
        this.activeScene.scene.remove(child);
      }
    });

    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.HIDE_EDITOR_LOADER,
    });
  }

  public async saveScene(name: string) {
    // remove controls when saving scene.
    this.removeTransformControls();
    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.SHOW_EDITOR_LOADER,
    });
    console.log(
      `saveScene => SceneMediaToken:${this.current_scene_media_token} SceneGLBMediaToken:${this.current_scene_glb_media_token}`,
    );

    const result = await this.api_manager.saveSceneState(
      this.activeScene.scene,
      name,
      this.current_scene_glb_media_token,
      this.current_scene_media_token,
      new TimelineDataState(),
    );

    if (result.data == null) {
      return;
    }

    const scene_media_token = result.data["scene_media_file_token"];
    if (scene_media_token != null) {
      this.current_scene_media_token = scene_media_token;
    }
    const scene_glb_media_token = result.data["scene_glb_media_file_token"];
    if (scene_glb_media_token != null) {
      this.current_scene_glb_media_token = scene_glb_media_token;
    }

    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.HIDE_EDITOR_LOADER,
    });
  }

  /**
   * This cleans up the transform controls
   * During saving it
   * Doesn't retain those controls.
   * @returns
   */
  private removeTransformControls() {
    if (this.control == undefined) {
      return;
    }
    if (this.outlinePass == undefined) {
      return;
    }
    this.last_selected = this.selected;
    this.control.detach();
    this.activeScene.scene.remove(this.control);
    this.outlinePass.selectedObjects = [];
  }

  async _serialize_timeline() {
    // note the database from the server is the source of truth for all the data.
    // Test code here
    let object: any = await this.activeScene.load_glb(
      "./resources/models/fox/fox.glb",
    );

    // load object into the engine for lip syncing
    this.lipsync_engine.load_object(
      object.uuid,
      "m_f1jxx4zwy4da2zn0cvdqhha7kqkj72",
    );

    // create the clip with the same id for a reference to the media
    this.timeline.addPlayableClip(
      new ClipUI(
        1.0,
        "lipsync",
        "clip1",
        "m_f1jxx4zwy4da2zn0cvdqhha7kqkj72",
        object.uuid,
        150,
        400,
      ),
    );

    // media id for this is up in the air but when a path is created you should be able to store and delete it
    this.timeline.addPlayableClip(
      new ClipUI(1.0, "transform", "clip2", object.uuid, object.uuid, 0, 150),
    );

    // media id for this as well it can be downloaded
    this.timeline.addPlayableClip(
      new ClipUI(
        1.0,
        "animation",
        "clip3",
        "/resources/models/fox/fox_idle.glb",
        object.uuid,
        0,
        400,
      ),
    );
    this.animation_engine.load_object(
      object.uuid,
      "/resources/models/fox/fox_idle.glb",
      "clip3",
    );
  }

  switchCameraView() {
    this.camera_person_mode = !this.camera_person_mode;
    if (this.cam_obj) {
      if (this.camera_person_mode) {
        this.last_cam_pos.copy(this.camera.position);
        this.last_cam_rot.copy(this.camera.rotation);

        this.camera.position.copy(this.cam_obj.position);
        this.camera.rotation.copy(this.cam_obj.rotation);
        if (this.orbitControls) {
          this.orbitControls.enabled = false;
        }
        if (this.lockControls) {
          this.activeScene.scene.add(this.lockControls.getObject());
        }
        if (this.cameraViewControls) {
          this.cameraViewControls.enabled = true;
        }

        if (this.activeScene.hot_items) {
          this.activeScene.hot_items.forEach((element) => {
            element.visible = false;
          });
        }
      } else {
        this.camera.position.copy(this.last_cam_pos);
        this.camera.rotation.copy(this.last_cam_rot);
        if (this.orbitControls) {
          this.orbitControls.enabled = true;
        }
        if (this.lockControls) {
          this.activeScene.scene.remove(this.lockControls.getObject());
        }
        if (this.cameraViewControls) {
          this.cameraViewControls.enabled = false;
        }
        if (this.activeScene.hot_items) {
          this.activeScene.hot_items.forEach((element) => {
            element.visible = true;
          });
        }
      }
    }
  }

  async add_transform_clip_base(
    name: string = "New Clip",
    object: THREE.Object3D,
    start_offset: number,
    end_offset: number,
  ) {
    this.timeline.addPlayableClip(
      new ClipUI(
        1.0,
        "transform",
        "clip2",
        object.uuid,
        object.uuid,
        start_offset,
        end_offset,
      ),
    );
    this.transform_engine.loadObject(object.uuid, end_offset);
  }

  async _test_demo() {
    // note the database from the server is the source of truth for all the data.
    // Test code here
    let object: any = await this.activeScene.load_glb(
      "./resources/models/fox/fox.glb",
    );

    // Load timeline creates the the clips from the datastructure and loads them in here.
    // load object into the engine for lip syncing
    this.lipsync_engine.load_object(
      object.uuid,
      "m_f1jxx4zwy4da2zn0cvdqhha7kqkj72",
    );
    this.animation_engine.load_object(
      object.uuid,
      "/resources/models/fox/fox_idle.glb",
      "clip3",
    );
    // then it creates clip ui to load the playable clips
    // then refreshes the timeline.

    // create the clip with the same id for a reference to the media
    this.timeline.addPlayableClip(
      new ClipUI(
        1.0,
        "lipsync",
        "clip1",
        "m_f1jxx4zwy4da2zn0cvdqhha7kqkj72",
        object.uuid,
        150,
        400,
      ),
    );

    // media id for this is up in the air but when a path is created you should be able to store and delete it
    this.timeline.addPlayableClip(
      new ClipUI(1.0, "transform", "clip2", object.uuid, object.uuid, 0, 150),
    );

    // media id for this as well it can be downloaded
    this.timeline.addPlayableClip(
      new ClipUI(
        1.0,
        "animation",
        "clip3",
        "/resources/models/fox/fox_idle.glb",
        object.uuid,
        0,
        400,
      ),
    );
  }

  // Configure post processing.
  _configure_post_pro() {
    let width = this.canvReference.width;
    let height = this.canvReference.height;

    if (this.renderer == undefined || this.camera == undefined) {
      return;
    }

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.activeScene.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.outlinePass = new OutlinePass(
      new THREE.Vector2(width, height),
      this.activeScene.scene,
      this.camera,
    );

    this.outlinePass.edgeStrength = 6.0;
    this.outlinePass.edgeGlow = 0.2;
    this.outlinePass.edgeThickness = 1.0;
    this.outlinePass.pulsePeriod = 3;
    this.outlinePass.usePatternTexture = false;
    this.outlinePass.visibleEdgeColor.set(0xe66462);

    this.composer.addPass(this.outlinePass);

    this.saoPass = new SAOPass(this.activeScene.scene, this.camera);

    this.saoPass.params.saoBias = 3.1;
    this.saoPass.params.saoIntensity = 1.0;
    this.saoPass.params.saoScale = 6.0;
    this.saoPass.params.saoKernelRadius = 5.0;
    this.saoPass.params.saoMinResolution = 0.0;

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.5,
      0.4,
      0.85,
    );
    this.bloomPass.strength = 0.25;

    this.smaaPass = new SMAAPass(
      width * this.renderer.getPixelRatio(),
      height * this.renderer.getPixelRatio(),
    );

    this.bokehPass = new BokehPass(this.activeScene.scene, this.camera, {
      focus: 3.0,
      aperture: 0.00001,
      maxblur: 0.01,
    });

    this.composer.addPass(this.saoPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(this.smaaPass);
    this.composer.addPass(this.bokehPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  create_parim(name: string) {
    let uuid = this.activeScene.instantiate(name);
  }

  render_mode() {
    this.rendering = !this.rendering;
    this.activeScene.render_mode(this.rendering);

    //if (this.rendering) {
    //    this._remove_post_processing()
    //} else {
    //    this._add_post_processing()
    //}
  }

  togglePlay() {
    this.playback = !this.playback;
    this.playback_location = 0;
    if (this.playback == false) {
      this.stopPlayback();
    } else {
      // REMOVE THIS NEXT LINE IN PROD ONLY FOR TEST!!!!!
      //this.activeScene.play_anim_demo(this.activeScene.activeCharacter)
    }
  }

  save() {
    //console.log(this.control)
    //if(this.selected != null){ this.control.detach(this.selected) }
    //this.activeScene.scene.remove(this.control)
    //this.activeScene.scene.remove(this.activeScene.gridHelper)
    //this.save_manager.save(this.activeScene.scene, this._save_to_cloud.bind(this), this.audio_manager, this.timeline, this.activeScene.animations)
    //this.activeScene._createGrid()
    //this.audio_engine.playClip("m_f7jnwt3d1ddchatdk5vaqt0n4mb1hg")
    //console.log(this.selected)

    if (this.selected == null) {
      return;
    }
    this.transform_engine.addFrame(this.selected);
    console.log("Frame taken.");
  }

  change_camera_view() {
    //let obj = this.activeScene.get_object_by_uuid(this.test_box_uuid)
    //this.transform_engine.clips[this.test_box_uuid].step(obj)
    //console.log(this.transform_engine.clips[this.test_box_uuid].current_pos)
    //this.current_frame += 1
    //this.transform_engine.clips[this.test_box_uuid].reset(this.activeScene.get_object_by_uuid(this.test_box_uuid))
  }

  take_timeline_cam_clip() {
    if (this.cam_obj == null) {
      return;
    }
    if (!this.camera_person_mode) {
      return;
    }
    this.transform_engine.addFrame(
      this.cam_obj,
      this.transform_engine.clips[this.cam_obj.uuid].length,
    );
    console.log("Camera frame taken.");
    this.activeScene.createPoint(this.cam_obj.position, false);
  }

  // Basicly Unity 3D's update loop.
  update_loop(time: number) {
    // Updates debug stats.
    if (this.stats != null) {
      this.stats.update();
    }

    if (this.clock == undefined || this.renderer == undefined) {
      return;
    }

    let delta_time = this.clock.getDelta();

    if (this.cameraViewControls && this.camera_person_mode) {
      this.cameraViewControls.update(5 * delta_time);
      if (this.cam_obj) {
        if (this.timeline.isPlaying == false) {
          this.cam_obj.position.copy(this.camera.position);
          this.cam_obj.rotation.copy(this.camera.rotation);
        } else {
          this.camera.position.copy(this.cam_obj.position);
          this.camera.rotation.copy(this.cam_obj.rotation);
        }
      }
    }

    this.timeline.update(delta_time);

    this.render_scene();
    if (this.capturer != null) {
      this.capturer.capture(this.renderer.domElement);
    } // Record scene.
  }

  start_playback() {
    this.timeline.isPlaying = true;
    if (!this.camera_person_mode) {
      this.switchCameraView();
    }
  }

  change_mode(type: any) {
    if (this.control == undefined) {
      return;
    }
    this.control.mode = type;
    this.transform_interaction = true;
  }

  // Sets the fps to a specific number
  set_fps(fps_number: number) {
    this.cap_fps = fps_number;
  }

  // Toggles playback and recording.
  togglePlayback() {
    this.togglePlay();
    if (this.playback == false) {
      //this.stopPlayback()
      this.render_mode();
    } else {
      //this.startPlayback()
      this.render_mode();
    }
  }

  async loadWavAsBlob(url: string) {
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
      await ffmpeg.FS(
        "writeFile",
        `image${index}.png`,
        await fetchFile(element),
      );
    }
    await ffmpeg.run(
      "-framerate",
      "" + this.cap_fps,
      "-i",
      "image%d.png",
      "output.mp4",
    );
    let output = await ffmpeg.FS("readFile", "output.mp4");
    // Create a Blob from the output file for downloading
    const blob = new Blob([output.buffer], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    await this.api_manager.uploadMedia(blob, "output.mp4");
    // Create a link to download the file
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "output.mp4";
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
    if (this.control == undefined) {
      return;
    }
    this.control.addEventListener("change", this.render_scene.bind(this));
    this.control.addEventListener("dragging-changed", (event: any) => {
      if (this.orbitControls == undefined) {
        return;
      }
      this.orbitControls.enabled = !event.value;
      // this.update_properties()
    });
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
    } else if (this.renderer && this.camera) {
      this.renderer.render(this.activeScene.scene, this.camera);
    } else {
      console.error("Could not render to canvas no render or composer!");
    }

    if (this.rendering && this.renderer && this.clock) {
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
    let width = window.innerWidth; // / aspect_adjust
    let height = window.innerHeight; // / aspectRatio

    if (this.camera == undefined || this.renderer == undefined) {
      return;
    }
    // Set the camera aspect to the desired aspect ratio
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Set the renderer size to the calculated dimensions
    this.renderer.setSize(width, height);
    if (this.composer != null) {
      this.composer.setSize(width, height);
    }
  }

  onContextMenu(event: any) {
    return false;
  }

  onMouseDown(event: any) {
    if (event.button === 1 && this.camera_person_mode) {
      this.lockControls?.lock();
    }
  }

  onMouseUp(event: any) {
    if (event.button === 1) {
      this.lockControls?.unlock();
    }
  }

  // Sets new mouse location usually used in raycasts.
  onMouseMove(event: any) {
    const rect = this.canvReference.getBoundingClientRect();
    if (this.mouse == undefined) {
      return;
    }
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  // When the mouse clicks the screen.
  onMouseClick() {
    if (
      this.raycaster == undefined ||
      this.mouse == undefined ||
      this.control == undefined ||
      this.outlinePass == undefined
    ) {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    let interactable: any[] = [];
    this.activeScene.scene.children.forEach((child: THREE.Object3D) => {
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
        while (currentObject.parent && currentObject.parent.type !== "Scene") {
          currentObject = currentObject.parent;
        }
        this.selected = currentObject;
        if (this.selected.type == "Scene") {
          this.selected = intersects[0].object;
        }
        // this.update_properties()
        this.activeScene.scene.add(this.control);
        this.control.attach(this.selected);
        this.outlinePass.selectedObjects = [this.selected];
        this.transform_interaction = true;
      }
    } else if (this.transform_interaction == false) {
      this.removeTransformControls();
    } else {
      this.transform_interaction = false;
    }
  }
}

export default Editor;
