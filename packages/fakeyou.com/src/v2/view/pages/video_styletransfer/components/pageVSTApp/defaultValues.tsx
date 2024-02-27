import { defaultPreset as defaultCN } from "./cnPresets";
export {initialValues, hiddenValues};
const initialValues = {
  //files Settings
  fileToken: "",
  outputPath: "vid2vid/SparseUpscaleInterp_00001.mp4",

  //video Settings
  width: 1024,
  height: 1024,
  maxDuration: 2,
  trimStart: 0,
  trimEnd: 5,

  //Presents
  workflowConfig: "weight_99tz2nzbp5x9v55gqn5ekj1sd",
  sdModelToken: "weight_p5x93dw8ec24zf9hz1zezsata",
  loraModelToken: "weight_13yfxfafv195ejwh3meesebdk",
  loraModelStrength: 1,

  //basics
  inputFps: 24,
  posPrompt: "",
  negPrompt: "",
  visibility: "private",

  //Control Net
  ...defaultCN
};

const hiddenValues = {
  posPrompt: "(masterpiece,detailed,highres:1.4), ",
  negPrompt: "flare, lens flare, glare, naked, nsfw, text, logo, Shutterstock, watermark:1.3, embedding:easynegative, embedding:badhandv4,(worst quality, low quality:1.4), lowres, blurry, monochrome, ",
}
