import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FreeCam } from "./free_cam";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import Scene from "./scene.js";
import { APIManager, ArtStyle, Visibility } from "./api_manager.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { SAOPass } from "three/addons/postprocessing/SAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import AudioEngine from "./audio_engine.js";
import TransformEngine from "./transform_engine.js";
import { TimeLine } from "./timeline.js";
import { ClipUI } from "../datastructures/clips/clip_ui.js";
import { LipSyncEngine } from "./lip_sync_engine.js";
import { AnimationEngine } from "./animation_engine.js";

import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { APPUI_ACTION_TYPES } from "../../../reducers";
import { ClipGroup, ClipType } from "~/pages/PageEnigma/models/track";

import { XYZ } from "../datastructures/common";
import { StoryTellerProxyScene } from "../proxy/storyteller_proxy_scene";
import { StoryTellerProxyTimeline } from "../proxy/storyteller_proxy_timeline";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { AssetType, MediaItem } from "~/pages/PageEnigma/models";
import { LoadingBar } from "~/components";

// Main editor class that will call everything else all you need to call is " initialize() ".
class Editor {
  version: number;
  activeScene: Scene;
  camera: any;
  render_camera: any;
  renderer: THREE.WebGLRenderer | undefined;
  rawRenderer: THREE.WebGLRenderer | undefined;
  clock: THREE.Clock | undefined;
  canvReference: any;
  canvasRenderCamReference: any;
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
  generating_preview: boolean;
  frames: number;

  camera_person_mode: boolean;
  current_scene_media_token: string | null;
  current_scene_glb_media_token: string | null;

  can_initialize: boolean;
  switchPreviewToggle: boolean;

  dispatchAppUiState: any; // todo figure out the type
  render_width: number;
  render_height: number;

  positive_prompt: string;
  negative_prompt: string;
  art_style: ArtStyle;

  last_scrub: number;
  record_stream: any | undefined;
  recorder: MediaRecorder | undefined;
  // Default params.

  // scene proxy for serialization
  storyteller_proxy_scene: StoryTellerProxyScene;

  constructor() {
    console.log(
      "If you see this message twice! then it rendered twice, if you see it once it's all good.",
    );

    // Special async react lifecycle fix
    // For making sure the editor only gets created onece.
    this.can_initialize = false;
    this.can_initialize = true;
    const newElement = document.createElement("div");
    newElement.id = "created-one-element";
    document.body.appendChild(newElement);
    // life cycle fix

    // Version and name.
    this.version = 1.0;
    // Clock, scene and camera essentials.
    this.activeScene = new Scene("" + this.version);
    this.activeScene.initialize();
    this.generating_preview = false;
    this.camera;
    this.render_camera;
    this.renderer;
    this.rawRenderer;
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
    this.switchPreviewToggle = false;
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
    this.last_scrub = 0;
    this.frames = 0;
    // Audio Engine Test.

    this.render_width = 1280;
    this.render_height = 720;

    this.canvasRenderCamReference;

    this.audio_engine = new AudioEngine();
    this.transform_engine = new TransformEngine(this.version);
    this.lipsync_engine = new LipSyncEngine();
    this.animation_engine = new AnimationEngine(this.version);

    this.timeline = new TimeLine(
      this,
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

    // stylization parameters
    this.positive_prompt =
      "((masterpiece, best quality, 8K, detailed)), colorful, epic, fantasy, (fox, red fox:1.2), no humans, 1other, ((koi pond)), outdoors, pond, rocks, stones, koi fish, ((watercolor))), lilypad, fish swimming around.";
    this.negative_prompt = "";
    this.art_style = ArtStyle.Anime2DFlat;

    this.storyteller_proxy_scene = new StoryTellerProxyScene(
      this.version,
      this.activeScene.scene,
    );
  }

  isEmpty(value: string) {
    return (value == null || (typeof value === "string" && value.trim().length === 0));
  }

  initialize(config: any, sceneToken) {

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
    this.canvasRenderCamReference = document.getElementById("camera-view");

    // Base width and height.
    const width = this.canvReference.width;
    const height = this.canvReference.height;
    // Sets up camera and base position.
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.15, 30);
    this.camera.position.z = 3;
    this.camera.position.y = 3;
    this.camera.position.x = -3;

    this.render_camera = new THREE.PerspectiveCamera(
      70,
      width / height,
      0.15,
      30,
    );

    // Base WebGL render and clock for delta time.
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvReference,
      preserveDrawingBuffer: true,
    });

    this.rawRenderer = new THREE.WebGLRenderer({
      antialias: false,
      canvas: this.canvasRenderCamReference,
      preserveDrawingBuffer: true,
    });

    this.renderer.shadowMap.enabled = true;
    this.clock = new THREE.Clock();
    // Resizes the renderer.
    this.renderer.setSize(width, height);
    //document.body.appendChild(this.renderer.domElement)
    window.addEventListener("resize", this.onWindowResize.bind(this));
    this._configurePostProcessing();
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
    this.control.space = "local"; // Local transformation mode
    // .space = 'world'; // Global mode

    this.control.setScaleSnap(0.1);
    this.control.setTranslationSnap(0.1);
    this.control.setRotationSnap(0.1);

    // OnClick and MouseMove events.
    window.addEventListener("mousemove", this.onMouseMove.bind(this), false);
    window.addEventListener("click", this.onMouseClick.bind(this), false);
    // Base control and debug stuff remove debug in prod.
    if (this.control == undefined) {
      return;
    }
    this.control.addEventListener("change", this.renderScene.bind(this));
    this.control.addEventListener("dragging-changed", (event: any) => {
      if (this.orbitControls == undefined) {
        return;
      }
      this.orbitControls.enabled = !event.value;
      this.updateSelectedUI();
      // this.update_properties()
    });
    this.control.setSize(0.5); // Good default value for visuals.
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.activeScene.scene.add(this.control);
    // Resets canvas size.
    this.onWindowResize();

    this.timeline.scene = this.activeScene;

    //this._test_demo();

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

    // saving state of the scene
    this.current_scene_media_token = null;
    this.current_scene_glb_media_token = null;

    this.cam_obj = this.activeScene.get_object_by_name("::CAM::");

    // Creates the main update loop.
    //this.renderer.setAnimationLoop(this.updateLoop.bind(this));

    this.updateLoop();

    if (this.isEmpty(sceneToken) == false) {
      this.loadScene(sceneToken)
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
    const result = await this.api_manager.getMediaBatch([
      "m_8fmp9hrvsqcryzka1fra597kg42s50",
      "m_z4jzbst3xfh64h0qn4bqh4afenfps9",
    ]);
    console.log(result);
  }

  public async testTestTimelineEvents() { }

  public async loadScene(scene_media_token: string) {
    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.SHOW_EDITOR_LOADER,
    });

    this.current_scene_media_token = scene_media_token;

    const scene_json = await this.api_manager
      .loadSceneState(this.current_scene_media_token)
      .catch((err) => {
        this.dispatchAppUiState({
          type: APPUI_ACTION_TYPES.HIDE_EDITOR_LOADER,
        });
        throw err;
      });

    const proxyScene = new StoryTellerProxyScene(
      this.version,
      this.activeScene,
    );
    await proxyScene.loadFromSceneJson(scene_json["scene"]);
    this.cam_obj = this.activeScene.get_object_by_name("::CAM::");

    const proxyTimeline = new StoryTellerProxyTimeline(
      this.version,
      this.timeline,
      this.transform_engine,
      this.animation_engine,
      this.audio_engine,
      this.lipsync_engine,
    );
    await proxyTimeline.loadFromJson(scene_json["timeline"]);

    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.HIDE_EDITOR_LOADER,
    });
  }

  // TO UPDATE selected objects in the scene might want to add to the scene ...
  async setSelectedObject(position: XYZ, rotation: XYZ, scale: XYZ) {
    if (this.selected != undefined || this.selected != null) {
      //console.log(`triggering setSelectedObject`)
      this.selected.position.x = position.x;
      this.selected.position.y = position.y;
      this.selected.position.z = position.z;

      this.selected.rotation.x = THREE.MathUtils.degToRad(rotation.x);
      this.selected.rotation.y = THREE.MathUtils.degToRad(rotation.y);
      this.selected.rotation.z = THREE.MathUtils.degToRad(rotation.z);

      this.selected.scale.x = scale.x;
      this.selected.scale.y = scale.y;
      this.selected.scale.z = scale.z;
    }
  }

  public async saveScene(name: string): Promise<string> {
    // remove controls when saving scene.
    this.removeTransformControls();
    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.SHOW_EDITOR_LOADER,
    });

    const proxyScene = new StoryTellerProxyScene(
      this.version,
      this.activeScene,
    );
    const scene_json = await proxyScene.saveToScene();

    const proxyTimeline = new StoryTellerProxyTimeline(
      this.version,
      this.timeline,
      this.transform_engine,
      this.animation_engine,
      this.audio_engine,
      this.lipsync_engine,
    );
    const timeline_json = await proxyTimeline.saveToJson();

    const save_data = { scene: scene_json, timeline: timeline_json };

    // TODO turn scene information into and object ...
    const result = await this.api_manager.saveSceneState(
      JSON.stringify(save_data),
      name,
      this.current_scene_glb_media_token,
      this.current_scene_media_token,
    );

    console.log(result);

    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.HIDE_EDITOR_LOADER,
    });

    return result;
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
    this.selected = undefined;
    this.control.detach();
    this.activeScene.scene.remove(this.control);
    this.outlinePass.selectedObjects = [];
  }

  switchCameraView() {
    this.camera_person_mode = !this.camera_person_mode;
    console.log(this.camera_person_mode);
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
        this.cam_obj.scale.set(0, 0, 0);

        this.removeTransformControls();
        this.selected = this.cam_obj;
        this.dispatchAppUiState({
          type: APPUI_ACTION_TYPES.SHOW_CONTROLPANELS_SCENEOBJECT,
        });
        this.updateSelectedUI();
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
        this.cam_obj.scale.set(1, 1, 1);
        if (this.activeScene.hot_items) {
          this.activeScene.hot_items.forEach((element) => {
            element.visible = true;
          });
        }

        this.dispatchAppUiState({
          type: APPUI_ACTION_TYPES.HIDE_CONTROLPANELS_SCENEOBJECT,
        });
      }
    }
  }

  public async loadMediaToken(media_file_token: string) {
    this.activeScene.load_glb(media_file_token);
  }

  async showLoading() {
    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.SHOW_EDITOR_LOADINGBAR,
    });
  }

  async updateLoad(progress: number, message: string) {
    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.UPDATE_EDITOR_LOADINGBAR,
      payload: {
        showEditorLoadingBar: {
          progress: progress,
          message: message
        },
      },
    });
  }

  async endLoading() {
    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.HIDE_EDITOR_LOADINGBAR,
    });
  }

  async _test_demo() {
    // note the database from the server is the source of truth for all the data.
    // Test code here
    // const object: THREE.Object3D = await this.activeScene.load_glb(
    //   "m_4wva09qznapzk5rcvbxy671d1qx2pr",
    // );
    // object.uuid = "CH1";
    // Stick Open Pose Man: m_9f3d3z94kk6m25zywyz6an3p43fjtw
    // XBot: m_r7w1tmkx2jg8nznr3hyzj4k6zhfh7d
    // YBot: m_9sqg0evpr23587jnr8z3zsvav1x077
    // Shrek: m_fmxy8wjnep1hdaz7qdg4n7y15d2bsp
  }

  // Configure post processing.
  _configurePostProcessing() {
    const width = this.canvReference.width;
    const height = this.canvReference.height;

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

  deleteObject(uuid: string) {
    const obj = this.activeScene.get_object_by_uuid(uuid);
    if (obj) {
      this.activeScene.scene.remove(obj);
    }
    this.removeTransformControls();
    Queue.publish({
      queueName: QueueNames.FROM_ENGINE,
      action: fromEngineActions.DELETE_OBJECT,
      data: {
        version: 1,
        type: AssetType.OBJECT,
        media_id: "",
        object_uuid: uuid,
        name: "",
      } as MediaItem,
    });
    this.selected = undefined;
    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.HIDE_CONTROLPANELS_SCENEOBJECT,
    });
    this.timeline.deleteObject(uuid);
  }

  create_parim(name: string) {
    const uuid = this.activeScene.instantiate(name);
  }

  renderMode() {
    this.rendering = !this.rendering;
    this.activeScene.renderMode(this.rendering);
  }

  stepFrame(frames: number) {
    this.timeline.stepFrame(frames);
  }

  // Render the scene to the camera, this is called in the update.
  renderScene() {
    if (this.composer != null && !this.rendering && this.rawRenderer) {
      this.composer.render();
      this.rawRenderer.render(this.activeScene.scene, this.render_camera);
    } else if (this.renderer && this.render_camera && !this.rendering) {
      this.renderer.setSize(this.render_width, this.render_height);
      this.renderer.render(this.activeScene.scene, this.render_camera);
    } else if (this.rendering && this.rawRenderer) {
      this.rawRenderer.render(this.activeScene.scene, this.render_camera);
    } else {
      console.error("Could not render to canvas no render or composer!");
    }

    if (this.rendering && this.rawRenderer && this.clock) {
      if (this.recorder == undefined) {
        this.record_stream = this.rawRenderer.domElement.captureStream(60); // Capture at 30 FPS
        this.recorder = new MediaRecorder(this.record_stream, { mimeType: 'video/webm' });
        this.recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.frame_buffer.push(event.data);
            this.frames += 1;
            this.playback_location++;
          }
        };
        this.recorder.onstop = () => {
          this.stopPlayback();
        }
        this.recorder.start();
      }

      this.render_timer += this.clock.getDelta();
      if (this.timeline.is_playing == false) {
        this.recorder.stop();
        this.playback_location = 0;
      }
    }
  }

  // Basicly Unity 3D's update loop.
  async updateLoop() {
    setTimeout( () => {
      requestAnimationFrame( this.updateLoop.bind(this) );
    }, 1000 / this.cap_fps );

    if (this.cam_obj == undefined) {
      this.cam_obj = this.activeScene.get_object_by_name("::CAM::");
    }

    // Updates debug stats.
    if (this.stats != null) {
      this.stats.update();
    }

    if (this.clock == undefined || this.renderer == undefined) {
      return;
    }

    const delta_time = this.clock.getDelta();

    if (this.cameraViewControls && this.camera_person_mode) {
      this.cameraViewControls.update(5 * delta_time);
      if (this.cam_obj) {
        if (this.last_scrub != this.timeline.scrubber_frame_position) {
          this.camera.position.copy(this.cam_obj.position);
          this.camera.rotation.copy(this.cam_obj.rotation);
        } else if (this.timeline.is_playing == false) {
          this.cam_obj.position.copy(this.camera.position);
          this.cam_obj.rotation.copy(this.camera.rotation);
        } else {
          this.camera.position.copy(this.cam_obj.position);
          this.camera.rotation.copy(this.cam_obj.rotation);
        }

        this.cam_obj.visible = false;

        const min = new THREE.Vector3(-12, -1, -12);
        const max = new THREE.Vector3(12, 24, 12);
        this.camera.position.copy(this.camera.position.clamp(min, max));
      }
    } else if (this.cam_obj) {
      this.cam_obj.visible = true;
    }

    if (this.render_camera && this.cam_obj) {
      this.render_camera.position.copy(this.cam_obj.position);
      this.render_camera.rotation.copy(this.cam_obj.rotation);
      this.cam_obj.scale.copy(new THREE.Vector3(1, 1, 1));
    }

    if (this.timeline.is_playing) {
      const changeView = await this.timeline.update(this.rendering);
      if (changeView) {
        this.switchCameraView();
      }
    } else if (this.last_scrub == this.timeline.scrubber_frame_position) {
      this.updateSelectedUI();
    }

    this.last_scrub = this.timeline.scrubber_frame_position;
    this.renderScene();
  }

  change_mode(type: any) {
    if (this.control == undefined) {
      return;
    }
    this.control.mode = type;
    this.transform_interaction = true;
  }

  async convertAudioClip(itteration: number, ffmpeg: FFmpeg, clip: ClipUI) {
    const video_og = itteration + "tmp.mp4";
    const wav_name = itteration + "tmp.wav";
    const new_video = itteration + 1 + "tmp.mp4";
    let startFrame = clip.offset;
    let endFrame = clip.length;

    if (endFrame > this.timeline.timeline_limit) {
      endFrame = this.timeline.timeline_limit;
    }
    if (startFrame > this.timeline.timeline_limit) {
      startFrame = this.timeline.timeline_limit - 1;
    }

    const startTime = startFrame / this.cap_fps;
    const endTime = endFrame / this.cap_fps;
    const end = endTime - startTime;

    const audioSegment = "as_" + wav_name;
    await ffmpeg.FS(
      "writeFile",
      wav_name,
      await fetchFile(await this.api_manager.getMediaFile(clip.media_id)),
    );
    await ffmpeg.run(
      "-i",
      wav_name,
      "-ss",
      "0",
      "-to",
      "" + end,
      "-max_muxing_queue_size",
      "999999",
      audioSegment,
    );

    await ffmpeg.run(
      "-i",
      video_og,
      "-max_muxing_queue_size",
      "999999",
      `${itteration}empty_tmp.wav`,
    );

    await ffmpeg.run(
      "-i",
      `${itteration}empty_tmp.wav`,
      "-i",
      audioSegment,
      "-filter_complex",
      "[1:a]adelay=" +
      startTime * 1000 +
      "|" +
      startTime * 1000 +
      "[a1];[0:a][a1]amix=inputs=2[a]",
      "-map",
      "[a]",
      `${itteration}final_tmp.wav`,
    );

    await ffmpeg.run(
      "-i",
      video_og,
      "-i",
      `${itteration}final_tmp.wav`,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-strict",
      "experimental",
      new_video,
    );
  }

  async _debugDownloadVideo(videoURL: string) {
    // DEBUG ONLY to download the video

    let a = document.createElement('a');
    a.href = videoURL;
    a.download = 'video.mp4'; // Name of the downloaded file
    document.body.appendChild(a);
    a.click(); // Trigger the download
  }

  async stopPlayback(compile_audio: boolean = true) {
    //let video_fps = Math.floor(this.frames * (this.cap_fps / this.timeline.timeline_limit));
    //console.log("Video FPS:", video_fps)
    this.rendering = false;
    const videoBlob = new Blob(this.frame_buffer, { type: 'video/webm' });
    const videoURL = URL.createObjectURL(videoBlob);

    this.generating_preview = true;
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    this.updateLoad(50, "Processing ...")

    // Write the Uint8Array to the FFmpeg file system
    ffmpeg.FS('writeFile', 'input.webm', await fetchFile(videoURL));


    await ffmpeg.run(
      "-i",
      "input.webm",
      "-vf",
      "scale=516:290",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf", 
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "input.mp4",
    );

    await ffmpeg.run(
      "-i",
      "input.mp4",
      "-f",
      "lavfi",
      "-i",
      "anullsrc", // This adds a silent audio track
      "-max_muxing_queue_size",
      "999999",
      "-c:v",
      "libx264", // Specify video codec (optional, but recommended for MP4)
      "-c:a",
      "aac", // Specify audio codec (optional, but recommended for MP4)
      "-shortest", // Ensure output duration matches the shortest stream (video or audio)
      "-pix_fmt",
      "yuv420p",
      "-f",
      "mp4",
      "0tmp.mp4",
    );

    let itteration = 0;

    if (compile_audio) {
      for (const clip of this.timeline.timeline_items) {
        if (clip.type == ClipType.AUDIO) {
          await this.convertAudioClip(itteration, ffmpeg, clip);
          itteration += 1;
        }
      }
    }

    const output = ffmpeg.FS("readFile", itteration + "tmp.mp4");

    ffmpeg.exit();
    this.generating_preview = false;

    // Create a Blob from the output file for downloading
    const blob = new Blob([output.buffer], { type: "video/mp4" });

    const data: any = await this.api_manager.uploadMedia(blob, "render.mp4");

    if (data == null) {
      return;
    }
    const upload_token = data["media_file_token"];
    console.log(upload_token);

    const result = await this.api_manager
      .stylizeVideo(
        upload_token,
        this.art_style,
        this.positive_prompt,
        this.negative_prompt,
        Visibility.Public,
      )
      .catch((error) => {
        console.log(error);
      });

    // {"success":true,"inference_job_token":"jinf_j3nbqbd15wqxb0xcks13qh3f3bz"}
    this.updateLoad(100, "Done Check Your Media Tab On Profile.");
    this.endLoading();

    console.log(result);
    this.recorder = undefined;
  }

  switchPreview() {
    if (this.switchPreviewToggle == false) {
      this.switchPreviewToggle = true;
      this.generateFrame();
      if (this.cameraViewControls) {
        this.cameraViewControls.enabled = false;
      }
    }
  }

  switchEdit() {
    if (this.switchPreviewToggle == true) {
      this.switchPreviewToggle = false;
      this.canvasRenderCamReference = document.getElementById("camera-view");
      this.rawRenderer = new THREE.WebGLRenderer({
        antialias: false,
        canvas: this.canvasRenderCamReference,
        preserveDrawingBuffer: true,
      });
      if (this.camera_person_mode == true) {
        this.switchCameraView();
      }
      this.activeScene.renderMode(false);
    }
  }

  async generateFrame() {
    if (this.renderer && !this.generating_preview) {
      this.removeTransformControls();
      this.generating_preview = true;
      this.activeScene.renderMode(true);
      if (this.activeScene.hot_items) {
        this.activeScene.hot_items.forEach((element) => {
          element.visible = false;
        });
      }

      if (this.render_camera && this.cam_obj) {
        this.render_camera.position.copy(this.cam_obj.position);
        this.render_camera.rotation.copy(this.cam_obj.rotation);
      }

      this.renderer.setSize(this.render_width, this.render_height);
      this.renderer.render(this.activeScene.scene, this.render_camera);
      const imgData = this.renderer.domElement.toDataURL();
      this.activeScene.renderMode(false);
      this.onWindowResize();

      this.canvasRenderCamReference = document.getElementById("raw-preview");
      this.rawRenderer = new THREE.WebGLRenderer({
        antialias: false,
        canvas: this.canvasRenderCamReference,
        preserveDrawingBuffer: true,
      });
      if (this.camera_person_mode == false) {
        this.switchCameraView();
      }
      this.activeScene.renderMode(true);

      const ffmpeg = createFFmpeg({ log: false });
      await ffmpeg.load();
      await ffmpeg.FS("writeFile", `render.png`, await fetchFile(imgData));
      await ffmpeg.run("-i", `render.png`, "render.mp4");
      const output = await ffmpeg.FS("readFile", "render.mp4");
      const blob = new Blob([output.buffer], { type: "video/mp4" });

      const url = await this.api_manager.uploadMediaFrameGeneration(
        blob,
        "render.mp4",
        this.art_style,
        this.positive_prompt,
        this.negative_prompt,
      );
      console.log(url);

      const stylePreview: HTMLVideoElement | null = document.getElementById(
        "styled-preview",
      ) as HTMLVideoElement;
      if (stylePreview) {
        stylePreview.src = url;
      } else {
        console.log("No style preview window.");
      }

      this.generating_preview = false;

      return new Promise((resolve, reject) => {
        resolve(url);
      });
    }
  }

  // This initializes the generation of a video render scene is where the core work happens
  generateVideo() {

    console.log("Generating video...", this.frame_buffer);
    if (this.rendering) {
      return;
    }

    this.showLoading()

    this.rendering = true; // has to go first to debounce
    this.startPlayback();
    this.frame_buffer = [];
    this.render_timer = 0;
    this.activeScene.renderMode(this.rendering);
    if (this.activeScene.hot_items) {
      this.activeScene.hot_items.forEach((element) => {
        element.visible = false;
      });
    }
  }

  startPlayback() {

    this.updateLoad(25, "Starting Processing")

    this.timeline.is_playing = true;
    this.timeline.scrubber_frame_position = 0;
    if (!this.camera_person_mode) {
      this.switchCameraView();
    }
    if (this.activeScene.hot_items) {
      this.activeScene.hot_items.forEach((element) => {
        element.visible = false;
      });
    }
  }

  updateSelectedUI() {
    if (this.selected == undefined) {
      return;
    }
    const pos = this.selected.position;
    const rot = this.selected.rotation;
    const scale = this.selected.scale;

    // TODO this is a bug we need to only show when clicked on and use UPDATE when updating.
    this.dispatchAppUiState({
      type: APPUI_ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
      payload: {
        group:
          this.selected.name === "::CAM::"
            ? ClipGroup.CAMERA
            : ClipGroup.OBJECT, // TODO: add meta data to determine what it is a camera or a object or a character into prefab clips
        object_uuid: this.selected.uuid,
        object_name: this.selected.name,
        version: this.version,
        objectVectors: {
          position: {
            x: parseFloat(pos.x.toFixed(2)),
            y: parseFloat(pos.y.toFixed(2)),
            z: parseFloat(pos.z.toFixed(2)),
          },
          rotation: {
            x: parseFloat(THREE.MathUtils.radToDeg(rot.x).toFixed(2)),
            y: parseFloat(THREE.MathUtils.radToDeg(rot.y).toFixed(2)),
            z: parseFloat(THREE.MathUtils.radToDeg(rot.z).toFixed(2)),
          },
          scale: {
            x: parseFloat(scale.x.toFixed(6)),
            y: parseFloat(scale.y.toFixed(6)),
            z: parseFloat(scale.z.toFixed(6)),
          },
        },
      },
    });
  }

  // Automaticly resize scene.
  onWindowResize() {
    // Calculate the maximum possible dimensions while maintaining the aspect ratio
    const width = window.innerWidth; // / aspect_adjust
    const height = window.innerHeight; // / aspectRatio

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

    if (this.render_camera == undefined) {
      return;
    }

    //this.renderer.setSize(this.render_width, this.render_height);
    this.render_camera.aspect = this.render_width / this.render_height;
    this.render_camera.updateProjectionMatrix();
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
      this.outlinePass == undefined ||
      this.camera_person_mode
    ) {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const interactable: any[] = [];
    this.activeScene.scene.children.forEach((child: THREE.Object3D) => {
      // console.log(child);
      if (child.name != "") {
        if (
          child.type == "Mesh" ||
          child.type == "Object3D" ||
          child.type == "Group"
        ) {
          interactable.push(child);
        }
      }
    });
    const intersects = this.raycaster.intersectObjects(interactable, true);

    if (intersects.length > 0) {
      if (intersects[0].object.type != "GridHelper") {
        let currentObject = intersects[0].object;
        while (currentObject.parent && currentObject.parent.type !== "Scene") {
          currentObject = currentObject.parent;
        }
        this.selected = currentObject;
        // Show panel here

        if (this.selected.type == "Scene") {
          this.selected = intersects[0].object;
        }
        this.activeScene.selected = this.selected;

        // this.update_properties()
        this.activeScene.scene.add(this.control);
        this.control.attach(this.selected);
        this.outlinePass.selectedObjects = [this.selected];
        this.transform_interaction = true;

        // Contact react land
        this.dispatchAppUiState({
          type: APPUI_ACTION_TYPES.SHOW_CONTROLPANELS_SCENEOBJECT,
        });
        this.updateSelectedUI();
      }
    } else if (this.transform_interaction == false) {
      this.removeTransformControls();
      this.dispatchAppUiState({
        type: APPUI_ACTION_TYPES.HIDE_CONTROLPANELS_SCENEOBJECT,
      });
    } else {
      this.transform_interaction = false;
    }
  }
}

export default Editor;
