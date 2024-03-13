// import { defaultPreset as defaultCN } from "./dataCnPresets";
import styleModels from "./dataStyleModels";
import { VSTType } from "./helpers";
export {initialValues, hiddenValues};

const initialValues: VSTType = {
  //files Settings
  fileToken: "",
  outputPath: "vid2vid/SparseUpscaleInterp_00001.mp4",

  //video Settings
  width: 1024,
  height: 1024,
  maxDuration: 0,
  trimStart: 0,
  trimEnd: 0,

  //Presents
  workflowConfig: "weight_0a04e66y14t4e2bwxjfyg1mb2",
  sdModelToken: styleModels[0].weight_token,
  sdModelTitle: styleModels[0].title,
  // loraModelToken: "",
  // loraModelStrength: 0,

  //basics
  inputFps: 24,
  ...styleModels[0].defaultPrompts,
  // positivePrompt:"",
  // negativePrompt:"",
  // positivePromptHidden:"",
  // negativePromptHidden:"",
  visibility: "private",

  //Control Net
  ...styleModels[0].defaultCN,
  // cnCanny: 0,
  // cnDepth: 0,
  // cnLineArtAnime: 0,
  // cnLineArtRealistic: 0,
  // cnLipsStrength: 0,
  // cnOpenPose: 0,
  // cnPipeFace: 0,
  // cnSparseScribble: 0,
  // cnSoftEdge: 0,
  // cnRegularSteps: 0,

  defaultCN:styleModels[0].defaultCN,
  defaultPrompts:styleModels[0].defaultPrompts,
};

const hiddenValues = {
  posPrompt: "",
  negPrompt: "flare, lens flare, glare,naked, nsfw, text, logo, watermark:1.3, letterboxed,embedding:easynegative,  embedding:badhandv4,(worst quality, low quality:1.4), lowres, blurry, monochrome, ",
}
