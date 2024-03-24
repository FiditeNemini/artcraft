import { useContext } from "react";

import { Button } from "~/components/Button";
import {
  faChevronLeft,
  faRightToBracket,
} from "@fortawesome/pro-solid-svg-icons";
import { TopBarInnerContext } from "~/contexts/TopBarInner";
import { ButtonLink } from "~/components";

export const TopBar = () => {
  return (
    <header
      className="fixed left-0 top-0 w-full
      border-b border-ui-panel-border bg-ui-panel"
    >
      <nav
        className="mx-auto flex max-w-full items-center justify-between px-4 py-3"
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
            <ButtonLink to={"/"} variant="secondary" icon={faChevronLeft}>
              Back to Dashboard
            </ButtonLink>
          </div>

          <div className="flex justify-center">
            <TopBarInner />
          </div>

          <div className="flex justify-end">
            <Button icon={faRightToBracket}>Login</Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

const TopBarInner = () => {
  const { TopBarInner } = useContext(TopBarInnerContext) || {};
  return TopBarInner;
};
