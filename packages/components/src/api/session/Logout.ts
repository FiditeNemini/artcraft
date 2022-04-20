import { ApiConfig } from "../ApiConfig";

interface ResponsePayload {
  success: boolean,
}

export async function Logout() : Promise<boolean> {
  const endpoint = new ApiConfig().logout();
  
  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : ResponsePayload = res;
    return response.success;
  })
  .catch(e => {
    return false;
  });
}
