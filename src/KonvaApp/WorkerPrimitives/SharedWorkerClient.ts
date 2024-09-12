import { SharedWorkerRequest, SharedWorkerResponse } from "./SharedWorkerBase";

export class SharedWorkerClient<I, R, P> {
  private port: MessagePort;
  private sharedWorker: SharedWorker;

  private messageReceived: (response: SharedWorkerResponse<R, P>) => void;
  constructor(
    workerPath: string,
    messageReceived: (response: SharedWorkerResponse<R, P>) => void,
  ) {
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
    console.log(`GOTBACK ${JSON.stringify(event.data)}`);
  }

  async send(sharedWorkerRequest: SharedWorkerRequest<I>) {
    this.port.postMessage(sharedWorkerRequest);
  }
}
