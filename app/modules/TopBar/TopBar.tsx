import { useState } from 'react';
import { useLocation } from "@remix-run/react";
import { useSignals } from "@preact/signals-react/runtime";

import { faChevronLeft } from "@fortawesome/pro-solid-svg-icons";

import { ButtonLink } from "~/components";
import { AuthButtons } from "./AuthButtons";
import { sceneTitle } from "~/store";
import {
  showErrorDialog,
  errorDialogMessage,
  errorDialogTitle,
} from "~/pages/PageEnigma/store";

import { MyMoviesButton } from "~/modules/TopBar/MyMoviesButton";
import { Input } from "~/components";

interface Props {
  pageName: string;
}

export const TopBar = ({ pageName }: Props) => {
  useSignals();
  const currentLocation = useLocation().pathname;
  const [isValid, setIsValid] = useState<boolean>(true);
  const handleShowErrorDialog = ()=>{
    errorDialogTitle.value = "Error";
    errorDialogMessage.value = "Scene name can not be empty.";
    showErrorDialog.value = true;
  };
  const handleChangeSceneTitle = (e: React.ChangeEvent<HTMLInputElement>)=>{
    sceneTitle.value = e.target.value;
    if (sceneTitle.value !== "") {
      setIsValid(true);
    }
  }
  const validateSceneTitle = (e: React.FocusEvent<HTMLInputElement>)=>{
    if (sceneTitle.value === "") {
      setIsValid(false);
      handleShowErrorDialog();
      e.target.focus();
    }
  }
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

        <div className="flex items-center justify-center font-medium gap-2">
          <span className="opacity-60">{pageName}</span>
          <span className="opacity-60">/</span>
          <Input
            className="-ml-2"
            inputClassName="bg-ui-panel focus:bg-brand-secondary focus:ml-3"
            isError={!isValid}
            value={sceneTitle.value}
            onChange={handleChangeSceneTitle}
            onBlur={validateSceneTitle}
          />
        </div>

        <div className="flex gap-2.5">
          <MyMoviesButton />
          <div className="flex justify-end gap-2">
            <AuthButtons />
          </div>
        </div>
      </nav>
    </header>
  );
};
