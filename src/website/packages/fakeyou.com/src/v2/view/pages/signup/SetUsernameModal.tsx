import { faArrowRight, faUser } from "@fortawesome/pro-solid-svg-icons";
import { Button, Input } from "components/common";
import ModalHeader from "components/modals/ModalHeader";
import React, { useContext, useState } from "react";
import { useModal } from "hooks";
import { EditUsername } from "@storyteller/components/src/api/user/EditUsername";
import { AppStateContext } from "components/providers/AppStateProvider";

export default function SetUsernameModal() {
  const {
    appState: { maybe_user_info },
  } = useContext(AppStateContext);
  const { close } = useModal();
  const [username, setUsername] = useState(maybe_user_info?.display_name || "");

  const handleConfirm = async () => {
    try {
      const response = await EditUsername("", { display_name: username });

      if (response.success) {
        console.log("Username updated successfully");
        close();
      } else {
        console.error("Failed to update username");
      }
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  return (
    <>
      <ModalHeader title="Choose your Username" handleClose={close} />
      <div>
        <div className="mb-4 d-flex flex-column w-100">
          <p>Set a username for your account.</p>
        </div>
      </div>

      <div className="w-100">
        <Input
          label="Username"
          placeholder="Username"
          icon={faUser}
          autoFocus={true}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <div className="d-flex justify-content-end">
          <Button
            onClick={handleConfirm}
            label="Confirm"
            icon={faArrowRight}
            iconFlip={true}
            className="mt-4"
          />
        </div>
      </div>
    </>
  );
}
