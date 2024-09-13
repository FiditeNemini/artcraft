import {
  SharedWorkerRequest,
  SharedWorkerResponse,
} from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";
import { ResponseType } from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";

import {
  DiffusionSharedWorkerItemData,
  DiffusionSharedWorkerProgressData,
  DiffusionSharedWorkerResponseData,
} from "./DiffusionSharedWorker";

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
    // example
    // "src\\KonvaApp\\WorkerPrimitives\\NumberSharedWorker.ts"
    this.sharedWorker = new SharedWorker(workerPath, {
      type: "module",
    });
    this.port = this.sharedWorker.port;
    // make sure to bind this for this from the invoker
    this.port.onmessage = this.onMessage.bind(this);
    this.port.start();
  }

  async onMessage(event: MessageEvent) {
    // returns progress and returns result need to check error tomorrow then were good to go.
    const data = event.data as SharedWorkerResponse<
      DiffusionSharedWorkerResponseData,
      DiffusionSharedWorkerItemData
    >;
    if (data.responseType === ResponseType.error) {
      console.log(`DiffusionSharedWorkerClient Error:${data}`);
    } else if (data.responseType === ResponseType.progress) {
      console.log(`DiffusionSharedWorkerClient Progress:${data}`);
    } else if (data.responseType === ResponseType.result) {
      console.log(`DiffusionSharedWorkerClient Result:${data}`);
    } else {
      console.log(`DiffusionSharedWorkerClient Message Unknown ${data}`);
    }
    console.log(`TemplateSharedWorker Response: ${JSON.stringify(event.data)}`);
  }

  async send(
    sharedWorkerRequest: SharedWorkerRequest<DiffusionSharedWorkerItemData>,
  ) {
    this.port.postMessage(sharedWorkerRequest);
  }
}
