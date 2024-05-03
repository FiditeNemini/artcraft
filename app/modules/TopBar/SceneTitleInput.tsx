import { useState, useContext } from 'react';
import { twMerge } from 'tailwind-merge';
import { useSignals } from "@preact/signals-react/runtime";
import { AuthenticationContext } from "~/contexts/Authentication";
import { faSpinnerThird } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { scene, signalScene } from "~/store";
import {
  showErrorDialog,
  errorDialogMessage,
  errorDialogTitle,
} from "~/pages/PageEnigma/store";

import { Input } from '~/components';
import { renameScene } from './utilities';

export const SceneTitleInput = ()=>{
  useSignals();
  const { authState } = useContext(AuthenticationContext);

  const [{isValid, isSaving}, setState] = useState<{isValid:boolean; isSaving:boolean}>({isValid:true, isSaving:false});
  const setIsValid = (val:boolean)=>{
    setState((curr)=>({...curr, isValid:val}));
  };
  const setIsSaving = (val:boolean)=>{
    setState((curr)=>({...curr, isSaving:val}));
  };

  const handleShowErrorDialog = () => {
    errorDialogTitle.value = "Error";
    errorDialogMessage.value = "Scene name can not be empty.";
    showErrorDialog.value = true;
  };

  const handleChangeSceneTitle = (e: React.ChangeEvent<HTMLInputElement>)=>{
    signalScene({
      ...scene.value,
      title : e.target.value,
    });
    if (scene.value.title !== "") {
      setIsValid(true);
    }
  }
  const validateSceneTitle = (e: React.FocusEvent<HTMLInputElement>)=>{
    if (scene.value.title === "") {
      setIsValid(false);
      handleShowErrorDialog();
      e.target.focus();
    }else if(scene.value.token && authState.sessionToken){
      setIsSaving(true);
      renameScene(
        scene.value.title!, //guarunteed by input
        scene.value.token,
        authState.sessionToken,
      ).then((res)=>{
        // console.log(res);
        //TODO: HANDLE ERROR
        setIsSaving(false);
      });
    }
  };

  return(
    <div className={twMerge(
      "flex gap-3 justify-between items-center",
      isSaving && "ml-3"
    )}>
      <Input
        disabled={scene.value.ownerToken !== authState.userInfo?.user_token}
        className="-ml-2 w-96"
        inputClassName={twMerge(
          "bg-ui-panel focus:bg-brand-secondary text-ellipsis",
          isSaving ? "outline-brand-secondary" : "focus:ml-3",
        )}
        isError={!isValid}
        value={scene.value.title || ""}
        onChange={handleChangeSceneTitle}
        onBlur={validateSceneTitle}
      />
      {isSaving &&
        <FontAwesomeIcon icon={faSpinnerThird} spin/>
      }
    </div>
);
}