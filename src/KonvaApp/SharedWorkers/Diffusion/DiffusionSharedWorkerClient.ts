import {
  SharedWorkerRequest,
  SharedWorkerResponse,
} from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";
import { ResponseType } from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";

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
    this.sharedWorker = new SharedWorker(workerPath, {
      type: "module",
    });
    this.port = this.sharedWorker.port;
    this.port.onmessage = this.onMessage.bind(this);
    this.port.start();
  }

  async onMessage(event: MessageEvent) {
    // returns progress and returns result need to check error tomorrow then were good to go.
    //console.log(`incoming`);
    // console.log(event);
    if (event.data.responseType === ResponseType.error) {
      //console.log(`DiffusionSharedWorkerClient Error`);
      //console.log(event.data);
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
      // console.log(`DiffusionSharedWorkerClient Message Unknown?`);
      // console.log(event.data);
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
