import { renameScene as renameSceneEndpoint } from "~/api";

export const renameScene = (sceneTitle: string, sceneToken: string) => {
  const endpoint = renameSceneEndpoint(sceneToken);

  return fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
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
    .catch(() => {
      return { success: false };
    });
};
