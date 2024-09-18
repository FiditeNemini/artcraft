"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffusionSharedWorker = void 0;
var zip_js_1 = require("@zip.js/zip.js");
var ApiManager_1 = require("~/Classes/ApiManager");
var Visibility_1 = require("~/Classes/ApiManager/enums/Visibility");
var uuid_1 = require("uuid");
var ApiManager_2 = require("~/Classes/ApiManager");
var SharedWorkerBase_1 = require("~/KonvaApp/WorkerPrimitives/SharedWorkerBase");
var Job_1 = require("~/Classes/ApiManager/enums/Job");
var DiffusionSharedWorker = /** @class */ (function (_super) {
    __extends(DiffusionSharedWorker, _super);
    function DiffusionSharedWorker(port) {
        var _this = _super.call(this, port) || this;
        _this.setup(_this.workFunction.bind(_this), _this.progressFunction.bind(_this));
        _this.offscreenCanvas = undefined;
        _this.bitmapContext = undefined;
        _this.imageType = "image/jpeg";
        _this.zipFileWriter = new zip_js_1.BlobWriter(_this.imageType);
        _this.zipWriter = new zip_js_1.ZipWriter(_this.zipFileWriter);
        _this.totalFrames = 0;
        _this.videoAPI = new ApiManager_1.VideoApi();
        _this.jobsAPI = new ApiManager_2.JobsApi();
        _this.mediaAPI = new ApiManager_1.MediaUploadApi();
        _this.blobs = [];
        return _this;
    }
    DiffusionSharedWorker.prototype.zipBlobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, blob, name_1, zipBlob;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.blobs.length)) return [3 /*break*/, 4];
                        blob = this.blobs[i];
                        name_1 = String(i).padStart(5, "0");
                        return [4 /*yield*/, this.zipWriter.add("".concat(name_1, ".jpg"), new zip_js_1.BlobReader(blob))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.zipWriter.close()];
                    case 5:
                        zipBlob = _a.sent();
                        return [2 /*return*/, zipBlob];
                }
            });
        });
    };
    DiffusionSharedWorker.prototype.reset = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.zipFileWriter = new zip_js_1.BlobWriter(this.imageType);
                this.zipWriter = new zip_js_1.ZipWriter(this.zipFileWriter);
                this.totalFrames = 0;
                this.blobs = [];
                return [2 /*return*/];
            });
        });
    };
    // Data here will be shipped off for progressive loading
    DiffusionSharedWorker.prototype.workFunction = function (isDoneStreaming, item, reportProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var blob, aproxSteps, totalPercent, progressData, zipBlob, response, mediaToken, studioResponse, resultURL, jobToken, jobIsProcessing, job, status_1, progress, computedProgress, renderProgressData, responseData, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        if (this.offscreenCanvas === undefined) {
                            this.offscreenCanvas = new OffscreenCanvas(item.width, item.height);
                            this.bitmapContext = this.offscreenCanvas.getContext("bitmaprenderer");
                        }
                        if (!this.bitmapContext) {
                            console.log("Failed to create bitmap context.");
                            throw Error("Bitmap Rendering Context Not Availible.");
                        }
                        this.bitmapContext.transferFromImageBitmap(item.imageBitmap);
                        return [4 /*yield*/, this.offscreenCanvas.convertToBlob({
                                quality: 1.0,
                                type: this.imageType,
                            })];
                    case 1:
                        blob = _b.sent();
                        this.blobs.push(blob);
                        console.log("Length of blob");
                        console.log(this.blobs.length);
                        aproxSteps = item.totalFrames;
                        totalPercent = 100.0;
                        progressData = {
                            url: "",
                            status: Job_1.JobStatus.PENDING,
                            progress: (item.frame / aproxSteps / 2 / totalPercent) * 100,
                        };
                        console.log("Lets report progress.");
                        reportProgress(progressData); // once finished gives you up to 50%
                        if (isDoneStreaming === false) {
                            return [2 /*return*/, [undefined, false]];
                        }
                        console.log("Prepare to Zip");
                        return [4 /*yield*/, this.zipBlobs()];
                    case 2:
                        zipBlob = _b.sent();
                        console.log(zipBlob);
                        console.log("Zipped");
                        return [4 /*yield*/, this.mediaAPI.UploadStudioShot({
                                maybe_title: "",
                                uuid_idempotency_token: (0, uuid_1.v4)(),
                                blob: zipBlob,
                                fileName: "media.zip",
                                maybe_visibility: Visibility_1.Visibility.Public,
                            })];
                    case 3:
                        response = _b.sent();
                        mediaToken = response.data;
                        if (!mediaToken) {
                            throw Error("Media Token Not Availible");
                        }
                        console.log(item.prompt);
                        return [4 /*yield*/, this.videoAPI.EnqueueStudio({
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
                                    uuid_idempotency_token: (0, uuid_1.v4)(),
                                    global_ipa_media_token: "",
                                    input_depth_file: "",
                                    input_normal_file: "",
                                    input_outline_file: "",
                                    creator_set_visibility: Visibility_1.Visibility.Public,
                                },
                            })];
                    case 4:
                        studioResponse = _b.sent();
                        resultURL = undefined;
                        if (!(studioResponse.success && ((_a = studioResponse.data) === null || _a === void 0 ? void 0 : _a.inference_job_token))) return [3 /*break*/, 8];
                        console.log("Start Streaming Result");
                        if (!studioResponse.data.inference_job_token) {
                            throw Error("No Job Token Returned Try Again");
                        }
                        jobToken = studioResponse.data.inference_job_token;
                        jobIsProcessing = true;
                        _b.label = 5;
                    case 5:
                        if (!jobIsProcessing) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.jobsAPI.GetJobByToken({ token: jobToken })];
                    case 6:
                        job = _b.sent();
                        console.log(job);
                        if (!job.data) {
                            throw Error("Job Data Not Found");
                        }
                        status_1 = job.data.status.status;
                        progress = job.data.status.progress_percentage;
                        computedProgress = 50;
                        if (progress === 0) {
                            computedProgress = 50;
                        }
                        computedProgress = 50 + progress / 2;
                        renderProgressData = {
                            url: "",
                            status: Job_1.JobStatus.DEAD,
                            progress: computedProgress / totalPercent,
                        };
                        renderProgressData.status = status_1;
                        switch (status_1) {
                            case Job_1.JobStatus.PENDING:
                                reportProgress(renderProgressData); // once finished gives you up to 50%
                                break;
                            case Job_1.JobStatus.STARTED:
                                reportProgress(renderProgressData);
                                break;
                            case Job_1.JobStatus.ATTEMPT_FAILED:
                                reportProgress(renderProgressData);
                                break;
                            case Job_1.JobStatus.COMPLETE_SUCCESS:
                                renderProgressData.progress = 100;
                                jobIsProcessing = false;
                                if (!job.data.maybe_result.maybe_public_bucket_media_path) {
                                    throw Error("Server Failed To Return Result");
                                }
                                resultURL = job.data.maybe_result.maybe_public_bucket_media_path;
                                reportProgress(renderProgressData);
                                break;
                            case Job_1.JobStatus.COMPLETE_FAILURE:
                                jobIsProcessing = false;
                                renderProgressData.progress = 0;
                                reportProgress(renderProgressData);
                                break;
                            case Job_1.JobStatus.DEAD:
                                jobIsProcessing = false;
                                reportProgress(renderProgressData);
                                throw Error("Server Failed to Process Please Try Again.");
                                break;
                            case Job_1.JobStatus.CANCCELLED_BY_SYSTEM:
                                jobIsProcessing = false;
                                reportProgress(renderProgressData);
                                break;
                            case Job_1.JobStatus.CANCELLED_BY_USER:
                                jobIsProcessing = false;
                                reportProgress(renderProgressData);
                                break;
                        }
                        return [4 /*yield*/, this.sleep(500)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 8:
                        if (!resultURL) {
                            throw Error("Media URL Result Missing");
                        }
                        responseData = {
                            videoUrl: resultURL,
                        };
                        return [4 /*yield*/, this.reset()];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, [responseData, true]];
                    case 10:
                        error_1 = _b.sent();
                        console.log(error_1);
                        throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    DiffusionSharedWorker.prototype.sleep = function (ms) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
            });
        });
    };
    DiffusionSharedWorker.prototype.progressFunction = function (progress) {
        console.log("Progress Function  JobID:".concat(progress.jobID, " Data:").concat(progress.data));
        // send out to node as a worker response
        this.send({
            jobID: progress.jobID,
            responseType: SharedWorkerBase_1.ResponseType.progress,
            data: progress.data,
        });
    };
    DiffusionSharedWorker.prototype.reportResult = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.send({
                    jobID: result.jobID,
                    responseType: SharedWorkerBase_1.ResponseType.result,
                    data: result.data,
                });
                return [2 /*return*/];
            });
        });
    };
    DiffusionSharedWorker.prototype.errorFunction = function (error) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                this.send({
                    jobID: error.jobID,
                    responseType: SharedWorkerBase_1.ResponseType.error,
                    data: (_a = error.data) === null || _a === void 0 ? void 0 : _a.toString(),
                });
                return [2 /*return*/];
            });
        });
    };
    DiffusionSharedWorker.prototype.receive = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Received Request");
                console.log(request);
                this.submitWork({
                    jobID: request.jobID,
                    data: request.data,
                    isDoneStreaming: request.isDoneStreaming,
                });
                return [2 /*return*/];
            });
        });
    };
    return DiffusionSharedWorker;
}(SharedWorkerBase_1.SharedWorkerBase));
exports.DiffusionSharedWorker = DiffusionSharedWorker;
// This is a copy paste to create a worker now.
self.onconnect = function (e) {
    var port = e.ports[0];
    console.log("DiffusionSharedWorker Started");
    var worker = undefined;
    var started = false;
    if (started === false) {
        started = true;
        worker = new DiffusionSharedWorker(port);
        worker.start();
    }
    // Response For Start.
    var workerResult = "DiffusionSharedWorker Started";
    port.postMessage(workerResult);
    port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
};
