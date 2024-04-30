import {
  faChevronRight,
  faChevronLeft
} from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { ButtonIcon } from "~/components";

export const Pagination = ({
  className,
  currentPage,
  totalPages,
  onPageChange,
}:{
  className: string;
  currentPage:number;
  totalPages: number;
  onPageChange: (newPage:number)=>void;
})=>{
  const handleSetPreviousPage = ()=>{
    onPageChange(currentPage-1);
  }
  const handleSetNextPage = ()=>{
    onPageChange(currentPage+1);
  }

  return(
    <nav className={twMerge(
        "flex items-center justify-between border-gray-200 px-4",
        className,
      )}>
      <ButtonIcon
        className="text-gray-400 pt-2 -ml-2"
        icon={faChevronLeft}
        onClick={handleSetPreviousPage}
        disabled={currentPage===0}
        aria-hidden
      />
      <div className="hidden md:flex">
        {[...Array(totalPages)].map((e, i)=>{
          if (i===currentPage){
            return(
              <a
                key={i}
                href="#"
                className="inline-flex items-center border-t-2 border-indigo-500 px-4 pt-2 text-sm font-medium text-indigo-600"
                aria-current="page"
                onClick={()=>onPageChange(i)}
              >
                {i+1}
              </a>
            );
          } else {
            return(
              <a
                key={i}
                href="#"
                className="inline-flex items-center border-t-2 border-transparent px-4 pt-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                onClick={()=>onPageChange(i)}
              >
                {i+1}
              </a>
            );
          }
        })}
      </div>
      <ButtonIcon
        className="text-gray-400 pt-2 -mr-2"
        disabled={currentPage===totalPages-1}
        icon={faChevronRight}
        onClick={handleSetNextPage}
        aria-hidden
      />
    </nav>
  );
}