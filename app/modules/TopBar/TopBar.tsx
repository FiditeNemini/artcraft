import { useContext } from "react";

import { Button } from "~/components/Button";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { TopBarInnerContext } from "~/contexts/TopBarInner";

export const TopBar = () => {
  return (
    <header
      className="
      fixed left-0 top-0 w-full
      border-b border-ui-panel-border bg-ui-panel
    "
    >
      <nav
        className="mx-auto flex max-w-full items-center justify-between px-4 py-3"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <a href="#">
            <span className="sr-only">FakeYou</span>
            <img
              className="ml-0.5 h-9 w-auto"
              src="/resources/images/Storyteller-Logo-1.png"
              alt="Logo FakeYou StoryTeller.ai"
            />
          </a>
          <span className="w-4 lg:w-8" />
          <TopBarInner />
        </div>
        <Button icon={faRightToBracket}>Login</Button>
      </nav>
    </header>
  );
};

const TopBarInner = () => {
  const { TopBarInner } = useContext(TopBarInnerContext) || {};
  return TopBarInner;
};
