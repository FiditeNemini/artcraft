import { authentication } from "~/signals";

const MakeMultipartRequest = (endpoint = "", body: any) => {
  const { sessionToken } = authentication;
  const formData = new FormData();

  Object.keys(body).forEach((key) => formData.append(key, body[key]));

  formData.append("source", "file");

  return fetch(`https://api.fakeyou.com${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      session: sessionToken.value || "",
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
