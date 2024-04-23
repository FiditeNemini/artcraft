import { twMerge } from "tailwind-merge"

export const Pill = ({
  className,
  children,
}:{
  className?: string,
  children : React.ReactNode
})=>{
  return (
    <div className={twMerge(
        "rounded-md text-xs font-bold bg-brand-primary py-0.5 px-1.5 w-fit",
        className
      )}>
      {children}
    </div>
  )
}