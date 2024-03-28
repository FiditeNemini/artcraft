import { useCallback, useEffect, useRef, useState } from "react";
import { 
  Button,
  ButtonLink,
  H4, 
  LoadingBar,
  LoadingDotsTyping,
  LoadingDotsBricks,
} from "~/components";


export default function ComponentLibrary () {
  const [progress, setProgress] = useState(0);
  const loopRef = useRef<NodeJS.Timeout | null>(null);

  const pushProgressBar: ()=>void = useCallback(()=>{
    loopRef.current = setInterval(function timer(){
      setProgress((curr)=>{
        if (curr < 100){
          return curr+10;
        }else{
          if(loopRef.current)
            clearInterval(loopRef.current);
          return curr;
        }
      })}
    , 3000);
  }, []);
  useEffect(()=>{
    pushProgressBar();
    return ()=>{
      if(loopRef.current)
        clearInterval(loopRef.current)
    }
  },[progress]);

  return(
    <div className='bg-ui-panel w-10/12 max-w-7xl h-full min-h-96 mx-auto my-6 rounded-lg p-6'>

      <div className="flex flex-col gap-2 mb-4">
        <H4>Buttons</H4>
        <div className="flex gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button className="bg-brand-tertiary hover:bg-brand-teriary-400 focus-visible:outline-brand-tertiary">
            Prelim Tertiary
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <H4>ButtonLink</H4>
        <ButtonLink to="/">Back to /</ButtonLink>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <H4>Loading Dots</H4>
        <div className="flex gap-2">
          <div className="w-60 h-40 rounded-lg overflow-hidden">
            <LoadingDotsTyping />
          </div>
          <div className="w-60 h-40 rounded-lg overflow-hidden">
            <LoadingDotsBricks />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <H4>Loading Bar</H4>
        <div className="flex gap-2 items-center">
          <LoadingBar
            progress={progress}
            isShowing={progress !== 100}
            wrapperClassName="rounded-lg"
            message="this takes progress from parent"
          />
          <Button
            className="h-fit"
            onClick={()=>setProgress(0)}
          >
            Reset
          </Button>
        </div>
        <LoadingBar
          label="labeling the bar"
          message="displaying a message"
        />
        <LoadingBar
          label="useFakeTimer = 30000 (30secs)"
          useFakeTimer={30000}
        />
        <LoadingBar
          label="useFakeTimer = 3000 (3secs)"
          useFakeTimer={3000}
        />
      </div>
    </div>
  );
};