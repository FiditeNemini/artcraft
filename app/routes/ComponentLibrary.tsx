import { useState, useEffect } from "react";
import { 
  Button,
  ButtonLink,
  H4, 
  LoadingBar
} from "~/components";


export default function ComponentLibrary () {
  const [progress, setProgress] = useState(0);
  useEffect(()=>{
    if(progress === 0){
      const loop = setInterval(function timer(){
        setProgress((curr)=>{
          if (curr < 100){
            return curr+10;
          }else{
            clearTimeout(loop);
            return curr;
          }
        })}
      , 3000);
    }
  }, [progress]);

  return(
    <div className='bg-ui-panel w-10/12 max-w-7xl h-full min-h-96 mx-auto my-6 rounded-lg p-6'>

      <div className="flex flex-col gap-2 mb-4">
        <H4>Buttons</H4>
        <div className="flex gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <H4>ButtonLink</H4>
        <ButtonLink to="/">Back to /</ButtonLink>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <H4>Loading Bar</H4>
        <div className="flex gap-2">
          <LoadingBar progress={progress} wrapperClassName="rounded-lg"/>
          <Button onClick={()=>setProgress(0)}>Reset</Button>
        </div>
        <LoadingBar
          label="labeling the bar"
          message="displaying a message"
          pulsing
        />
      </div>
    </div>
  );
};