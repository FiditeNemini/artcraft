import { useState } from "react";
import {
  H1, H4, H6, P,
  Button,
  ButtonLink,
  ListDropdown,
  ListSearchDropdown,
  // LoadingBar,
  LoadingDotsTyping,
  LoadingDotsBricks,
} from "~/components";


export function SectionComponents () {

  const [valueListDropdown, setValueListDropdown] = useState<string|undefined>(undefined);
  const [valueListSearchDropdown, setValueListSearchDropdown] = useState<string|undefined>(undefined);

  const testdata = [
    { name: 'Wade Cooper' },
    { name: 'Arlene Mccoy' },
    { name: 'Devon Webb' },
    { name: 'Tom Cook' },
    { name: 'Tanya Fox' },
    { name: 'Hellen Schmidt' },
  ]

  // Progress Bar Usage States, Variables and Functions
  // const [progress, setProgress] = useState(0);
  // const loopRef = useRef<NodeJS.Timeout | null>(null);
  // const pushProgressBar: ()=>void = useCallback(()=>{
  //   loopRef.current = setInterval(function timer(){
  //     setProgress((curr)=>{
  //       if (curr < 100){
  //         return curr+10;
  //       }else{
  //         if(loopRef.current)
  //           clearInterval(loopRef.current);
  //         return curr;
  //       }
  //     })}
  //   , 3000);
  // }, []);
  // useEffect(()=>{
  //   pushProgressBar();
  //   return ()=>{
  //     if(loopRef.current)
  //       clearInterval(loopRef.current)
  //   }
  // },[progress]);

  return(
    <div className="flex flex-col gap-2 mb-4">
      <H1>Components</H1>
      <H4>Buttons</H4>
      <div className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button className="bg-brand-tertiary hover:bg-brand-teriary-400 focus-visible:outline-brand-tertiary">
          Prelim Tertiary
        </Button>
        <Button disabled>Disabled</Button>
      </div>

    <div className="flex flex-col gap-2 mb-4">
      <H4>ButtonLink</H4>
      <ButtonLink to="/">Back to /</ButtonLink>
    </div>

    <div className="flex flex-col gap-2 mb-4 max-w-2xl">
      <H4>List Dropdowns</H4>
      <ListDropdown
        list={testdata}
        onSelect={(val)=>setValueListDropdown(val)}
      />
      <P>Selected Item: <b>{valueListDropdown}</b></P>
      <ListSearchDropdown
        list={testdata}
        onSelect={(val)=>setValueListSearchDropdown(val)}
      />
      <P>Selected Item: <b>{valueListSearchDropdown}</b></P>
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

    <div className="flex flex-col gap-2 mb-4  max-w-2xl">
      <H4>Loading Bar</H4>
      <H6>Loading Bar is currently Broken and not reusable</H6>
      {/* <div className="flex gap-2 items-center">
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
      />*/}
    </div> 
  </div>
  );
};