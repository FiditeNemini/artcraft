import {
  SharedWorkerRequest,
  SharedWorkerResponse,
} from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";
import { ResponseType } from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";
// import diffusionWorkerURL from "DiffusionSharedWorker.js?worker&url";
// import diff from "~/KonvaApp/WorkerPrimitives/SharedWorkerBa"

//
// tsc src\KonvaApp\SharedWorkers\Diffusion\DiffusionSharedWorker.ts --module esnext --target es2015 --outDir dist
import worker from "~/KonvaApp/SharedWorker/DiffusionSharedWorker.ts?sharedworker";
export class DiffusionSharedWorkerClient<
  DiffusionSharedWorkerItemData,
  DiffusionSharedWorkerResponseData,
  DiffusionSharedWorkerProgressData,
> {
  private port: MessagePort;
  private sharedWorker: SharedWorker;
  private messageReceived: (
    response: SharedWorkerResponse<
      DiffusionSharedWorkerResponseData,
      DiffusionSharedWorkerProgressData
    >,
  ) => void;
  constructor(
    workerPath: string,
    messageReceived: (
      response: SharedWorkerResponse<
        DiffusionSharedWorkerResponseData,
        DiffusionSharedWorkerProgressData
      >,
    ) => void,
  ) {
    this.messageReceived = messageReceived;
    // if (import.meta.env.DEV) {
    //   console.log("This is running a worker in development");
    //   this.sharedWorker = new SharedWorker(workerPath, {
    //     type: "module",
    //   });
    // } else {
    try {
      console.log("This is running a worker in production");
      //const url = new URL("workers/DiffusionSharedWorker.js", import.meta.url);
      //console.log("launching shared worker", url);

      const url = new URL("worker.js", import.meta.url);
      console.log("launching shared worker", url);

      this.sharedWorker = new SharedWorker(url, {
        type: "module",
      });

      this.sharedWorker.addEventListener("error", (value) => {
        console.log("ERROR?!?!");
        console.log(value);
      });

      console.log("launched shared worker (?)");
    } catch (error) {
      console.log("ERROR with shared worker!");
      console.log(error);
    }
    //}
    // // in production this is a work around .. https://github.com/vitejs/vite/issues/13680
    // const js = `import ${JSON.stringify(new URL(diffusionWorkerURL, import.meta.url))}`;
    // const blob = new Blob([js], { type: "application/javascript" });
    // const objURL = URL.createObjectURL(blob);
    // this.sharedWorker = new SharedWorker(new URL(objURL, import.meta.url), {
    //   type: "module",
    // });
    //}
    this.port = this.sharedWorker.port;
    this.port.onmessage = this.onMessage.bind(this);
    this.port.start();
  }

  async onMessage(event: MessageEvent) {
    // returns progress and returns result need to check error tomorrow then were good to go.
    //console.log(`incoming`);
    // console.log(event);
    if (event.data.responseType === ResponseType.error) {
      console.log(`DiffusionSharedWorkerClient Error`);
      console.log(event.data);
      this.messageReceived(event.data);
    } else if (event.data.responseType === ResponseType.progress) {
      // console.log(`DiffusionSharedWorkerClient Progress`);
      //console.log(event.data);
      this.messageReceived(event.data);
    } else if (event.data.responseType === ResponseType.result) {
      // console.log(`DiffusionSharedWorkerClient Result`);
      //console.log(event.data);
      this.messageReceived(event.data);
    } else {
      console.log(`DiffusionSharedWorkerClient Message Unknown:`);
      console.log(event.data);
    }
  }

  async sendData(
    jobID: number,
    data: DiffusionSharedWorkerItemData,
    isDoneStreaming: boolean,
  ) {
    const payload: SharedWorkerRequest<DiffusionSharedWorkerItemData> = {
      jobID: jobID,
      data: data,
      isDoneStreaming: isDoneStreaming,
    };
    this.port.postMessage(payload);
  }
}
