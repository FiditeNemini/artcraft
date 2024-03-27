import { twMerge } from 'tailwind-merge';
import { H4 } from '.';

interface LoadingBarProps{
  label?: string;
  progress?: number;
  variant?: string;
  message?: string;
  wrapperClassName?: string;
  useFakeTimer?: number; 
}
export const LoadingBar = ({
  label,
  progress = 0,
  variant = 'primary',
  message,
  wrapperClassName : propsWrapperClassName,
  useFakeTimer = (1000 * 60) //defaults to 1min
}: LoadingBarProps) => {

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
    <div className={wrapperClassName}>
      {label && <label>{label}</label>}
      <div className="w-full bg-gray-500 rounded-full h-2.5">
        <div 
          className={progressClassName} 
          style={{width: progress + '%'}}
        />
      </div>
      {message && <H4>{message}</H4>}
    </div>
  );
}