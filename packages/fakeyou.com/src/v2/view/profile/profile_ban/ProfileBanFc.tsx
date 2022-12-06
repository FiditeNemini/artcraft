import React, { useCallback, useEffect, useState } from "react";
import { ApiConfig } from "@storyteller/components";
import { useHistory } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useParams } from "react-router-dom";
import {
  GetUserByUsername,
  GetUserByUsernameIsOk,
  User,
} from "../../../api/user/GetUserByUsername";
import { BackLink } from "../../_common/BackLink";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../data/animation";

interface Props {
  sessionWrapper: SessionWrapper;
}

function ProfileBanFc(props: Props) {
  const { username }: { username: string } = useParams();
  const userProfilePage = `/profile/${username}`;

  const history = useHistory();

  // From endpoint
  const [userData, setUserData] = useState<User | undefined>(undefined);

  // Form values
  const [modComments, setModComments] = useState<string>("");
  const [isBanned, setIsBanned] = useState<boolean>(false);

  const getUserProfile = useCallback(async (username) => {
    const user = await GetUserByUsername(username);
    if (GetUserByUsernameIsOk(user)) {
      setUserData(user);
      setIsBanned(user?.maybe_moderator_fields?.is_banned || false);
      setModComments(user?.maybe_moderator_fields?.maybe_mod_comments || "");
    }
  }, []);

  useEffect(() => {
    getUserProfile(username);
  }, [username, getUserProfile]);

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>): boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.banUser();

    const request = {
      username: userData?.username,
      is_banned: isBanned,
      mod_notes: modComments,
    };

    fetch(endpointUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(request),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          history.push(userProfilePage);
        }
      })
      .catch((e) => {});

    return false;
  };

  if (!userData) {
    // Waiting for load.
    return <span />;
  }

  if (!!userData && !props.sessionWrapper.canEditUserProfile(username)) {
    // Loading and we don't have access.
    history.push(userProfilePage);
  }

  const handleModCommentsChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const textValue = (ev.target as HTMLInputElement).value;
    setModComments(textValue);
    return false;
  };

  const handleIsBannedChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    let bannedState = false;
    switch ((ev.target as HTMLSelectElement).value) {
      case "true":
        bannedState = true;
        break;
      case "TRUE":
        bannedState = true;
        break;
    }
    setIsBanned(bannedState);
  };

  let viewLinkUrl = `/profile/${userData?.username}`;

  let isDisabled = userData === undefined;

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pt-5 pb-4 px-lg-5 px-xl-3">
        <motion.h1 className="display-5 fw-bold mb-3" variants={item}>
          Profile &amp; Preferences
        </motion.h1>
        <motion.div variants={item}>
          <BackLink link={viewLinkUrl} text="Back to profile" />
        </motion.div>
      </div>

      <motion.form onSubmit={handleFormSubmit} variants={panel}>
        <fieldset disabled={isDisabled}>
          <div className="container-panel py-5">
            <div className="panel p-3 p-lg-4">
              <h2 className="panel-title fw-bold">Ban/Unban User</h2>
              <div className="py-6">
                <div className="d-flex flex-column gap-4">
                  <div>
                    <label className="sub-title">Is Banned?</label>
                    <div className="form-group">
                      <select
                        name="default_pretrained_vocoder"
                        onChange={handleIsBannedChange}
                        value={isBanned ? "true" : "false"}
                        className="form-select"
                      >
                        <option value="true">Banned</option>
                        <option value="false">Not Banned</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="sub-title">
                      Moderator Comments (Short)
                    </label>
                    <div className="control has-icons-left has-icons-right">
                      <input
                        onChange={handleModCommentsChange}
                        className="form-control"
                        type="text"
                        placeholder="Moderator Comments"
                        value={modComments}
                      />
                    </div>
                  </div>

                  {/*<p className="help">{invalidReason}</p>*/}
                </div>
              </div>
            </div>
          </div>

          <motion.div className="container" variants={item}>
            <button className="btn btn-primary w-100">Update Ban</button>
          </motion.div>
        </fieldset>
      </motion.form>

      <motion.div className="container py-5" variants={item}>
        <p>Notes on banned users:</p>
        <ul>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </motion.div>
    </motion.div>
  );
}

export { ProfileBanFc };
