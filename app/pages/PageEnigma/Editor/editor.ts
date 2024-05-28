import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FreeCam } from "./free_cam";
import { TransformControls } from "./TransformControls.js";
import Scene from "./scene.js";
import { APIManager, ArtStyle } from "./api_manager.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { SAOPass } from "three/addons/postprocessing/SAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import AudioEngine from "./audio_engine.js";
import TransformEngine from "./transform_engine.js";
import EmotionEngine from "./emotion_engine";
import { TimeLine } from "./timeline.js";
import { LipSyncEngine } from "./lip_sync_engine.js";
import { AnimationEngine } from "./animation_engine.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { ClipGroup, EditorStates } from "~/pages/PageEnigma/enums";
import { AssetType } from "~/enums";
import { XYZ } from "../datastructures/common";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { MediaItem } from "~/pages/PageEnigma/models";
import { editorState } from "../signals/engine";
import { Utils } from "./helper";
import { VideoGeneration } from "./video_generation";
import { MouseControls } from "./keybinds_controls";
import { SaveManager } from "./save_manager";
import {
  authentication,
  loadingBarData,
  loadingBarIsShowing,
  signalScene,
} from "~/signals";
import { updateObjectPanel } from "../signals";
import { GenerationOptions } from "../models/generationOptions";
import { toEngineActions } from "../Queue/toEngineActions";

export type EditorInitializeConfig = {
  sceneToken: string;
  editorCanvasEl: HTMLCanvasElement;
  camViewCanvasEl: HTMLCanvasElement;
  sceneContainerEl: HTMLDivElement;
};

class Editor {
  version: number;
  activeScene: Scene;
  camera: THREE.PerspectiveCamera | null = null;
  render_camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.WebGLRenderer | undefined;
  rawRenderer: THREE.WebGLRenderer | undefined;
  clock: THREE.Clock | undefined;
  canvReference: HTMLCanvasElement | null = null;
  canvasRenderCamReference: HTMLCanvasElement | null = null;

  composer: EffectComposer | undefined;
  outlinePass: OutlinePass | undefined;
  last_cam_pos: THREE.Vector3;
  last_cam_rot: THREE.Euler;
  saoPass: SAOPass | undefined;
  outputPass: OutputPass | undefined;
  bloomPass: UnrealBloomPass | undefined;
  smaaPass: SMAAPass | undefined;
  control: TransformControls | undefined;
  raycaster: THREE.Raycaster | undefined;
  mouse: THREE.Vector2 | undefined;
  selected: THREE.Object3D | undefined;
  last_selected: THREE.Object3D | undefined;
  last_selected_sum: number | undefined;
  transform_interaction = false;
  rendering: boolean;
  api_manager: APIManager;
  cameraViewControls: FreeCam | undefined;
  orbitControls: OrbitControls | undefined;
  locked: boolean;
  frame_buffer: string[] = [];
  render_timer: number;
  fps_number: number;
  cap_fps: number;
  can_playback: boolean;
  playback_location: number;
  audio_engine: AudioEngine;
  transform_engine: TransformEngine;
  emotion_engine: EmotionEngine;
  lipsync_engine: LipSyncEngine;
  animation_engine: AnimationEngine;
  timeline: TimeLine;
  current_frame: number;
  lockControls: PointerLockControls | undefined;
  cam_obj: THREE.Object3D | undefined;
  camera_last_pos: THREE.Vector3;
  renderPass: RenderPass | undefined;
  generating_preview: boolean;
  frames: number;

  camera_person_mode: boolean;
  current_scene_media_token: string | null;
  current_scene_glb_media_token: string | null;

  can_initialize: boolean;
  switchPreviewToggle: boolean;

  // dispatchAppUiState: React.Dispatch<AppUiAction>;
  // userToken: string;
  // signalScene: (data: any) => void;
  // getSceneSignals: () => SceneSignal;
  render_width: number;
  render_height: number;

  positive_prompt: string;
  negative_prompt: string;
  art_style: ArtStyle;

  last_scrub: number;
  recorder: MediaRecorder | undefined;
  container: HTMLElement | null = null;

  selectedCanvas: boolean;
  startRenderHeight: number;
  startRenderWidth: number;
  lastCanvasSize: number;
  // Default params.

  // global names of scene entities
  camera_name: string;

  utils: Utils;
  videoGeneration: VideoGeneration;
  mouse_controls: MouseControls;
  save_manager: SaveManager;

  generation_options: GenerationOptions;
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
    // global names
    this.camera_name = "::CAM::";

    this.activeScene = new Scene("" + this.version, this.camera_name);
    this.activeScene.initialize();
    this.generating_preview = false;
    this.last_cam_pos = new THREE.Vector3(0, 0, 0);
    this.last_cam_rot = new THREE.Euler(0, 0, 0);
    this.camera_last_pos = new THREE.Vector3(0, 0, 0);
    this.startRenderWidth = 0;
    this.startRenderHeight = 0;
    this.rendering = false;
    this.lastCanvasSize = 0;
    this.switchPreviewToggle = false;
    // API.
    this.api_manager = new APIManager();
    // Debug & Movement.
    this.camera_person_mode = false;
    this.locked = false;
    // Recording params.
    this.render_timer = 0;
    this.fps_number = 60;
    this.cap_fps = 60;
    // Timeline settings.
    this.can_playback = false;
    this.playback_location = 0;
    this.last_scrub = 0;
    this.frames = 0;
    this.last_selected_sum = 0;
    this.selectedCanvas = false;
    // Audio Engine Test.

    this.render_width = 1280;
    this.render_height = 720;

    this.audio_engine = new AudioEngine();
    this.emotion_engine = new EmotionEngine(this.version);
    this.transform_engine = new TransformEngine(this.version);
    this.lipsync_engine = new LipSyncEngine();
    this.animation_engine = new AnimationEngine(this.version);

    this.timeline = new TimeLine(
      this,
      this.audio_engine,
      this.transform_engine,
      this.lipsync_engine,
      this.animation_engine,
      this.emotion_engine,
      this.activeScene,
      this.camera,
      this.mouse,
      this.camera_name,
    );

    this.utils = new Utils(this, this.activeScene);
    this.videoGeneration = new VideoGeneration(this);
    this.mouse_controls = new MouseControls(this);
    this.save_manager = new SaveManager(this);

    this.current_frame = 0;

    // Scene State
    this.current_scene_media_token = null;
    this.current_scene_glb_media_token = null;

    // stylization parameters
    this.positive_prompt =
      "((masterpiece, best quality, 8K, detailed)), colorful, epic, fantasy, (fox, red fox:1.2), no humans, 1other, ((koi pond)), outdoors, pond, rocks, stones, koi fish, ((watercolor))), lilypad, fish swimming around.";
    this.negative_prompt = "";
    this.art_style = ArtStyle.Anime2DFlat;

    this.generation_options = {
      faceDetail: false,
      upscale: false,
      styleStrength: 1.0,
      lipSync: false,
    };
  }

  isEmpty(value: string | null) {
    return value === null || value.trim().length === 0;
  }

  containerMayReset() {
    if (!this.container) {
      console.warn(
        "Editor - Container does not exist, querying from DOM via document.getElementById",
      );
      this.container = document.getElementById("video-scene-container");
    }
  }
  engineCanvasMayReset() {
    if (!this.canvReference) {
      console.warn(
        "Editor - Engine Canbas does not exist, querying from DOM via document.getElementById",
      );
      this.canvReference = document.getElementById(
        "video-scene",
      ) as HTMLCanvasElement;
    }
  }
  camViewCanvasMayReset() {
    if (!this.canvasRenderCamReference) {
      console.warn(
        "Editor - Cam View Canvas does not exist, querying from DOM via document.getElementById",
      );
      this.canvasRenderCamReference = document.getElementById(
        "camera-view",
      ) as HTMLCanvasElement;
    }
  }
  updateCamViewCanvas(newCanvas: HTMLCanvasElement) {
    this.canvasRenderCamReference = newCanvas;
  }
  initialize({
    sceneToken,
    editorCanvasEl,
    camViewCanvasEl,
    sceneContainerEl,
  }: EditorInitializeConfig) {
    if (!this.can_initialize) {
      console.log("Editor Already Initialized");
      return;
    }
    this.can_initialize = false;

    // Gets the canvas.
    this.canvReference = editorCanvasEl;
    this.canvasRenderCamReference = camViewCanvasEl;

    // Find the container element
    this.container = sceneContainerEl;

    // Use the container's dimensions
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;

    // Sets up camera and base position.
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 200);
    this.camera.position.z = 3;
    this.camera.position.y = 3;
    this.camera.position.x = -3;

    this.camera.layers.enable(0);
    this.camera.layers.enable(1); // This camera does not see this layer

    this.timeline.camera = this.camera;

    this.render_camera = new THREE.PerspectiveCamera(
      70,
      width / height,
      0.01,
      200,
    );

    this.render_camera.layers.disable(1); // This camera does not see this layer      );

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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    //document.body.appendChild(this.renderer.domElement)
    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.renderer.domElement.addEventListener(
      "resize",
      this.onWindowResize.bind(this),
    );

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

    //this.orbitControls.mouseButtons = {
    //  MIDDLE: THREE.MOUSE.ROTATE,
    //  RIGHT: THREE.MOUSE.PAN,
    //}; // Blender Style
    this.orbitControls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }; // Standard

    this.control = new TransformControls(this.camera, this.renderer.domElement);
    this.control.space = "local"; // Local transformation mode
    // .space = 'world'; // Global mode
    this.control.setScaleSnap(0.01);
    this.control.setTranslationSnap(0.01);
    this.control.setRotationSnap(0.01);
    console.log("Control Sensitivity:", this.control.sensitivity);

    // OnClick and MouseMove events.
    window.addEventListener(
      "mousemove",
      this.mouse_controls.onMouseMove.bind(this.mouse_controls),
      false,
    );
    window.addEventListener(
      "click",
      this.mouse_controls.onMouseClick.bind(this.mouse_controls),
      false,
    );
    window.addEventListener(
      "keydown",
      this.mouse_controls.onkeydown.bind(this.mouse_controls),
      false,
    );
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
      this.camera_last_pos.copy(new THREE.Vector3(-99999, -99999, -99999));
      // this.update_properties()
    });
    this.control.setSize(0.5); // Good default value for visuals.
    this.raycaster = new THREE.Raycaster();
    // Configure raycaster to check both layers
    this.raycaster.layers.set(0); // Enable default layer
    this.raycaster.layers.enable(1); // Also check objects on the custom layer

    this.mouse = new THREE.Vector2();
    this.activeScene.scene.add(this.control);
    // Resets canvas size.
    this.onWindowResize();

    this.setupResizeObserver();

    this.timeline.scene = this.activeScene;

    this.renderer.domElement.addEventListener(
      "mousedown",
      this.mouse_controls.onMouseDown.bind(this.mouse_controls),
      false,
    );
    this.renderer.domElement.addEventListener(
      "mouseup",
      this.mouse_controls.onMouseUp.bind(this.mouse_controls),
      false,
    );

    // saving state of the scene
    this.current_scene_media_token = null;
    this.current_scene_glb_media_token = null;

    this.cam_obj = this.activeScene.get_object_by_name(this.camera_name);

    // Creates the main update loop.
    //this.renderer.setAnimationLoop(this.updateLoop.bind(this));

    this.updateLoop();

    if (!this.utils.isEmpty(sceneToken)) {
      this.loadScene(sceneToken);
    } else {
      signalScene({
        title: "Untitled New Scene",
        token: undefined,
        ownerToken: authentication.userInfo.value?.user_token,
        isModified: false,
      });
    }

    document.addEventListener("mouseover", (event) => {
      if (this.orbitControls && this.cameraViewControls) {
        if (event.target instanceof HTMLCanvasElement) {
          if (this.camera_person_mode) {
            this.orbitControls.enabled = false;
            this.cameraViewControls.enabled = true;
          } else {
            this.orbitControls.enabled = true;
            this.cameraViewControls.enabled = false;
          }
          this.selectedCanvas = true;
        } else {
          this.orbitControls.enabled = false;
          this.cameraViewControls.enabled = false;
          this.selectedCanvas = false;
        }
        this.cameraViewControls?.reset();
      }
    });

    loadingBarData.value = {
      ...loadingBarData.value,
      progress: 100,
    };
    loadingBarIsShowing.value = false;
  }

  public async newScene(sceneTitleInput: string) {
    this.activeScene.clear();
    this.audio_engine = new AudioEngine();
    this.emotion_engine = new EmotionEngine(this.version);
    this.transform_engine = new TransformEngine(this.version);
    this.lipsync_engine = new LipSyncEngine();
    this.animation_engine = new AnimationEngine(this.version);

    this.timeline = new TimeLine(
      this,
      this.audio_engine,
      this.transform_engine,
      this.lipsync_engine,
      this.animation_engine,
      this.emotion_engine,
      this.activeScene,
      this.camera,
      this.mouse,
      this.camera_name,
    );
    this.cam_obj = this.activeScene.get_object_by_name(this.camera_name);
    const sceneTitle =
      sceneTitleInput && sceneTitleInput !== ""
        ? sceneTitleInput
        : "Untitled New Scene";
    signalScene({
      title: sceneTitle,
      token: undefined,
      ownerToken: authentication.userInfo.value?.user_token,
      isModified: false,
    });
    Queue.publish({
      queueName: QueueNames.FROM_ENGINE,
      action: fromEngineActions.RESET_TIMELINE,
      data: null,
    });
  }

  public async loadScene(scene_media_token: string) {
    await this.save_manager.loadScene(scene_media_token);

    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.UPDATE_TIME,
      data: { currentTime: 1 },
    });
  }

  isObjectLipsync(object_uuid: string) {
    return this.utils.isObjectLipsync(object_uuid);
  }

  isObjectLocked(object_uuid: string): boolean {
    return this.utils.isObjectLocked(object_uuid);
  }

  lockUnlockObject(object_uuid: string): boolean {
    return this.utils.lockUnlockObject(object_uuid);
  }

  setColor(object_uuid: string, hex_color: string) {
    this.activeScene.setColor(object_uuid, hex_color);
  }

  // TO UPDATE selected objects in the scene might want to add to the scene ...
  async setSelectedObject(position: XYZ, rotation: XYZ, scale: XYZ) {
    this.utils.setSelectedObject(position, rotation, scale);
  }

  public async saveScene({
    sceneTitle,
    sceneToken,
  }: {
    sceneTitle: string;
    sceneToken?: string;
  }): Promise<string> {
    return await this.save_manager.saveScene({ sceneTitle, sceneToken });
  }

  /**
   * This cleans up the transform controls
   * During saving it
   * Doesn't retain those controls.
   * @returns
   */
  removeTransformControls(remove_outline: boolean = true) {
    if (this.control == undefined) {
      return;
    }
    if (this.outlinePass == undefined) {
      return;
    }
    if (remove_outline) {
      this.last_selected = this.selected;
      this.selected = undefined;
      this.publishSelect();
    }
    this.control.detach();
    this.activeScene.scene.remove(this.control);
    if (remove_outline) this.outlinePass.selectedObjects = [];
  }

  switchCameraView() {
    this.utils.switchCameraView();
  }

  async showLoading() {
    loadingBarIsShowing.value = true;
  }

  async updateLoad(progress: number, message: string) {
    loadingBarData.value = {
      ...loadingBarData.value,
      progress: progress,
      message: message,
    };
  }

  async endLoading() {
    loadingBarIsShowing.value = false;
  }

  // Configure post processing.
  _configurePostProcessing() {
    const width = this.canvReference?.width ?? 0;
    const height = this.canvReference?.height ?? 0;

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

    this.saoPass.params.saoBias = 4.1;
    this.saoPass.params.saoIntensity = 1.0;
    this.saoPass.params.saoScale = 32.0;
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

    this.composer.addPass(this.saoPass);
    this.composer.addPass(this.bloomPass);
    //this.composer.addPass(this.smaaPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  deleteObject(uuid: string) {
    this.utils.deleteObject(uuid);
  }

  create_parim(name: string, pos: THREE.Vector3) {
    return this.activeScene.instantiate(name, pos);
  }

  // Render the scene to the camera, this is called in the update.
  async renderScene() {
    if (this.composer != null && !this.rendering && this.rawRenderer) {
      this.composer.render();
      this.rawRenderer.render(this.activeScene.scene, this.render_camera!);
    } else if (this.renderer && this.render_camera && !this.rendering) {
      this.renderer.setSize(this.render_width, this.render_height);
      this.renderer.render(this.activeScene.scene, this.render_camera);
    } else if (this.rendering && this.rawRenderer) {
      this.rawRenderer.render(this.activeScene.scene, this.render_camera!);
    } else {
      console.error("Could not render to canvas no render or composer!");
    }

    if (this.rendering && this.rawRenderer && this.clock && this.renderer) {
      if (this.recorder === undefined && this.render_camera) {
        this.rawRenderer.setSize(1024, 576);
        this.render_camera.aspect = 1024 / 576;
      }

      this.render_timer += this.clock.getDelta();
      this.frames += 1;
      this.playback_location++;
      const imgData = this.rawRenderer.domElement.toDataURL("image/png", 1.0); // High quality png.
      this.frame_buffer.push(imgData);
      this.render_timer += this.clock.getDelta();
      if (!this.timeline.is_playing) {
        //this.recorder.stop();
        this.playback_location = 0;
        this.stopPlaybackAndUploadVideo();
      }
    }
  }

  // Basicly Unity 3D's update loop.
  async updateLoop() {
    setTimeout(
      () => {
        requestAnimationFrame(this.updateLoop.bind(this));
      },
      1000 / (this.cap_fps * 2),
    ); // Get the most FPS we can out of the renderer.

    this.containerMayReset();

    if (!this.rendering && this.container) {
      if (
        this.container.clientWidth + this.container.clientHeight !==
        this.lastCanvasSize
      ) {
        this.onWindowResize();
        this.lastCanvasSize =
          this.container.clientWidth + this.container.clientHeight;
      }
    }

    if (this.cam_obj == undefined) {
      this.cam_obj = this.activeScene.get_object_by_name(this.camera_name);
    }

    if (this.clock == undefined || this.renderer == undefined) {
      return;
    }

    const delta_time = this.clock.getDelta();

    if (this.cameraViewControls && this.camera_person_mode) {
      this.cameraViewControls.update(5 * delta_time);
      if (this.cam_obj && this.camera) {
        if (this.last_scrub != this.timeline.scrubber_frame_position) {
          this.camera.position.copy(this.cam_obj.position);
          this.camera.rotation.copy(this.cam_obj.rotation);
        } else if (!this.timeline.is_playing) {
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
      const changeView = await this.timeline.update(this.rendering, delta_time);
      if (changeView) {
        this.switchCameraView();
      }
    } else if (
      this.last_scrub === this.timeline.scrubber_frame_position &&
      this.utils.getselectedSum() !== this.last_selected_sum
    ) {
      this.updateSelectedUI();
    }
    this.last_selected_sum = this.utils.getselectedSum();

    await this.renderScene();
    this.last_scrub = this.timeline.scrubber_frame_position;
  }

  change_mode(type: "translate" | "rotate" | "scale") {
    if (this.control == undefined) {
      return;
    }
    this.control.mode = type;
    this.transform_interaction = true;
  }

  async stopPlaybackAndUploadVideo(compile_audio: boolean = true) {
    this.videoGeneration.stopPlaybackAndUploadVideo(compile_audio);
  }

  async switchPreview() {
    if (!this.switchPreviewToggle) {
      this.switchPreviewToggle = true;
      editorState.value = EditorStates.PREVIEW;
      await this.generateFrame();
      if (this.cameraViewControls) {
        this.cameraViewControls.enabled = false;
      }
    }
  }

  switchEdit() {
    if (this.switchPreviewToggle && this.canvasRenderCamReference) {
      this.switchPreviewToggle = false;
      editorState.value = EditorStates.EDIT;
      setTimeout(() => {
        // if (!this.canvasRenderCamReference) {
        //   this.canvasRenderCamReference =
        //     document.getElementById("camera-view");
        // }
        this.camViewCanvasMayReset();
        this.rawRenderer = new THREE.WebGLRenderer({
          antialias: false,
          canvas: this.canvasRenderCamReference || undefined,
          preserveDrawingBuffer: true,
        });
        if (this.camera_person_mode) {
          this.switchCameraView();
        }
        this.activeScene.renderMode(false);
      }, 10);
    }
  }

  async generateFrame() {
    this.videoGeneration.generateFrame();
  }

  // This initializes the generation of a video render scene is where the core work happens
  generateVideo() {
    console.log("Generating video...", this.frame_buffer);
    this.timeline.is_playing = false;
    this.timeline.scrubber_frame_position = 0;
    this.timeline.current_time = 0;

    if (this.rendering || this.generating_preview) {
      return;
    }

    this.showLoading();

    this.rendering = true; // has to go first to debounce
    this.togglePlayback();
    this.frame_buffer = [];
    this.render_timer = 0;
    this.activeScene.renderMode(this.rendering);
    this.timeline.scrubber_frame_position = 0;
    if (this.activeScene.hot_items) {
      this.activeScene.hot_items.forEach((element) => {
        element.visible = false;
      });
    }
  }

  togglePlayback() {
    this.updateLoad(25, "Starting Processing");
    if (this.rawRenderer) {
      this.startRenderWidth = this.rawRenderer.domElement.width;
      this.startRenderHeight = this.rawRenderer.domElement.height;
    }
    if (!this.rendering && this.timeline.is_playing) {
      this.timeline.is_playing = false;
      // this.timeline.scrubber_frame_position = 0;
      // this.timeline.current_time = 0;
      // this.timeline.stepFrame(0);
      // this.timeline.resetScene();
      this.switchCameraView();
      if (this.activeScene.hot_items) {
        this.activeScene.hot_items.forEach((element) => {
          element.visible = true;
        });
      }
    } else {
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
  }

  updateSelectedUI() {
    if (this.selected === undefined || this.timeline.is_playing) {
      return;
    }
    const pos = this.selected.position;
    const rot = this.selected.rotation;
    const scale = this.selected.scale;

    // TODO this is a bug we need to only show when clicked on and use UPDATE when updating.
    updateObjectPanel({
      group:
        this.selected.name === this.camera_name
          ? ClipGroup.CAMERA
          : ClipGroup.OBJECT, // TODO: add meta data to determine what it is a camera or a object or a character into prefab clips
      object_uuid: this.selected.uuid,
      object_name: this.selected.name,
      version: String(this.version),
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
    }); //end updateObjectPanel
  }

  // Automaticly resize scene.
  onWindowResize() {
    this.containerMayReset();
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

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

  setupResizeObserver() {
    this.containerMayReset();
    if (!this.container) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (this.camera) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
        }
        this.renderer?.setSize(width, height);
        this.renderer?.setPixelRatio(window.devicePixelRatio);
      }
    });

    resizeObserver.observe(this.container);
  }

  getAssetType(selected: THREE.Object3D<THREE.Object3DEventMap>): AssetType {
    if (selected.type === "Mesh") {
      return selected.name === "::CAM::" ? AssetType.CAMERA : AssetType.OBJECT;
    }
    return AssetType.CHARACTER;
  }

  publishSelect() {
    if (this.selected) {
      console.log("publish", this.selected);
      Queue.publish({
        queueName: QueueNames.FROM_ENGINE,
        action: fromEngineActions.SELECT_OBJECT,
        data: {
          type: this.getAssetType(this.selected),
          object_uuid: this.selected.uuid,
          version: 1,
          media_id: this.selected.id.toString(),
          name: "",
        } as MediaItem,
      });
      return;
    }
    Queue.publish({
      queueName: QueueNames.FROM_ENGINE,
      action: fromEngineActions.DESELECT_OBJECT,
      data: null,
    });
  }
}

export default Editor;
