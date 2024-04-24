
export enum FrontendInferenceJobType {
  FaceAnimation,
  TextToSpeech,
  VoiceConversion,
  VoiceDesignerCreateVoice,
  VoiceDesignerTts,
  ImageGeneration,
  VideoMotionCapture,
  ConvertFbxtoGltf,
  EngineComposition,
  VideoWorkflow,
  VideoStyleTransfer,
}
export interface InferenceJob {
  version: number;
  job_id: string;
  job_type: FrontendInferenceJobType;
  job_status: string;
  result?: any;
}
