import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface ButtonPropsI extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 icon?: IconDefinition;
 variant?: "primary"|"secondary";
}

export const Button = ({
  icon,
  children,
  className : propsClassName,
  variant = 'primary',
  ...rest
}:ButtonPropsI)=>{
  function getVariantClassNames(variant: string){
    switch(variant){
      case "secondary":{
        return " bg-brand-secondary hover:bg-brand-secondary-900 text-white focus-visible:outline-brand-secondary";
      }
      case "primary":
      default:{
        return " bg-brand-primary hover:bg-brand-primary-400 text-white focus-visible:outline-brand-primary-600";
      }
    }
  }; 
  const className = "text-sm font-semibold rounded-md px-3.5 py-2.5 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" + getVariantClassNames(variant)
  + (propsClassName ? ` ${propsClassName}` : "");

  return(
    <button
      className={className}
      {...rest}
    >
      {icon && 
        <FontAwesomeIcon className="mr-2" icon={icon}/>
      }
      {children}
    </button>
  );
}