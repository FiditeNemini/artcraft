import { useContext, } from "react";
import { useLocation } from "@remix-run/react";
import {
  faChevronLeft,
} from "@fortawesome/pro-solid-svg-icons";
import { TopBarInnerContext } from "~/contexts/TopBarInner";
import { ButtonLink } from "~/components";

export const TopBar = () => {
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
            {currentLocation !== "/" &&
              <ButtonLink to={"/"} variant="secondary" icon={faChevronLeft}>
                Back to Dashboard
              </ButtonLink>
            }
          </div>

          <div className="flex justify-center">
            <TopBarInner currentLocation={currentLocation}/>
          </div>

          <div className="flex justify-end gap-2">
            <ButtonLink variant="secondary" to='/login'>Login</ButtonLink>
            <ButtonLink to='/signup'>Sign Up</ButtonLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

const TopBarInner = ({currentLocation}:{currentLocation:string}) => {
  const { TopBarInner } = useContext(TopBarInnerContext) || {};
  if(!TopBarInner || TopBarInner.location !== currentLocation){
    return null;
  }
  return TopBarInner.node;
};
