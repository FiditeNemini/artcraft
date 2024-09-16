// Example of this working.
import { error } from "@techstark/opencv-js";
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";
import { MediaUploadApi, VideoApi } from "~/Classes/ApiManager";
import { Visibility } from "~/Classes/ApiManager/enums/Visibility";
import { ArtStyleNames } from "~/components/features/DialogAiStylize/enums";
import { v4 as uuidv4 } from "uuid";
import { JobsApi } from "~/Classes/ApiManager";
import {
  ProgressData,
  WorkResult,
} from "~/KonvaApp/WorkerPrimitives/GenericWorker";

import {
  SharedWorkerBase,
  SharedWorkerRequest,
  SharedWorkerResponse,
  ResponseType,
} from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";
import { JobStatus } from "~/Classes/ApiManager/enums/Job";

export interface DiffusionSharedWorkerProgressData {
  url: string;
  status: JobStatus;
}

export interface DiffusionSharedWorkerItemData {
  imageBitmap: ImageBitmap;
  totalFrames: number;
  frame: number;
  height: number;
  width: number;
}
export interface DiffusionSharedWorkerErrorData {
  error: string;
}
export interface DiffusionSharedWorkerResponseData {
  videoUrl: string;
}

export class DiffusionSharedWorker extends SharedWorkerBase<
  DiffusionSharedWorkerItemData,
  DiffusionSharedWorkerResponseData,
  DiffusionSharedWorkerProgressData
> {
  public zipFileWriter: BlobWriter;
  public zipWriter: ZipWriter<Blob>;
  public imageType: string;
  public totalFrames: number;

  public offscreenCanvas: OffscreenCanvas | undefined;
  public bitmapContext: ImageBitmapRenderingContext | undefined | null;

  public mediaAPI: MediaUploadApi;
  public videoAPI: VideoApi;
  public jobsAPI: JobsApi;
  public blobs: Blob[];
  constructor(port: MessagePort) {
    super(port);
    this.setup(this.workFunction.bind(this), this.progressFunction.bind(this));
    this.offscreenCanvas = undefined;
    this.bitmapContext = undefined;
    this.imageType = "image/jpeg";
    this.zipFileWriter = new BlobWriter(this.imageType);
    this.zipWriter = new ZipWriter(this.zipFileWriter);
    this.totalFrames = 0;

    this.videoAPI = new VideoApi();
    this.jobsAPI = new JobsApi();
    this.mediaAPI = new MediaUploadApi();

    this.blobs = [];
  }

  async zipBlobs(): Promise<Blob> {
    for (let i = 0; i < this.blobs.length; i++) {
      const blob = this.blobs[i];
      const name = String(i).padStart(5, "0"); // '0009'
      await this.zipWriter.add(`${name}.jpg`, new BlobReader(blob));
    }
    const zipBlob = await this.zipWriter.close();

    return zipBlob;
  }

  async reset() {
    this.zipFileWriter = new BlobWriter(this.imageType);
    this.zipWriter = new ZipWriter(this.zipFileWriter);
    this.totalFrames = 0;
  }
  // Data here will be shipped off for progressive loading
  async workFunction(
    isDoneStreaming: boolean,
    item: DiffusionSharedWorkerItemData,
    reportProgress: (
      progress: number,
      data: DiffusionSharedWorkerProgressData,
    ) => void,
  ): Promise<[DiffusionSharedWorkerResponseData | undefined, boolean]> {
    // make request via api with options

    console.log(this);
    try {
      if (this.offscreenCanvas === undefined) {
        this.offscreenCanvas = new OffscreenCanvas(item.width, item.height);
        this.bitmapContext = this.offscreenCanvas.getContext("bitmaprenderer");
      }

      if (!this.bitmapContext) {
        console.log("Failed to create bitmap context.");
        throw Error("Bitmap Rendering Context Not Availible.");
      }

      this.bitmapContext.transferFromImageBitmap(item.imageBitmap);

      const blob = await this.offscreenCanvas.convertToBlob({
        quality: 1.0,
        type: this.imageType,
      });

      this.blobs.push(blob);
      // progress
      const aproxSteps = item.totalFrames;
      const totalPercent = 100.0;

      const progressData: DiffusionSharedWorkerProgressData = {
        url: "",
        status: JobStatus.PENDING,
      };

      reportProgress(
        (item.frame / aproxSteps / 2 / totalPercent) * 100,
        progressData,
      ); // once finished gives you up to 50%

      /** Don't do this ? doesn't let you stream zip it.
        const name = String(item.frame).padStart(5, "0"); // '0009'
        console.log(name);
        await this.zipWriter.add(`${name}.jpg`, new BlobReader(blob));
      **/

      if (isDoneStreaming === false) {
        return [undefined, false];
      }

      console.log("Prepare to Zip");
      const zipBlob = await this.zipBlobs();

      console.log(zipBlob);
      console.log("Zipped");
      const response = await this.mediaAPI.UploadStudioShot({
        maybe_title: "",
        uuid_idempotency_token: uuidv4(),
        blob: zipBlob,
        fileName: "media.zip",
        maybe_visibility: Visibility.Public,
      });

      const mediaToken = response.data;

      if (!mediaToken) {
        throw Error("Media Token Not Availible");
      }

      const studioResponse = await this.videoAPI.EnqueueStudio({
        enqueueVideo: {
          disable_lcm: false,
          enable_lipsync: false,
          input_file: mediaToken,
          negative_prompt: "",
          prompt: "High quality anime style",
          remove_watermark: false,
          style: ArtStyleNames.Anime2_5D,
          frame_skip: 2,
          travel_prompt: "",
          trim_end_millis: 7000,
          trim_start_millis: 0,
          use_cinematic: true,
          use_face_detailer: false,
          use_strength: 1.0,
          use_upscaler: false,
          uuid_idempotency_token: uuidv4(),
          global_ipa_media_token: "",
          input_depth_file: "",
          input_normal_file: "",
          input_outline_file: "",
          creator_set_visibility: Visibility.Public,
        },
      });

      let resultURL = undefined;
      if (studioResponse.success && studioResponse.data?.inference_job_token) {
        console.log("Start Streaming Result");
        if (!studioResponse.data.inference_job_token) {
          throw Error("No Job Token Returned Try Again");
        }
        const jobToken = studioResponse.data.inference_job_token;

        // if error send it back through the pipe
        let jobIsProcessing = true;

        while (jobIsProcessing) {
          const job = await this.jobsAPI.GetJobByToken({ token: jobToken });
          console.log(job);
          if (!job.data) {
            console.log("Job Data Not Found");
            throw Error("Job Data Not Found");
          }
          const status = job.data.status.status;
          const progress = job.data.status.progress_percentage;

          let computedProgress = 50;
          if (progress === 0) {
            computedProgress = 50;
          }
          computedProgress = 50 + progress / 2;

          let renderProgressData: DiffusionSharedWorkerProgressData = {
            url: "",
            status: JobStatus.DEAD,
          };
          renderProgressData.status = status;
          switch (status) {
            case JobStatus.PENDING:
              reportProgress(
                computedProgress / totalPercent,
                renderProgressData,
              ); // once finished gives you up to 50%
              break;
            case JobStatus.DEAD:
              reportProgress(0, renderProgressData);
              break;
            case JobStatus.STARTED:
              reportProgress(
                computedProgress / totalPercent,
                renderProgressData,
              );
              break;
            case JobStatus.ATTEMPT_FAILED:
              reportProgress(
                computedProgress / totalPercent,
                renderProgressData,
              );
              break;
            case JobStatus.COMPLETE_SUCCESS:
              jobIsProcessing = false;
              if (!job.data.maybe_result.maybe_public_bucket_media_path) {
                // maybe you need to convert to media url ?
                throw Error("Server Failed To Return Result");
              }
              resultURL = job.data.maybe_result.maybe_public_bucket_media_path;
              reportProgress(100, renderProgressData);
              break;
            case JobStatus.COMPLETE_FAILURE:
              jobIsProcessing = false;
              reportProgress(0, renderProgressData);
              break;
            case JobStatus.DEAD:
              jobIsProcessing = false;
              reportProgress(0, renderProgressData);
              break;
            case JobStatus.CANCCELLED_BY_SYSTEM:
              jobIsProcessing = false;
              reportProgress(0, renderProgressData);
              break;
            case JobStatus.CANCELLED_BY_USER:
              jobIsProcessing = false;
              reportProgress(0, renderProgressData);
              break;
          }
          await this.sleep(1000);
        } // end while loop
      }
      if (!resultURL) {
        throw Error("Media URL Result Missing");
      }

      const responseData: DiffusionSharedWorkerResponseData = {
        videoUrl: resultURL,
      };

      return [responseData, true];
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      // reset the state of the worker or kill it in the multicase.
      await this.reset();
    }
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  progressFunction(progress: ProgressData<DiffusionSharedWorkerProgressData>) {
    console.log(
      `Progress Function  JobID:${progress.jobID} Data:${progress.data} Progress:${progress.progress}`,
    );

    // send out to node as a worker response
    this.send({
      jobID: progress.jobID,
      responseType: ResponseType.progress,
      data: progress.data,
    });
  }

  async reportResult(result: WorkResult<DiffusionSharedWorkerResponseData>) {
    this.send({
      jobID: result.jobID,
      responseType: ResponseType.result,
      data: result.data,
    });
  }

  async errorFunction(
    error: SharedWorkerResponse<
      DiffusionSharedWorkerItemData,
      DiffusionSharedWorkerResponseData
    >,
  ) {
    this.send({
      jobID: error.jobID,
      responseType: ResponseType.error,
      data: undefined,
    });
  }

  async receive(request: SharedWorkerRequest<DiffusionSharedWorkerItemData>) {
    console.log("Received Request");
    console.log(request);
    this.submitWork({
      jobID: request.jobID,
      data: request.data,
      isDoneStreaming: request.isDoneStreaming,
    });
  }
}

// This is a copy paste to create a worker now.
self.onconnect = (e: any) => {
  const port = e.ports[0];
  console.log("DiffusionSharedWorker Started");
  let worker: DiffusionSharedWorker | undefined = undefined;
  let started = false;

  if (started === false) {
    started = true;
    worker = new DiffusionSharedWorker(port);
    worker.start();
  }

  // Response For Start.
  const workerResult = "DiffusionSharedWorker Started";
  port.postMessage(workerResult);
  port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
};
