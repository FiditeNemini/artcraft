import { useState } from 'react';
import { useLocation, useParams } from "@remix-run/react";
import { useSignals } from "@preact/signals-react/runtime";
import { faChevronLeft } from "@fortawesome/pro-solid-svg-icons";
import { ButtonLink, Input } from "~/components";
import { AuthButtons } from "./AuthButtons";
import { scene } from "~/store";
import {
  showErrorDialog,
  errorDialogMessage,
  errorDialogTitle,
} from "~/pages/PageEnigma/store";
import { MyMoviesButton } from "~/modules/TopBar/MyMoviesButton";

import { getCurrentLocationWithoutParams } from '~/utilities';

function isEditorPath(path:string){
  if ( path === "/" ) return true;
  if ( path === "/idealenigma/" ) return true;
  return false;
}
interface Props {
  pageName: string;
}

export const TopBar = ({ pageName }: Props) => {
  useSignals();
  const currentLocation = getCurrentLocationWithoutParams(useLocation().pathname, useParams());

  const [isValid, setIsValid] = useState<boolean>(true);
  const handleShowErrorDialog = () => {
    errorDialogTitle.value = "Error";
    errorDialogMessage.value = "Scene name can not be empty.";
    showErrorDialog.value = true;
  };
  const handleChangeSceneTitle = (e: React.ChangeEvent<HTMLInputElement>)=>{
    scene.value.title = e.target.value;
    if (scene.value.title !== "") {
      setIsValid(true);
    }
  }
  const validateSceneTitle = (e: React.FocusEvent<HTMLInputElement>)=>{
    if (scene.value.title === "") {
      setIsValid(false);
      handleShowErrorDialog();
      e.target.focus();
    }
  };
  return (
    <header className="fixed left-0 top-0 z-10 w-full border-b border-ui-panel-border bg-ui-panel">
      <nav
        className="mx-auto grid h-[64px] w-screen grid-cols-3 items-center justify-between p-3"
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
          {!isEditorPath(currentLocation) && (
            <ButtonLink to={"/"} variant="secondary" icon={faChevronLeft}>
              Back to Editor
            </ButtonLink>
          )}
        </div>

        <div className="flex items-center justify-center font-medium gap-2">
          <span className="opacity-60">{pageName}</span>
          <span className="opacity-60">/</span>
          <Input
            className="-ml-2 w-96"
            inputClassName="bg-ui-panel focus:bg-brand-secondary focus:ml-3 text-ellipsis"
            isError={!isValid}
            value={scene.value.title || ""}
            onChange={handleChangeSceneTitle}
            onBlur={validateSceneTitle}
          />
        </div>

        <div className="flex justify-end gap-2">
          <MyMoviesButton />
          <div className="flex justify-end gap-2">
            <AuthButtons />
          </div>
        </div>
      </nav>
    </header>
  );
};
