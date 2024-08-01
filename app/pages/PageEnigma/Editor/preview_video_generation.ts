import { MediaUploadApi, VideoApi } from "~/Classes/ApiManager";

import {
  StandardResponse,
  ProcessStatus,
  StreamingProgressResponse,
  VideoAudioPreProcessor,
  EngineFrameBuffers,
  AudioBuffer,
} from "./video_audio_preprocessor";

class PreviewVideoGeneration {
  conditionedFrameBuffer: EngineFrameBuffers;
  mediaUploadAPI: MediaUploadApi;
  videoAPI: VideoApi;
  videoAndAudioPreProcessor: VideoAudioPreProcessor;

  onProgress: (response: StreamingProgressResponse<ProcessStatus>) => void;

  constructor(
    onProgress: (response: StreamingProgressResponse<ProcessStatus>) => void,
  ) {
    this.onProgress = onProgress;
    this.conditionedFrameBuffer = {
      colorFrames: [],
      normalFrames: [],
      outlineFrames: [],
      depthFrames: [],
    };
    this.videoAndAudioPreProcessor = new VideoAudioPreProcessor(onProgress);
    this.mediaUploadAPI = new MediaUploadApi();
    this.videoAPI = new VideoApi();
  }

  // Cancel any part of the processing
  public async cancel() {}

  private async stageOneProcessing() {}

  private async stageTwoProcessing() {}

  private async processVideo() {
    // check if video is cached or not if not jump to 50%
    // collect frames and run preprocessing in the background.
    // start polling for percentage change and convert and remap to remainint %
  }

  async clearFrameBuffers() {
    this.conditionedFrameBuffer = {
      colorFrames: [],
      normalFrames: [],
      outlineFrames: [],
      depthFrames: [],
    };
  }
}

export { PreviewVideoGeneration };
