// Example of this working.
import { error } from "@techstark/opencv-js";
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";

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

export interface DiffusionSharedWorkerProgressData {
  url: string;
}

export interface DiffusionSharedWorkerItemData {
  imageBitmap: ImageBitmap;
  totalFrames: number;
  frame: number;
  height: number;
  width: number;
}

export interface DiffusionSharedWorkerResponseData {
  videoUrl: string;
  zipBlob: Blob; // debug purposes
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

  constructor(port: MessagePort) {
    super(port);
    this.setup(this.workFunction.bind(this), this.progressFunction.bind(this));
    this.offscreenCanvas = undefined;
    this.bitmapContext = undefined;
    this.imageType = "image/jpeg";
    this.zipFileWriter = new BlobWriter(this.imageType);
    this.zipWriter = new ZipWriter(this.zipFileWriter);
    this.totalFrames = 0;
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

    const aproxSteps = item.totalFrames * 2;
    const progressData: DiffusionSharedWorkerProgressData = { url: "" };

    reportProgress(item.frame / aproxSteps, progressData);

    const name = String(item.frame).padStart(5, "0"); // '0009'
    await this.zipWriter.add(`${name}.jpg`, new BlobReader(blob));

    if (isDoneStreaming === false) {
      return [undefined, false];
    }

    // make request via api with options
    const zipBlob = await this.zipWriter.close();
    const responseData: DiffusionSharedWorkerResponseData = {
      videoUrl: "",
      zipBlob: zipBlob,
    };

    return [responseData, true];
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

  reportResult(result: WorkResult<DiffusionSharedWorkerResponseData>) {
    console.log(`Result: jobID:${result.jobID} result:${result.data}`);
    this.send({
      jobID: result.jobID,
      responseType: ResponseType.result,
      data: result.data,
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
