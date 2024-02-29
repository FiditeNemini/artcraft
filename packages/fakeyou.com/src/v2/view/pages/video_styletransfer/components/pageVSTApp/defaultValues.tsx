import { defaultPreset as defaultCN } from "./cnPresets";
export {initialValues, hiddenValues};
const initialValues = {
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
  workflowConfig: "weight_n1zc1cyjdc3m10139ab0vjm44",
  sdModelToken: "weight_yqexh77ntqyawzgh9fzash798",
  loraModelToken: "",
  loraModelStrength: 0,

  //basics
  inputFps: 24,
  posPrompt: "perfect anime illustration,(best-quality:0.8),",
  negPrompt: "",
  visibility: "private",

  //Control Net
  ...defaultCN
};

const hiddenValues = {
  posPrompt: "",
  negPrompt: "flare, lens flare, glare,naked, nsfw, text, logo, watermark:1.3, letterboxed,embedding:easynegative,  embedding:badhandv4,(worst quality, low quality:1.4), lowres, blurry, monochrome, ",
}
