import { twMerge } from "tailwind-merge";
import { TabTitles } from "~/enums";

export const SubTabButtons = ({
  currSubpage,
  subPageTitles,
  setSubpage,
}: {
  currSubpage: TabTitles;
  subPageTitles: TabTitles[];
  setSubpage: (newTab: TabTitles) => void;
}) => {
  const leftMostButtonCss = "rounded-l-lg";
  const rightMostButtonCss = "rounded-r-lg";
  return (
    <div className="mx-4">
      {subPageTitles.map((subPageTitle, idx) => {
        return (
          <button
            key={idx}
            className={twMerge(
              "h-10 w-1/2 cursor-pointer bg-brand-secondary p-2 text-sm font-medium transition-all",
              idx === 0 && leftMostButtonCss,
              idx === subPageTitles.length - 1 && rightMostButtonCss,
              currSubpage === subPageTitle
                ? "bg-brand-primary"
                : "hover:bg-brand-secondary-800",
            )}
            disabled={currSubpage === subPageTitle}
            onClick={() => setSubpage(subPageTitle)}
          >
            {subPageTitle}
          </button>
        );
      })}
    </div>
  );
};
