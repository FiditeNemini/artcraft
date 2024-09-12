import { SharedWorkerRequest, SharedWorkerResponse } from "./SharedWorkerBase";
import { ResponseType } from "./SharedWorkerBase";

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
    // exampl
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
      console.log(`TemplateSharedWorkerClient Error:${data}`);
    } else if (data.responseType === ResponseType.progress) {
      console.log(`TemplateSharedWorkerClient Progress:${data}`);
    } else if (data.responseType === ResponseType.result) {
      console.log(`TemplateSharedWorkerClient Result:${data}`);
    } else {
      console.log("TemplateSharedWorkerClient Message Unknown");
    }
    console.log(`TemplateSharedWorker Response: ${JSON.stringify(event.data)}`);
  }

  async send(
    sharedWorkerRequest: SharedWorkerRequest<DiffusionSharedWorkerItemData>,
  ) {
    this.port.postMessage(sharedWorkerRequest);
  }
}
