import { useState } from "react";
import { useChanger, useSession } from "hooks";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { CreateSession, CreateSessionResponse } from "@storyteller/components/src/api/account/CreateSession";

interface Props {
  onSuccess?: (x?:any) => any,
  status: FetchStatus,
  statusSet: (x: FetchStatus) => void,
}

export default function useLogin({ onSuccess, status, statusSet }: Props) {
  const [errorType,errorTypeSet] = useState("");
  const { querySession, querySubscriptions } = useSession();
  const { allAreValid, setProps, state, update } = useChanger({
    password: { value: "" },
    usernameOrEmail: { value: "" }
  });

  const login = () => {
    errorTypeSet("");
    statusSet(FetchStatus.in_progress);
    // if (allAreValid()) {
      CreateSession("",{
        username_or_email: state.usernameOrEmail.value,
        password: state.password.value,
      }).then((res: CreateSessionResponse) => {
        if (!res.success && res.error_type) {
          statusSet(FetchStatus.error);
          errorTypeSet(res.error_type);
        } else if (res.success) {
          statusSet(FetchStatus.success);
          querySession();
          querySubscriptions();
          if (onSuccess) onSuccess(res);
        } 
      });
    };

  return { allAreValid, errorType, errorTypeSet, login, setProps, state, update };
};