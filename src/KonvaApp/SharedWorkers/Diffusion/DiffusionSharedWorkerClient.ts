import {
  SharedWorkerRequest,
  SharedWorkerResponse,
} from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";
import { ResponseType } from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";
// import diffusionWorkerURL from "~/KonvaApp/SharedWorkers/Diffusion/DiffusionSharedWorker.ts?worker&url";
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
    if (import.meta.env.DEV) {
      console.log("This is running a worker in development");
      this.sharedWorker = new SharedWorker(workerPath, {
        type: "module",
      });
    } else {
      console.log("This is running a worker in production");

      this.sharedWorker = new SharedWorker(
        new URL("workers/DiffusionSharedWorker.js", import.meta.url),
        {
          type: "module",
        },
      );
      // // in production this is a work around .. https://github.com/vitejs/vite/issues/13680
      // const js = `import ${JSON.stringify(new URL(diffusionWorkerURL, import.meta.url))}`;
      // const blob = new Blob([js], { type: "application/javascript" });
      // const objURL = URL.createObjectURL(blob);
      // this.sharedWorker = new SharedWorker(new URL(objURL, import.meta.url), {
      //   type: "module",
      // });
    }
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
