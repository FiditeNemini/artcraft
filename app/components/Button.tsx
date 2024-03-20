import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 icon?: IconDefinition;
}

export const Button = ({
  icon,
  children,
  className : propsClassName,
  ...rest
}:ButtonProps)=>{
  const className = `
    bg-brand-primary hover:bg-brand-primary-400
    text-white text-sm font-semibold
    rounded-md px-3.5 py-2.5 shadow-sm
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary-600
  ` + (propsClassName ? ` ${propsClassName}` : null);

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