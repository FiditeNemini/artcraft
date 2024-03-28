import { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';


interface LoadingBarProps{
  label?: string;
  progress?: number;
  isShowing?: boolean;
  variant?: string;
  message?: string;
  wrapperClassName?: string;
  useFakeTimer?: number; 
}
export const LoadingBar = ({
  label,
  progress: propsProgress = 0,
  isShowing = true,
  variant = 'primary',
  message,
  wrapperClassName : propsWrapperClassName,
  useFakeTimer
}: LoadingBarProps) => {
  const [progress, setProgress] = useState<number>(propsProgress);

  // this takes the real progress coming from parent
  useEffect(()=>{
    setProgress(propsProgress);
  }, [propsProgress]);

  // this sets a fake progress, it goes to 96%
  // in the amount of miliseconds provided by the flag
  useEffect(()=>{
    let loop: NodeJS.Timeout;
    if(useFakeTimer){
      if(useFakeTimer >= 30000){
        // this math produce 96 cuts so the progress bar updates more
        loop = setInterval(function step(){
          setProgress((curr)=>{
            if(curr<96){
              return curr + 3
            }else{
              clearInterval(loop);
              return curr;
            }
          })
        },Math.round(useFakeTimer/96)*3);
      }else{
        // this math produce less cuts if useFakeTimer predicts
        // a shorter load time, shorter thatn 30s
        const progressPerInterval = useFakeTimer/500
        loop = loop = setInterval(function step(){
          setProgress((curr)=>{
            if(curr + progressPerInterval < 96){
              return curr + progressPerInterval
            }else if (curr< 96 && curr + progressPerInterval >= 96){
              return 96;
            }else{
              clearInterval(loop);
              return curr;
            }
          })
        }, 300);
      }
    }
    return () => clearInterval(loop);
  }, []);

  function getVariantClassNames(variant: string) {
    switch (variant) {
      case "secondary": {
        return " bg-brand-secondary text-white ";
      }
      case "primary":
      default: {
        return " bg-brand-primary text-white ";
      }
    }
  }

  const wrapperClassName = twMerge(
    "w-full h-full flex flex-col justify-center items-center bg-ui-background p-4 gap-4",
    propsWrapperClassName,
  )
  const progressClassName = twMerge(
    "h-2.5 rounded-full transition-all duration-1000",
    getVariantClassNames(variant),
  );

  return (
    <Transition
      className={wrapperClassName}
      show={isShowing}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-1000"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {label && <label>{label}</label>}
      <div className="w-full bg-gray-500 rounded-full h-2.5">
        <div 
          className={progressClassName} 
          style={{width: progress + '%'}}
        />
      </div>
      {message && <p>{message}</p>}
    </Transition>
  );
}