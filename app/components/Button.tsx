import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 icon?: IconDefinition;
}

export const Button = ({
  icon,
  children,
}:ButtonProps)=>{
  return(
    <button
      className="
        bg-indigo-600 hover:bg-indigo-500
        text-white text-sm font-semibold
        rounded-md px-3.5 py-2.5   shadow-sm
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
      {children}
    </button>
  );
}