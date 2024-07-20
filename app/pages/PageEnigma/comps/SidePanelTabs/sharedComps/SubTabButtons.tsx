import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import { TabTitles } from "~/enums";

export const SubTabButtons = ({
  currSubpage,
  subPageTitles,
  setSubpage,
  subPageTitleIcons,
}: {
  currSubpage: TabTitles;
  subPageTitles: TabTitles[];
  subPageTitleIcons?: IconDefinition[];
  setSubpage: (newTab: TabTitles) => void;
}) => {
  const leftMostButtonCss = "rounded-l-lg";
  const rightMostButtonCss = "rounded-r-lg";
  return (
    <div className="mx-4 flex">
      {subPageTitles.map((subPageTitle, idx) => {
        return (
          <button
            key={idx}
            className={twMerge(
              "h-10 grow cursor-pointer bg-brand-secondary p-2 text-sm font-medium transition-all",
              subPageTitleIcons && "h-14",
              idx === 0 && leftMostButtonCss,
              idx === subPageTitles.length - 1 && rightMostButtonCss,
              currSubpage === subPageTitle
                ? "bg-brand-primary"
                : "hover:bg-brand-secondary-800",
            )}
            disabled={currSubpage === subPageTitle}
            onClick={() => setSubpage(subPageTitle)}
          >
            {subPageTitleIcons && subPageTitleIcons[idx] && (
              <FontAwesomeIcon
                className="w-full"
                icon={subPageTitleIcons[idx]}
              />
            )}
            {subPageTitle}
          </button>
        );
      })}
    </div>
  );
};
