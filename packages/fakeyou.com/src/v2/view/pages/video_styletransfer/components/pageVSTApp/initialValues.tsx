const initialValues = {
  //config
  outputPath: "vid2vid/SparseUpscaleInterp_00001.mp4",
  workflowConfig: "weight_q8sz47gmfw2zx02snrbz88ns9",
  
  //video Settings
  width: 544,
  height: 544,
  maxFrames: 17,
  framesCap: 16,
  skipFrames: 0,
  everyNthFrame: 2,
  inputFps: 24,
  interpolationMultiplier: 2,

  //basics
  seed: "",
  sdModelToken: "",
  loraModelToken: "",
  posPrompt: "",
  negPrompt: "",

  //advance
  firstPass: 1,
  upscalePass: 0.42,
  motionScale:1,
  upscaleMultiplier: 1.5,
  useEmptyLatent: false,
  useFaceDetailer: false,
  denoiseFaceDetailer: 0.45,
  useLCM: false,
  lcmCFG: 2,
  lcmSteps: 8,

  //Control Net
  cnCanny: 0,
  cnDepth: 0,
  cnLinearAnime: 0,
  cnLinearRealistic: 0,
  cnOpenPose: 0,
  cnPipeFace: 0,
  cnSparse: 0.7,
  cnTile: 0,
};
export default initialValues;