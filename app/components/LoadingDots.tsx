import { useState, useEffect } from 'react';

interface LoadingDotsProps {
  show?: boolean;
  transition?: boolean;
  transitionDuration?: number;
};

interface LoadingDotsInnerProps {
  show?: boolean;
  transition?: boolean;
  transitionDuration?: number;
  children: React.ReactNode;
};

export const LoadingDotsTyping = (props: LoadingDotsProps)=>{
  return (
    <LoadingDots {...props}>
      <div className="dot-typing"></div>
    </LoadingDots>
  )
}
export const LoadingDotsBricks = (props: LoadingDotsProps)=>{
  return (
    <LoadingDots {...props}>
      <div className="dot-bricks"></div>
    </LoadingDots>
  )
}

function LoadingDots({
  show=true,
  transition = false,
  transitionDuration = 1000,
  children,
}: LoadingDotsInnerProps){
  const [state, setState] = useState<'loading'|'loaded'|'completed'>('loading');
  const transitionClasses =
    (transition ? `transition-opacity duration-${transitionDuration} `: "")
    + (state === 'loading' ? 'opacity-100' : 'opacity-0');

  const classNames = "w-full h-full flex justify-center items-center bg-ui-background " + transitionClasses;
  useEffect(()=>{
    if(!show){
      if(transition){
        setState((curr)=>{
          if (curr === 'loading') return 'loaded'
          else return curr;
        });
        setTimeout(()=>setState('completed'), 2000);
      } else {
        setState('completed');
      }
    }
  }, [show, transition]);

  if(state!== 'completed'){
    return(
      <div className={classNames}>
        {children}
      </div>
    );
  }else{
    return null;
  }
};

