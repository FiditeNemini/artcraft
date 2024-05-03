import { renameScene as renameSceneEndpoint } from "~/api";

export const renameScene = async (
  sceneTitle: string,
  sceneToken: string,
  sessionToken: string,
) => {
  const endpoint = renameSceneEndpoint(sceneToken);
  // console.log(`rename ${sceneToken}: ${sceneTitle}`);
  return await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        session: sessionToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: sceneTitle,
      }),
  })
  .then(res => res.json())
  .then(res => {
    if (res && res.success) {
      // console.log(res);
      return res;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}