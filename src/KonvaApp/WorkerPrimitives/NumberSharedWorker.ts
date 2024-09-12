import { ProgressData, WorkResult } from "./GenericWorker";
import {
  SharedWorkerBase,
  SharedWorkerRequest,
  SharedWorkerResponse,
  ResponseType,
} from "./SharedWorkerBase";

class SharedNumberWorker extends SharedWorkerBase<number, number, number> {
  constructor(port: MessagePort) {
    super(port);
    this.setup(this.workFunction.bind(this), this.progressFunction.bind(this));
  }
  // Data here will be shipped off for progressive loading
  async workFunction(
    item: number,
    reportProgress: (progress: number, data: number) => void,
  ): Promise<[number, boolean]> {
    console.log(`Working Item ${item}`);

    for (let i = 0; i < 1000; i++) {}
    reportProgress(item, 100);

    return [5, true];
  }

  progressFunction(progress: ProgressData<number>) {
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

  reportResult(result: WorkResult<number>) {
    console.log(`Result: jobID:${result.jobID} result:${result.data}`);
    this.send({
      jobID: result.jobID,
      responseType: ResponseType.result,
      data: result.data,
    });
  }

  async receive(request: SharedWorkerRequest<number>) {
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
  console.log("NumberSharedWorker Started");
  let worker: SharedNumberWorker | undefined = undefined;
  let started = false;

  if (started === false) {
    started = true;
    worker = new SharedNumberWorker(port);
    worker.start();
  }

  // Response For Start.
  const workerResult = "Number Shared Worker Started";
  port.postMessage(workerResult);
  port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
};
