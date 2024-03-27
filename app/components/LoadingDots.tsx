import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import { H4 } from '.';

interface LoadingDotsProps {
  className?: string;
  show?: boolean;
  transition?: boolean;
  transitionDuration?: number;
};

interface LoadingDotsInnerProps {
  className?: string;
  show?: boolean;
  type?: 'typing'|'bricks';
  message?: string;
  transition?: boolean;
  transitionDuration?: number;
};

export const LoadingDotsTyping = (props: LoadingDotsProps)=>{
  return (
    <LoadingDots {...props} />
  )
}
export const LoadingDotsBricks = (props: LoadingDotsProps)=>{
  return (
    <LoadingDots {...props} />
  )
}

export function LoadingDots({
  className,
  show=true,
  transition = false,
  type = 'typing',
  message,
  transitionDuration = 1000,
}: LoadingDotsInnerProps){
  const [state, setState] = useState<'loading'|'loaded'|'completed'>('loading');
  const transitionClasses =
    (transition ? `transition-opacity duration-${transitionDuration} `: "")
    + (state === 'loading' ? 'opacity-100' : 'opacity-0');

  const classNames = twMerge("w-full h-full flex flex-col justify-center items-center bg-ui-background gap-6",transitionClasses, className);
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
    }else{
      setState((curr) => {
        if (curr!=='loading') return 'loading';
        else return curr;
      });
    }
  }, [show, transition]);

  if(state!== 'completed'){
    return(
      <div className={classNames}>
        { type==='typing' &&
          <div className="dot-typing"></div>
        }
        { type==='bricks' &&
          <div className="dot-bricks"></div>
        }
        {
          message &&
          <H4>{message}</H4>
        }
      </div>
    );
  }else{
    return null;
  }
};

