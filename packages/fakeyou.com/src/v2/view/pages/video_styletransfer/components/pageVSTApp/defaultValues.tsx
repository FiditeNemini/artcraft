export {initialValues, hiddenValues};
const initialValues = {
  //config
  outputPath: "",
  workflowConfig: "weight_f5qh4s1dtp266yv313p09tkpa",
  
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
  sdModelToken: "weight_83xpresyjswy97ppk0fyct146",
  loraModelToken: "",
  posPrompt: "",
  negPrompt: "",

  //advance
  firstPass: 0,
  upscalePass: 0,
  motionScale:0,
  upscaleMultiplier: 0,
  useEmptyLatent: false,
  useFaceDetailer: false,
  denoiseFaceDetailer: 0,
  useLCM: false,
  lcmCFG: 0,
  lcmSteps: 0,

  //Control Net
  cnCanny: 0.7,
  cnDepth: 0.7,
  cnLinearAnime: 0.7,
  cnLinearRealistic: 0.7,
  cnOpenPose: 0.7,
  cnPipeFace: 0.7,
  cnSparse: 0.7,
  cnTile: 0.7,
};
const hiddenValues = {
  posPrompt: "(masterpiece,detailed,highres:1.4), ",
  negPrompt: "flare, lens flare, glare, naked, nsfw, text, logo, Shutterstock, watermark:1.3, embedding:easynegative, embedding:badhandv4,(worst quality, low quality:1.4), lowres, blurry, monochrome, ",
}
