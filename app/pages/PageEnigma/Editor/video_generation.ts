import Editor from "./editor";
import { EditorStates, ClipType } from "~/pages/PageEnigma/enums";
import { editorState, previewSrc } from "../signals/engine";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { ToastTypes } from "~/enums";
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import { ClipUI } from "../datastructures/clips/clip_ui.js";
import { Visibility } from "./api_manager.js";
import * as THREE from "three";
import { getSceneSignals } from "~/signals";
import { v4 as uuidv4 } from "uuid";
import { SceneGenereationMetaData as SceneGenerationMetaData } from "~/pages/PageEnigma/models/sceneGenerationMetadata";
import { MediaUploadApi, VideoApi } from "~/Classes/ApiManager";
import { globalIPAMediaToken } from "../signals";
import { addToast } from "~/signals";

// TODO THIS CLASS MAKES NO SENSE Refactor so we generate all the frames first. then pass it through this pipeline as a data structure process it. through this class.
import { startPollingActiveJobs } from "~/signals";

interface MediaTokens {
  color: string;
  normal: string;
  depth: string;
  outline: string;
}

export class VideoGeneration {
  editor: Editor;
  mediaUploadAPI: MediaUploadApi;
  videoAPI: VideoApi;

  // For cached style Re-Generation
  private last_scene_check_sum: string;
  // Last Media token IDs
  private last_media_tokens: MediaTokens;
  // Last toggle position for Render
  public last_position_of_preprocessing: boolean;

  constructor(editor: Editor) {
    this.editor = editor;
    this.mediaUploadAPI = new MediaUploadApi();
    this.videoAPI = new VideoApi();
    this.last_scene_check_sum = "";
    this.last_media_tokens = { color: "", normal: "", depth: "", outline: "" };
    this.last_position_of_preprocessing = false;
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generateFrame() {
    if (!this.editor.generating_preview && this.editor.rawRenderer) {
      this.editor.generating_preview = true;
      this.editor.utils.removeTransformControls();
      this.editor.activeScene.renderMode(true);
      if (this.editor.activeScene.hot_items) {
        this.editor.activeScene.hot_items.forEach((element) => {
          element.visible = false;
        });
      }

      // if (this.editor.render_camera && this.editor.cam_obj) {
      //   this.editor.render_camera.position.copy(this.editor.cam_obj.position);
      //   this.editor.render_camera.rotation.copy(this.editor.cam_obj.rotation);
      // }

      previewSrc.value = "";

      this.editor.rawRenderer.setSize(
        this.editor.render_width,
        this.editor.render_height,
      );

      this.editor.render_camera.aspect =
        this.editor.render_width / this.editor.render_height;

      this.editor.render_camera.updateProjectionMatrix();

      this.editor.rawRenderer.render(
        this.editor.activeScene.scene,
        this.editor.render_camera,
      );

      const imgData = this.editor.rawRenderer.domElement.toDataURL();
      const response = await fetch(imgData); // Fetch the data URL
      const blob = await response.blob(); // Convert to Blob

      if (!this.editor.camera_person_mode) {
        this.editor.switchCameraView();
        editorState.value = EditorStates.PREVIEW;
      }

      this.editor.generating_preview = false;

      try {
        const url = await this.editor.api_manager.uploadMediaFrameGeneration(
          blob,
          "render.png",
          this.editor.art_style,
          this.editor.positive_prompt,
          this.editor.negative_prompt,
        );

        previewSrc.value = url;
        return Promise.resolve(url);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unknown Error in Generate Frame";
        Queue.publish({
          queueName: QueueNames.FROM_ENGINE,
          action: fromEngineActions.POP_A_TOAST,
          data: {
            type: ToastTypes.ERROR,
            message: errorMessage,
          },
        });
      }
    }
  }

  async convertAudioClip(itteration: number, ffmpeg: FFmpeg, clip: ClipUI) {
    // Base audio clip names.
    const video_og: string = itteration + "tmp.mp4";
    const wav_name: string = itteration + "tmp.wav";
    const new_video: string = itteration + 1 + "tmp.mp4";
    let startFrame: number = clip.offset;
    let endFrame: number = clip.length;

    if (endFrame > this.editor.timeline.timeline_limit) {
      endFrame = this.editor.timeline.timeline_limit;
    }
    if (startFrame > this.editor.timeline.timeline_limit) {
      startFrame = this.editor.timeline.timeline_limit - 1;
    }

    const startTime: number = startFrame / this.editor.cap_fps;
    const endTime: number = endFrame / this.editor.cap_fps;
    const end: number = endTime - startTime;

    // Use ffmpeg to convert audio to video.
    const audioSegment: string = "as_" + wav_name;
    await ffmpeg.FS(
      "writeFile",
      wav_name,
      await fetchFile(
        await this.editor.api_manager.getMediaFile(clip.media_id),
      ),
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

    // Combine final audio with video.
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

  // to determine if we should capture frames again or not.
  async shouldRenderScenesAgain(checkSumData: string): Promise<boolean> {
    // Should skip to rendering the scene if already processed the frames inputs for running a new style.
    if (this.last_scene_check_sum === "") {
      // no token means input was not processed so lets go do the video re-render process
      this.last_scene_check_sum = checkSumData;
      return false;
    } else {
      if (this.last_scene_check_sum === checkSumData) {
        return true;
      } else {
        this.last_scene_check_sum = checkSumData;
        return false;
      }
    }
  }

  async stopPlaybackAndUploadVideo(compile_audio: boolean = true) {
    this.editor.rendering = false; // not sure about this variable ... this has so many state issues.

    // precondition checks, if we have no frames then we shouldn't try to do generations or snapshots
    // This means no frames so error out

    if (this.editor.frame_buffer.length <= 0) {
      await this.handleError(
        "Failed to Render Nothing to Animate in the Scene.",
        5000,
      );
      return;
    }

    if (this.editor.frame_buffer[0].length <= 0) {
      await this.handleError(
        "Failed to Render Nothing to Animate in the Scene.",
        5000,
      );
      return;
    }

    this.editor.generating_preview = true;

    await this.editor.updateLoad({
      progress: 50,
      message:
        "Please stay on this screen and do not switch tabs! while your video is being processed.",
    });

    const media_tokens: MediaTokens = {
      color: "",
      normal: "",
      depth: "",
      outline: "",
    };

    // properties used by the external scope to the for loop.
    const title = getSceneSignals().title || "Untitled";
    const style_name = this.editor.art_style.toString();
    const media_token = this.editor.current_scene_media_token || undefined;

    // TAKE A snap shot of the scene then use this token across all videos
    // convert the ip adapter image and upload as a media token
    const image_uuid = uuidv4();
    let ipa_image_token = undefined;

    if (this.editor.globalIpAdapterImage != undefined) {
      const response = await this.mediaUploadAPI.UploadImage({
        fileName: `${image_uuid}.ipa`,
        blob: this.editor.globalIpAdapterImage,
        uuid: image_uuid,
      });

      if (response.success) {
        if (response.data) {
          ipa_image_token = response.data;
        }
      } else {
        // ip adapter upload failed
        await this.handleError(
          "Reference Image Upload Failed Try Generating Movie Again.",
          5000,
        );
        await this.handleSuccess(
          "Done Check Your Movies Tab On Profile.",
          5000,
        );
        return;
      }
    }

    // update the signal with this information
    if (ipa_image_token) {
      globalIPAMediaToken.value = ipa_image_token;
    }

    // TODO Remove so many of these around wtf. SceneGenereationMetaData should only be one place
    const metaData: SceneGenerationMetaData = {
      artisticStyle: this.editor.art_style,
      positivePrompt: this.editor.positive_prompt,
      negativePrompt: this.editor.negative_prompt,
      cameraAspectRatio: this.editor.render_camera_aspect_ratio,
      upscale: this.editor.generation_options.upscale,
      faceDetail: this.editor.generation_options.faceDetail,
      styleStrength: this.editor.generation_options.styleStrength,
      lipSync: this.editor.generation_options.lipSync,
      cinematic: this.editor.generation_options.cinematic,
      globalIPAMediaToken: ipa_image_token,
      enginePreProcessing: this.editor.engine_preprocessing, // the only thing that will invalidate the cache
    };

    // for the one case where the engine preprecessing is turned we need to cache this.
    this.last_position_of_preprocessing = this.editor.engine_preprocessing;

    // This is to save the snapshot of the scene for remixing
    const uuid_snapshot = uuidv4();

    // Save the scene
    const saveData = await this.editor.save_manager.saveData({
      sceneTitle: title,
      sceneToken: media_token,
      sceneGenerationMetadata: metaData,
    });

    const file = new File([saveData], `${title}.glb`, {
      type: "application/json",
    });

    const response =
      await this.editor.media_upload.UploadSceneSnapshotMediaFileForm({
        maybe_title: title,
        maybe_scene_source_media_file_token: media_token, // can be undefined or null
        uuid: uuid_snapshot,
        blob: file,
      });

    let immutable_media_token = undefined;
    if (response.success) {
      if (response.data) {
        immutable_media_token = response.data;
      }
    } else {
      await this.handleError(
        "Scene Snapshot Failed Try Generating Movie Again.",
        5000,
      );
      return;
    }

    console.log(`Immutable Snapshot Token: ${immutable_media_token}`);

    for (
      let image_index = 0;
      image_index < this.editor.frame_buffer[0].length;
      image_index++
    ) {
      await this.editor.updateLoad({
        progress: 50 + image_index * 5,
        message:
          "Please stay on this screen and do not switch tabs! while your video is being processed.",
      });

      const ffmpeg = createFFmpeg({ log: false });
      await ffmpeg.load();

      for (let index = 0; index < this.editor.frame_buffer.length; index++) {
        const element = this.editor.frame_buffer[index][image_index];
        await ffmpeg.FS(
          "writeFile",
          `image${index}.png`,
          await fetchFile(element),
        );
      }

      await ffmpeg.run(
        "-framerate",
        "" + this.editor.cap_fps,
        "-i",
        "image%d.png",
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
        "-vf", // WE REMOVED THE BLACK FRAME IN FFMEPG INSTEAD OF THE ENGINE
        "select=gte(n\\,1)", // WE REMOVED THE BLACK FRAME IN FFMEPG INSTEAD OF THE ENGINE
        // "select=gte(n\\,1),scale=1024:576",
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

      let iteration = 0;

      if (compile_audio) {
        for (const clip of this.editor.timeline.timeline_items) {
          if (clip.type == ClipType.AUDIO) {
            await this.convertAudioClip(iteration, ffmpeg, clip);
            iteration += 1;
          }
        }
      }

      // Upload individual videos or single color video
      const output = ffmpeg.FS("readFile", iteration + "tmp.mp4");
      ffmpeg.exit();

      this.editor.generating_preview = false;
      // Create a Blob from the output file for downloading
      const blob = new Blob([output.buffer], { type: "video/mp4" });

      const video_upload_response = await this.mediaUploadAPI.UploadNewVideo({
        blob: blob,
        fileName: `${title}.mp4`,
        uuid: uuidv4(),
        maybe_title: title,
        maybe_visibility: Visibility.Public,
        maybe_style_name: style_name,
        maybe_scene_source_media_file_token: immutable_media_token,
      });

      if (video_upload_response.success) {
        if (video_upload_response.data) {
          const upload_token = video_upload_response.data;
          console.log(upload_token);
          // saves these tokens for a rerun.
          if (image_index === 0) {
            media_tokens.color = upload_token;
          } else if (image_index === 1) {
            media_tokens.normal = upload_token;
          } else if (image_index === 2) {
            media_tokens.depth = upload_token;
          } else if (image_index === 3) {
            media_tokens.outline = upload_token;
          }
        }
      } else {
        await this.handleError(
          "Failed To Preprocess: Generate Please Try Again",
          5000,
        );
        return;
      }
    } // end generation for color or multiple channels of data.

    this.editor.onWindowResize();

    console.log(media_tokens);

    this.editor.setColorMap();

    console.log(`https://storyteller.ai/media/${media_tokens.color}`);
    console.log(`https://storyteller.ai/media/${media_tokens.normal}`);
    console.log(`https://storyteller.ai/media/${media_tokens.depth}`);
    console.log(`https://storyteller.ai/media/${media_tokens.outline}`);

    await this.editor.updateLoad({
      progress: 100,
      message: "Done Check Your Movies Tab On Profile.",
      label: "Success",
    });

    // this is so that its a check point just encase enqueue fails, if it does we can still restylize
    this.last_media_tokens = media_tokens;

    await this.handleEnqueue(media_tokens, ipa_image_token ?? "");

    await this.EndLoadingState();
  }

  async handleCachedEnqueue() {
    const enqueue_studio_response = await this.videoAPI.EnqueueStudio({
      enqueueVideo: {
        disable_lcm: false,
        enable_lipsync: this.editor.generation_options.lipSync,
        input_file: this.last_media_tokens.color,
        negative_prompt: this.editor.negative_prompt,
        prompt: this.editor.positive_prompt,
        remove_watermark: false,
        style: this.editor.art_style.toString(),
        frame_skip: 2,
        travel_prompt: "",
        trim_end_millis: 7000,
        trim_start_millis: 0,
        use_cinematic: this.editor.generation_options.cinematic,
        use_face_detailer: this.editor.generation_options.faceDetail,
        use_strength: this.editor.generation_options.styleStrength,
        use_upscaler: this.editor.generation_options.upscale,
        uuid_idempotency_token: uuidv4(),
        global_ipa_media_token: globalIPAMediaToken.value ?? "",
        input_depth_file: this.last_media_tokens.depth,
        input_normal_file: this.last_media_tokens.normal,
        input_outline_file: this.last_media_tokens.outline,
        creator_set_visibility: Visibility.Public,
      },
    });

    if (enqueue_studio_response.success) {
      console.log("Start Polling Active Jobs");
      startPollingActiveJobs();
      addToast(
        ToastTypes.SUCCESS,
        "Done Check Your Movies Tab On Profile.",
        5000,
      );
    } else {
      addToast(ToastTypes.ERROR, "Failed To Process Movie Try Again", 5000);
    }
  }

  async handleEnqueue(upload_tokens: MediaTokens, ipa_image_token: string) {
    const enqueue_studio_response = await this.videoAPI.EnqueueStudio({
      enqueueVideo: {
        disable_lcm: false,
        enable_lipsync: this.editor.generation_options.lipSync,
        input_file: upload_tokens.color,
        negative_prompt: this.editor.negative_prompt,
        prompt: this.editor.positive_prompt,
        remove_watermark: false,
        style: this.editor.art_style.toString(),
        frame_skip: 2,
        travel_prompt: "",
        trim_end_millis: 7000,
        trim_start_millis: 0,
        use_cinematic: this.editor.generation_options.cinematic,
        use_face_detailer: this.editor.generation_options.faceDetail,
        use_strength: this.editor.generation_options.styleStrength,
        use_upscaler: this.editor.generation_options.upscale,
        uuid_idempotency_token: uuidv4(),
        global_ipa_media_token: ipa_image_token,
        input_depth_file: upload_tokens.depth,
        input_normal_file: upload_tokens.normal,
        input_outline_file: upload_tokens.outline,
        creator_set_visibility: Visibility.Public,
      },
    });

    if (enqueue_studio_response.success) {
      startPollingActiveJobs();
    } else {
      await this.handleError("Failed To Process Movie Try Again", 5000);
      return;
    }

    this.handleSuccess("Done Check Your Movies Tab On Profile.", 5000);
  }

  async handleSuccess(message: string, timeout: number) {
    addToast(ToastTypes.SUCCESS, message, timeout);
  }
  async handleError(message: string, timeout: number) {
    addToast(ToastTypes.ERROR, message, timeout);
    await this.EndLoadingState();
  }
  async EndLoadingState() {
    this.editor.generating_preview = false;
    this.editor.endLoading();
    this.editor.onWindowResize();
    this.editor.recorder = undefined;
    if (this.editor.rawRenderer) {
      this.editor.rawRenderer.setSize(
        this.editor.startRenderWidth,
        this.editor.startRenderHeight,
      );
    }

    this.editor.camViewCanvasMayReset();

    this.editor.rawRenderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.editor.canvasRenderCamReference || undefined,
      preserveDrawingBuffer: true,
    });
    this.editor._configurePostProcessingRaw();

    this.editor.activeScene.renderMode(false);

    this.editor.switchEdit();
  }
}
