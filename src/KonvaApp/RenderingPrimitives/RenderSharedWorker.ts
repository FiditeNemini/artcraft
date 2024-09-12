// RenderSharedWorker.ts

import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";
import { RenderTask } from "./RenderTask";

class FrameProcessorWorker {
  public imageType: string;

  private zipFileWriter: BlobWriter;
  private zipWriter: ZipWriter<Blob>;

  private decodeQueue: RenderTask[];

  public isProcessing: boolean;

  public final_length: number;
  public item_count: number;

  public port: MessagePort;

  constructor(port: MessagePort) {
    this.final_length = 0;

    this.imageType = "image/jpeg";
    // Zipping
    this.decodeQueue = [];
    this.zipFileWriter = new BlobWriter(this.imageType);
    this.zipWriter = new ZipWriter(this.zipFileWriter);

    this.isProcessing = false;
    this.item_count = 0;

    this.port = port;
  }

  async startZipProcessQueue(): Promise<void> {
    if (this.decodeQueue.length > 0 && this.isProcessing == false) {
      this.isProcessing = true;

      const task = this.decodeQueue.shift();
      if (task) {
        const { offscreenCanvas, id } = task;
        // Proceed with processing the task
        try {
          // Convert the canvas content to a Blob
          const blob = await offscreenCanvas.convertToBlob({
            quality: 1.0,
            type: this.imageType,
          });

          // Send the Blob back to the main thread
          console.log(`Zipping Frame ${id} to Zip`);
          const name = String(id).padStart(5, "0"); // '0009'
          await this.zipWriter.add(`${name}.jpg`, new BlobReader(blob));

          this.item_count++;
        } catch (error) {
          console.error("Error processing image:", error);
          self.postMessage({ error: (error as Error).message }); //
        } finally {
          this.isProcessing = false;
        }
      } else {
        console.log("Queue is empty, no task to process.");
        return;
      }
    }
    // have this function loop
    setTimeout(this.startZipProcessQueue.bind(this), 0);
  }

  async zipFile() {
    // ensure that this queue is done before zipping
    console.log(`Waiting to Finish Decoding: ${this.decodeQueue.length}`);
    console.log(`Decoded Count: ${this.item_count}`);
    console.log(`Final Length: ${this.final_length}`);
    if (this.item_count === this.final_length) {
      console.log("Zipping");
      const result = await this.zipWriter.close();
      self.postMessage({ result: result });
      // reset the item count and final length
      this.item_count = 0;
      this.final_length = 0;

      // Zipping
      this.decodeQueue = [];
      this.zipFileWriter = new BlobWriter(this.imageType);
      this.zipWriter = new ZipWriter(this.zipFileWriter);
      this.isProcessing = false;
      return;
    } else {
      setTimeout(this.zipFile.bind(this), 0);
    }
  }

  public enqueueTask(offscreenCanvas: OffscreenCanvas, id: number): void {
    this.decodeQueue.push({ offscreenCanvas, id });
  }
}

self.onconnect = (e: any) => {
  const port = e.ports[0];
  console.log("RenderSharedWorker Started");
  const runner = new FrameProcessorWorker(port);

  let start = false;

  port.addEventListener("message", async (event: any) => {
    //const { type, offscreenCanvas, frame, totalFrames, zip } = event.data;
    console.log(event.data);

    //console.log(`${type}: ${frame} ${zip}`);

    if (start == false) {
      start = true;
      //runner.imageType = type;
      await runner.startZipProcessQueue();
    }

    // if (zip) {
    //   await runner.zipFile();
    //   return;
    // }

    // runner.enqueueTask(offscreenCanvas, frame);

    const workerResult = "Got Message for Startup";
    port.postMessage(workerResult);
  });

  port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
};
