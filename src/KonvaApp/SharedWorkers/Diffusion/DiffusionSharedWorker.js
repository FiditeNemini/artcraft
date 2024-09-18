var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";
import { MediaUploadApi, VideoApi } from "~/Classes/ApiManager";
import { Visibility } from "~/Classes/ApiManager/enums/Visibility";
import { v4 as uuidv4 } from "uuid";
import { JobsApi } from "~/Classes/ApiManager";
import { SharedWorkerBase, ResponseType, } from "~/KonvaApp/WorkerPrimitives/SharedWorkerBase";
import { JobStatus } from "~/Classes/ApiManager/enums/Job";
export class DiffusionSharedWorker extends SharedWorkerBase {
    constructor(port) {
        super(port);
        this.setup(this.workFunction.bind(this), this.progressFunction.bind(this));
        this.offscreenCanvas = undefined;
        this.bitmapContext = undefined;
        this.imageType = "image/jpeg";
        this.zipFileWriter = new BlobWriter(this.imageType);
        this.zipWriter = new ZipWriter(this.zipFileWriter);
        this.totalFrames = 0;
        this.videoAPI = new VideoApi();
        this.jobsAPI = new JobsApi();
        this.mediaAPI = new MediaUploadApi();
        this.blobs = [];
    }
    zipBlobs() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.blobs.length; i++) {
                const blob = this.blobs[i];
                const name = String(i).padStart(5, "0"); // '0009'
                yield this.zipWriter.add(`${name}.jpg`, new BlobReader(blob));
            }
            const zipBlob = yield this.zipWriter.close();
            return zipBlob;
        });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            this.zipFileWriter = new BlobWriter(this.imageType);
            this.zipWriter = new ZipWriter(this.zipFileWriter);
            this.totalFrames = 0;
            this.blobs = [];
        });
    }
    // Data here will be shipped off for progressive loading
    workFunction(isDoneStreaming, item, reportProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            // make request via api with options
            var _a;
            try {
                if (this.offscreenCanvas === undefined) {
                    this.offscreenCanvas = new OffscreenCanvas(item.width, item.height);
                    this.bitmapContext = this.offscreenCanvas.getContext("bitmaprenderer");
                }
                if (!this.bitmapContext) {
                    console.log("Failed to create bitmap context.");
                    throw Error("Bitmap Rendering Context Not Availible.");
                }
                this.bitmapContext.transferFromImageBitmap(item.imageBitmap);
                const blob = yield this.offscreenCanvas.convertToBlob({
                    quality: 1.0,
                    type: this.imageType,
                });
                this.blobs.push(blob);
                console.log("Length of blob");
                console.log(this.blobs.length);
                // progress
                const aproxSteps = item.totalFrames;
                const totalPercent = 100.0;
                const progressData = {
                    url: "",
                    status: JobStatus.PENDING,
                    progress: (item.frame / aproxSteps / 2 / totalPercent) * 100,
                };
                console.log("Lets report progress.");
                reportProgress(progressData); // once finished gives you up to 50%
                if (isDoneStreaming === false) {
                    return [undefined, false];
                }
                console.log("Prepare to Zip");
                const zipBlob = yield this.zipBlobs();
                console.log(zipBlob);
                console.log("Zipped");
                const response = yield this.mediaAPI.UploadStudioShot({
                    maybe_title: "",
                    uuid_idempotency_token: uuidv4(),
                    blob: zipBlob,
                    fileName: "media.zip",
                    maybe_visibility: Visibility.Public,
                });
                const mediaToken = response.data;
                if (!mediaToken) {
                    throw Error("Media Token Not Availible");
                }
                console.log(item.prompt);
                const studioResponse = yield this.videoAPI.EnqueueStudio({
                    enqueueVideo: {
                        disable_lcm: false,
                        enable_lipsync: item.prompt.lipSync,
                        input_file: mediaToken, // Replace with actual media token
                        negative_prompt: item.prompt.negativePrompt,
                        prompt: item.prompt.positivePrompt,
                        remove_watermark: false,
                        style: item.prompt.artstyle, // Map to the appropriate art style
                        frame_skip: 2,
                        travel_prompt: "",
                        trim_end_millis: 7000,
                        trim_start_millis: 0,
                        use_cinematic: item.prompt.cinematic,
                        use_face_detailer: item.prompt.faceDetail,
                        use_strength: item.prompt.styleStrength,
                        use_upscaler: item.prompt.upscale,
                        uuid_idempotency_token: uuidv4(),
                        global_ipa_media_token: "",
                        input_depth_file: "",
                        input_normal_file: "",
                        input_outline_file: "",
                        creator_set_visibility: Visibility.Public,
                    },
                });
                let resultURL = undefined;
                if (studioResponse.success && ((_a = studioResponse.data) === null || _a === void 0 ? void 0 : _a.inference_job_token)) {
                    console.log("Start Streaming Result");
                    if (!studioResponse.data.inference_job_token) {
                        throw Error("No Job Token Returned Try Again");
                    }
                    const jobToken = studioResponse.data.inference_job_token;
                    // if error send it back through the pipe
                    let jobIsProcessing = true;
                    while (jobIsProcessing) {
                        const job = yield this.jobsAPI.GetJobByToken({ token: jobToken });
                        console.log(job);
                        if (!job.data) {
                            throw Error("Job Data Not Found");
                        }
                        const status = job.data.status.status;
                        const progress = job.data.status.progress_percentage;
                        let computedProgress = 50;
                        if (progress === 0) {
                            computedProgress = 50;
                        }
                        computedProgress = 50 + progress / 2;
                        let renderProgressData = {
                            url: "",
                            status: JobStatus.DEAD,
                            progress: computedProgress / totalPercent,
                        };
                        renderProgressData.status = status;
                        switch (status) {
                            case JobStatus.PENDING:
                                reportProgress(renderProgressData); // once finished gives you up to 50%
                                break;
                            case JobStatus.STARTED:
                                reportProgress(renderProgressData);
                                break;
                            case JobStatus.ATTEMPT_FAILED:
                                reportProgress(renderProgressData);
                                break;
                            case JobStatus.COMPLETE_SUCCESS:
                                renderProgressData.progress = 100;
                                jobIsProcessing = false;
                                if (!job.data.maybe_result.maybe_public_bucket_media_path) {
                                    throw Error("Server Failed To Return Result");
                                }
                                resultURL = job.data.maybe_result.maybe_public_bucket_media_path;
                                reportProgress(renderProgressData);
                                break;
                            case JobStatus.COMPLETE_FAILURE:
                                jobIsProcessing = false;
                                renderProgressData.progress = 0;
                                reportProgress(renderProgressData);
                                break;
                            case JobStatus.DEAD:
                                jobIsProcessing = false;
                                reportProgress(renderProgressData);
                                throw Error("Server Failed to Process Please Try Again.");
                                break;
                            case JobStatus.CANCCELLED_BY_SYSTEM:
                                jobIsProcessing = false;
                                reportProgress(renderProgressData);
                                break;
                            case JobStatus.CANCELLED_BY_USER:
                                jobIsProcessing = false;
                                reportProgress(renderProgressData);
                                break;
                        }
                        yield this.sleep(500);
                    } // end while loop
                }
                if (!resultURL) {
                    throw Error("Media URL Result Missing");
                }
                const responseData = {
                    videoUrl: resultURL,
                };
                yield this.reset();
                return [responseData, true];
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    sleep(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, ms));
        });
    }
    progressFunction(progress) {
        console.log(`Progress Function  JobID:${progress.jobID} Data:${progress.data}`);
        // send out to node as a worker response
        this.send({
            jobID: progress.jobID,
            responseType: ResponseType.progress,
            data: progress.data,
        });
    }
    reportResult(result) {
        return __awaiter(this, void 0, void 0, function* () {
            this.send({
                jobID: result.jobID,
                responseType: ResponseType.result,
                data: result.data,
            });
        });
    }
    errorFunction(error) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.send({
                jobID: error.jobID,
                responseType: ResponseType.error,
                data: (_a = error.data) === null || _a === void 0 ? void 0 : _a.toString(),
            });
        });
    }
    receive(request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Received Request");
            console.log(request);
            this.submitWork({
                jobID: request.jobID,
                data: request.data,
                isDoneStreaming: request.isDoneStreaming,
            });
        });
    }
}
// This is a copy paste to create a worker now.
self.onconnect = (e) => {
    const port = e.ports[0];
    console.log("DiffusionSharedWorker Started");
    let worker = undefined;
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
