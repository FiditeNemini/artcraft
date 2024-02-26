type VSTPreset = 
  'custom'|
  'closeup'|
  'halfbody'|
  'fullbody'|
  'landscape'|
  'typog';

const defaultPreset = {
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
}
const closeupPreset = {
  cnCanny: 0,
  cnDepth: 0,
  cnLineArtAnime: 1,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 0,
  cnPipeFace: 0,
  cnSparseScribble: 1,
  cnSoftEdge: 1,
  cnRegularSteps: 30,
}
const halfbodyPreset = {
  cnCanny: 0,
  cnDepth: 0,
  cnLineArtAnime: 1,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 1,
  cnPipeFace: 0,
  cnSparseScribble: 1,
  cnSoftEdge: 1,
  cnRegularSteps: 30,
}
const fullbodyPreset = {
  cnCanny: 1,
  cnDepth: 0,
  cnLineArtAnime: 1,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 1,
  cnPipeFace: 0,
  cnSparseScribble: 1,
  cnSoftEdge: 1,
  cnRegularSteps: 30,
}
const landscapePreset = {
  cnCanny: 1,
  cnDepth: 1,
  cnLineArtAnime: 1,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 0,
  cnPipeFace: 0,
  cnSparseScribble: 1,
  cnSoftEdge: 1,
  cnRegularSteps: 30,
}

const typogPreset = {
  cnCanny: 0,
  cnDepth: 0,
  cnLineArtAnime: 1,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 0,
  cnPipeFace: 0,
  cnSparseScribble: 0,
  cnSoftEdge: 1,
  cnRegularSteps: 30,
}

export type {
  VSTPreset
}
export {
  defaultPreset,
  closeupPreset,
  halfbodyPreset,
  fullbodyPreset,
  landscapePreset,
  typogPreset,
};