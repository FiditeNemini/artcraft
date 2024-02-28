type CNPreset = 
  'custom'|
  'closeup'|
  'default' |
  'halfbody'|
  'fullbody'|
  'landscape'|
  'typog';

const defaultPreset = {
  cnCanny: 0,
  cnDepth: 0,
  cnLineArtAnime: 0.7,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 1,
  cnPipeFace: 0,
  cnSparseScribble: 0,
  cnSoftEdge: 1,
  cnRegularSteps: 20,
}

const closeupPreset = {
  cnCanny: 0,
  cnDepth: 0,
  cnLineArtAnime: 0.7,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 0,
  cnPipeFace: 0,
  cnSparseScribble: 0.7,
  cnSoftEdge: 0.7,
  cnRegularSteps: 20,
}
const halfbodyPreset = {
  cnCanny: 0,
  cnDepth: 0,
  cnLineArtAnime: 0.7,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 0.5,
  cnPipeFace: 0,
  cnSparseScribble: 0.7,
  cnSoftEdge: 0.7,
  cnRegularSteps: 20,
}
const fullbodyPreset = {
  cnCanny: 0,
  cnDepth: 0,
  cnLineArtAnime: 0.7,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 1,
  cnPipeFace: 0,
  cnSparseScribble: 0.7,
  cnSoftEdge: 0.7,
  cnRegularSteps: 20,
}
const landscapePreset = {
  cnCanny: 0.7,
  cnDepth: 0.7,
  cnLineArtAnime: 0.7,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 0,
  cnPipeFace: 0,
  cnSparseScribble: 0.7,
  cnSoftEdge: 0.7,
  cnRegularSteps: 20,
}

const typogPreset = {
  cnCanny: 0,
  cnDepth: 0,
  cnLineArtAnime: 0.7,
  cnLineArtRealistic: 0,
  cnLipsStrength: 0,
  cnOpenPose: 0,
  cnPipeFace: 0,
  cnSparseScribble: 0,
  cnSoftEdge: 0.7,
  cnRegularSteps: 20,
}

export type {
  CNPreset
}
export {
  defaultPreset,
  closeupPreset,
  halfbodyPreset,
  fullbodyPreset,
  landscapePreset,
  typogPreset,
};