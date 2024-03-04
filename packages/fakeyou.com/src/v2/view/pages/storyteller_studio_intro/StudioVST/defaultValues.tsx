import { defaultPreset as defaultCN } from "./cnPresets";

export { initialValues, hiddenValues };
const initialValues = {
  //files Settings
  fileToken: "",
  outputPath: "vid2vid/SparseUpscaleInterp_00001.mp4",

  //video Settings
  width: 1024,
  height: 1024,
  maxDuration: 0,
  trimStart: 0,
  trimEnd: 3,

  //Presents
  workflowConfig: "weight_0a04e66y14t4e2bwxjfyg1mb2", //weight_99tz2nzbp5x9v55gqn5ekj1sd
  sdModelToken: "weight_yqexh77ntqyawzgh9fzash798",
  loraModelToken: "",
  loraModelStrength: 0,

  //basics
  inputFps: 24,
  posPrompt: "",
  negPrompt: "",
  visibility: "private",

  //Control Net
  ...defaultCN,
};

const hiddenValues = {
  posPrompt: "",
  negPrompt:
    "flare, lens flare, glare,naked, nsfw, text, logo, watermark:1.3, letterboxed,embedding:easynegative,  embedding:badhandv4,(worst quality, low quality:1.4), lowres, blurry, monochrome, ",
};
