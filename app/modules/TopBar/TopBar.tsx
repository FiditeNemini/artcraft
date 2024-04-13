import { useLocation } from "@remix-run/react";

import { faChevronLeft } from "@fortawesome/pro-solid-svg-icons";

import { ButtonLink } from "~/components";

import { AuthButtons } from "./AuthButtons";
import { sceneTitle } from "~/store";

interface Props {
  pageName: string;
}

export const TopBar = ({ pageName }: Props) => {
  const currentLocation = useLocation().pathname;

  return (
    <header
      className="fixed left-0 top-0 w-full
      border-b border-ui-panel-border bg-ui-panel"
    >
      <nav
        className="mx-auto flex max-w-full items-center justify-between p-4"
        aria-label="Global"
      >
        <div className="grid w-full grid-cols-3 gap-2">
          <div className="flex gap-4">
            <a href="/" className="">
              <span className="sr-only">Storyteller.ai</span>
              <img
                className="h-9 w-auto"
                src="/resources/images/Storyteller-Logo-1.png"
                alt="Logo FakeYou StoryTeller.ai"
              />
            </a>
            {currentLocation !== "/" && (
              <ButtonLink to={"/"} variant="secondary" icon={faChevronLeft}>
                Back to Dashboard
              </ButtonLink>
            )}
          </div>

          <div className="flex items-center justify-center font-medium">
            <span className="opacity-60">{pageName}&nbsp;&nbsp;/</span>
            &nbsp;&nbsp;
            {sceneTitle.value}
          </div>

          <div className="flex justify-end gap-2">
            <AuthButtons />
          </div>
        </div>
      </nav>
    </header>
  );
};
