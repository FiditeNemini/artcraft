export {initialValues, hiddenValues};
const initialValues = {
  //files Settings
  fileToken: "",
  outputPath: "",

  //video Settings
  width: 544,
  height: 544,
  maxFrames: 17,
  framesCap: 16,
  skipFrames: 0,

  //Presents
  // workflowConfig: "weight_f5qh4s1dtp266yv313p09tkpa",
  workflowConfig: "weight_f5qh4s1dtp266yv313p09tkpa",
  sdModelToken: "weight_83xpresyjswy97ppk0fyct146",
  loraModelToken: "weight_13yfxfafv195ejwh3meesebdk",
  loraModelStrength: 1,

  //basics
  inputFps: 24,
  posPrompt: "",
  negPrompt: "",
  visibility: "private",

  //Control Net
  cnCanny: 0.7,
  cnDepth: 0.7,
  cnLineArtAnime: 0.7,
  cnLineArtRealistic: 0.7,
  cnLipsStrength: 0,
  cnOpenPose: 0.7,
  cnPipeFace: 0.7,
  cnSparseScribble: 0.7,
  cnSoftEdge: 0.7,
  cnRegularSteps: 30,
};

const hiddenValues = {
  posPrompt: "(masterpiece,detailed,highres:1.4), ",
  negPrompt: "flare, lens flare, glare, naked, nsfw, text, logo, Shutterstock, watermark:1.3, embedding:easynegative, embedding:badhandv4,(worst quality, low quality:1.4), lowres, blurry, monochrome, ",
}
