// import GetApiHost from "./GetApiHost";

// const { formatUrl, host = "" } = GetApiHost();

import { STORAGE_KEYS } from "~/contexts/Authentication/types";

const MakeMultipartRequest = (endpoint = "", body: any) => {
  const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  const formData = new FormData();

  Object.keys(body).forEach((key) => formData.append(key, body[key]));

  formData.append("source", "file");

  return fetch(`https://api.fakeyou.com${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      session: sessionToken,
    },
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.success) {
        return res;
      } else {
        return { success: false };
      }
    })
    .catch((e) => {
      return { success: false };
    });
};

export default MakeMultipartRequest;
