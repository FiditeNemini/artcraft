import { useState, useContext } from "react";
import { twMerge } from "tailwind-merge";
import { useSignals } from "@preact/signals-react/runtime";
import { AuthenticationContext } from "~/contexts/Authentication";
import { faPencil, faSpinnerThird } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { scene, signalScene } from "~/store";
import {
  showErrorDialog,
  errorDialogMessage,
  errorDialogTitle,
} from "~/pages/PageEnigma/store";
import { Input } from "~/components";
import { renameScene } from "./utilities";

interface Props {
  pageName: string;
}

export const SceneTitleInput = ({ pageName }: Props) => {
  useSignals();
  const { authState } = useContext(AuthenticationContext);
  const [showInput, setShowInput] = useState(false);
  const [previousTitle, setPreviousTitle] = useState(scene.value.title);
  const isSceneOwner =
    scene.value.ownerToken === authState.userInfo?.user_token;

  const [{ isValid, isSaving }, setState] = useState<{
    isValid: boolean;
    isSaving: boolean;
  }>({ isValid: true, isSaving: false });
  const setIsValid = (val: boolean) => {
    setState((curr) => ({ ...curr, isValid: val }));
  };
  const setIsSaving = (val: boolean) => {
    setState((curr) => ({ ...curr, isSaving: val }));
  };

  const handleShowErrorDialog = () => {
    errorDialogTitle.value = "Error";
    errorDialogMessage.value = "Scene name can not be empty.";
    showErrorDialog.value = true;
  };

  const handleChangeSceneTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    signalScene({
      ...scene.value,
      title: e.target.value,
    });
    if (scene.value.title !== "") {
      setIsValid(true);
    }
  };

  const validateSceneTitle = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowInput(false);
    if (scene.value.title === "") {
      setIsValid(false);
      handleShowErrorDialog();
      resetPreviousTitle();
      e.currentTarget.focus();
    } else if (scene.value.token && authState.sessionToken) {
      setIsSaving(true);
      renameScene(
        scene.value.title!, //guarunteed by input
        scene.value.token,
        authState.sessionToken,
      ).then((res) => {
        // console.log(res);
        //TODO: HANDLE ERROR
        setIsSaving(false);
      });
    }
  };

  const resetPreviousTitle = () => {
    signalScene({
      ...scene.value,
      title: previousTitle,
    });
  };

  const handleShowInput = () => {
    setShowInput(true);
  };

  return (
    <div
      className={twMerge(
        "mr-[74px] flex w-full items-center justify-center gap-1.5",
        isSaving && "ml-3",
      )}>
      {!showInput && (
        <div className="flex items-center">
          <span className="mr-2 text-nowrap opacity-60">{pageName}</span>
          <span className="opacity-60">/</span>

          {isSceneOwner ? (
            <button
              className="ml-0.5 rounded-md px-2 py-1 transition-all hover:cursor-text hover:bg-white/[8%]"
              onClick={handleShowInput}>
              {scene.value.title || ""}
              <FontAwesomeIcon
                icon={faPencil}
                className="ml-2 text-sm opacity-50"
              />
            </button>
          ) : (
            <div className="ml-0.5 rounded-md px-2 py-1">
              {scene.value.title || ""}
            </div>
          )}
        </div>
      )}

      {showInput && (
        <div className="relative">
          <Input
            disabled={scene.value.ownerToken !== authState.userInfo?.user_token}
            className="w-[420px]"
            inputClassName={twMerge(
              "text-center h-8 focus:outline-brand-primary",
              isSaving && "outline-brand-secondary",
            )}
            isError={!isValid}
            value={scene.value.title || ""}
            onChange={handleChangeSceneTitle}
            onBlur={validateSceneTitle}
            onFocus={(e) => {
              setPreviousTitle(scene.value.title);
              e.target.select();
            }}
            autoFocus={true}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              } else if (e.key === "Escape") {
                resetPreviousTitle();
                setShowInput(false);
              }
            }}
          />
        </div>
      )}

      {isSaving && <FontAwesomeIcon icon={faSpinnerThird} spin />}
    </div>
  );
};
