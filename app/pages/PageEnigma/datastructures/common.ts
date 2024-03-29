export type XYZ = {
  x :number;
  y: number;
  z: number;
}

export type Simple3DVector = {
  position: XYZ;
  rotation: XYZ;
  scalar: XYZ;
}