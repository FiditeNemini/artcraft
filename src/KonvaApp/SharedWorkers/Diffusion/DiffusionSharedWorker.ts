// Example of this working.
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
  canvas: OffscreenCanvas;
}

export interface DiffusionSharedWorkerResponseData {
  videoUrl: string;
}

export class DiffusionSharedWorker extends SharedWorkerBase<
  DiffusionSharedWorkerItemData,
  DiffusionSharedWorkerResponseData,
  DiffusionSharedWorkerProgressData
> {
  constructor(port: MessagePort) {
    super(port);
    this.setup(this.workFunction.bind(this), this.progressFunction.bind(this));
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
    console.log(`Working Item ${item}`);

    const progressData: DiffusionSharedWorkerProgressData = { url: "" };
    reportProgress(0, progressData);

    // check if stream is done.

    if (isDoneStreaming === false) {
      return [undefined, false];
    }

    // make request via api with options
    const responseData: DiffusionSharedWorkerResponseData = { videoUrl: "" };

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
