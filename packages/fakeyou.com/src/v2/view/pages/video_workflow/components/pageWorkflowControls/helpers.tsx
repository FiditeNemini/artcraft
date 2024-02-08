export function isInputValid(keyValues: {[key:string]:number|string|boolean|undefined}){
  return (
    keyValues.sdModelToken 
    && keyValues.sdModelToken !== ""
    && keyValues.posPrompt
    && keyValues.posPrompt !== ""
  );
}