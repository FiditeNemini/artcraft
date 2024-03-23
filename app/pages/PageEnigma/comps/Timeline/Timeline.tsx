import { LowerPanel } from "~/modules/LowerPanel";

export const Timeline = ()=>{
  return(
    <LowerPanel>
      <div className='h-10 w-full border-b border-ui-panel-border'></div>
      <input style={{ display: 'none' }} type="file" id="load-upload" name="load-upload"></input>
    </LowerPanel>
  )
}