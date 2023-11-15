import GetApiHost from "./GetApiHost";

const { formatUrl, host = "" } = GetApiHost();

const MakeMultipartRequest = (endpoint = "", body: any) => {
  const formData = new FormData();

  Object.keys(body).forEach((key) => formData.append(key, body[key]));

  formData.append('source', "file");

  return fetch(formatUrl(endpoint), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
  })
  .then(res => res.json())
  .then(res => {
    if (res && res.success) {
      return res;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}

export default MakeMultipartRequest;