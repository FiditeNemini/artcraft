import { renameScene as renameSceneEndpoint } from "~/api";
import { authentication } from "~/signals";

export const renameScene = (sceneTitle: string, sceneToken: string) => {
  const { sessionToken } = authentication;
  const endpoint = renameSceneEndpoint(sceneToken);

  if (sessionToken.value) {
    return fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        session: sessionToken.value,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: sceneTitle,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res.success) {
          // console.log(res);
          return res;
        }
        return { success: false };
      })
      .catch((e) => {
        return { success: false };
      });
  } else {
    return new Promise((resolve) => {
      resolve({ success: false });
    });
  }
};
