//For integration into other components 
export type QuickTrimData = {
  trimStartSeconds: number;
  trimEndSeconds: number;
}

export function roundTo2Dec(floaty:number){
  return Math.round(floaty*100)/100;
}
export function fractionToPercentage(fraction:number){
  return roundTo2Dec(fraction * 100);
}
export function formatSecondsToHHMMSSCS(seconds:number){
  //example of the ISO String: 1970-01-01T00:01:40.774Z
  const isoString = new Date(seconds * 1000).toISOString();
  if(seconds > 3600)
    return isoString.substring(11, 19) + "." + isoString.substring(20, 22)
  else
    return isoString.substring(14, 19) + "." + isoString.substring(20, 22);
}

export const TRIM_OPTIONS:{[key: string]: number } = {
  "3s": 3,
  "5s": 5,
  "10s":10,
  "15s":15
};