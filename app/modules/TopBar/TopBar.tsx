import { useLocation } from "@remix-run/react";

import { faChevronLeft, faCircle } from "@fortawesome/pro-solid-svg-icons";

import { Button, ButtonLink } from "~/components";

import { AuthButtons } from "./AuthButtons";
import { sceneTitle } from "~/store";
import { activeJobs, viewMyMovies } from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  pageName: string;
}

export const TopBar = ({ pageName }: Props) => {
  useSignals();
  const currentLocation = useLocation().pathname;
  const activeCount = activeJobs.value.jobs.length;

  return (
    <header className="fixed left-0 top-0 w-full border-b border-ui-panel-border bg-ui-panel">
      <nav
        className="mx-auto flex w-screen items-center justify-between p-4"
        aria-label="Global">
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
          &nbsp;&nbsp;
          <span className="opacity-60">@ CURRENT_STORYTELLER_GIT_VERSION</span>
        </div>

        <div className="flex gap-2">
          <Button variant="action" onClick={() => (viewMyMovies.value = true)}>
            <div className="relative flex items-center gap-2">
              {activeCount > 0 ? (
                <svg
                  className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="14"
                  viewBox="0 0 16 14"
                  fill="none">
                  <path
                    d="M0 2C0 0.896875 0.896875 0 2 0H14C15.1031 0 16 0.896875 16 2V12C16 13.1031 15.1031 14 14 14H2C0.896875 14 0 13.1031 0 12V2ZM1.5 10.5V11.5C1.5 11.775 1.725 12 2 12H3C3.275 12 3.5 11.775 3.5 11.5V10.5C3.5 10.225 3.275 10 3 10H2C1.725 10 1.5 10.225 1.5 10.5ZM13 10C12.725 10 12.5 10.225 12.5 10.5V11.5C12.5 11.775 12.725 12 13 12H14C14.275 12 14.5 11.775 14.5 11.5V10.5C14.5 10.225 14.275 10 14 10H13ZM1.5 6.5V7.5C1.5 7.775 1.725 8 2 8H3C3.275 8 3.5 7.775 3.5 7.5V6.5C3.5 6.225 3.275 6 3 6H2C1.725 6 1.5 6.225 1.5 6.5ZM13 6C12.725 6 12.5 6.225 12.5 6.5V7.5C12.5 7.775 12.725 8 13 8H14C14.275 8 14.5 7.775 14.5 7.5V6.5C14.5 6.225 14.275 6 14 6H13ZM1.5 2.5V3.5C1.5 3.775 1.725 4 2 4H3C3.275 4 3.5 3.775 3.5 3.5V2.5C3.5 2.225 3.275 2 3 2H2C1.725 2 1.5 2.225 1.5 2.5ZM13 2C12.725 2 12.5 2.225 12.5 2.5V3.5C12.5 3.775 12.725 4 13 4H14C14.275 4 14.5 3.775 14.5 3.5V2.5C14.5 2.225 14.275 2 14 2H13ZM5 3V5C5 5.55312 5.44688 6 6 6H10C10.5531 6 11 5.55312 11 5V3C11 2.44688 10.5531 2 10 2H6C5.44688 2 5 2.44688 5 3ZM6 8C5.44688 8 5 8.44687 5 9V11C5 11.5531 5.44688 12 6 12H10C10.5531 12 11 11.5531 11 11V9C11 8.44687 10.5531 8 10 8H6Z"
                    fill="white"
                  />
                </svg>
              )}
              <div>My Movies</div>
            </div>
          </Button>
          <div className="flex justify-end gap-2">
            <AuthButtons />
          </div>
        </div>
      </nav>
    </header>
  );
};
