import { twMerge } from 'tailwind-merge';
import { H4 } from '.';

interface LoadingBarProps{
  label?: string;
  progress?: number;
  variant?: string;
  pulsing?: boolean;
  message?: string;
}
export const LoadingBar = ({
  label,
  progress = 50,
  variant = 'primary',
  pulsing = false,
  message,
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
  const progressClassName = twMerge(
    "h-2.5 rounded-full",
    getVariantClassNames(variant),
  );

  return (
    <div className="w-full h-full flex flex-row justify-center items-center bg-ui-background ">
      {label && <label>{label}</label>}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={progressClassName} 
          style={{width: progress + '%'}}
        />
      </div>
      {message && <H4>{message}</H4>}
    </div>
  );
}