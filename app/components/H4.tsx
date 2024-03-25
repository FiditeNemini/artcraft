import { twMerge } from "tailwind-merge"

export const H4 = ({
  className,
  children,
}:{
  className?: string,
  children: React.ReactNode,
})=>{
  return(
    <h4
      className={
        twMerge("text-base font-medium text-white", className)
      }
    >
      {children}
    </h4>
  )
}