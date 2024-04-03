
import {
  SessionResponse,
} from "./types";

const apiHost = "https://api.fakeyou.com";
// const createAccount = `${apiHost}}/create_account`;
const login = `${apiHost}/v1/login`;
const getSession = `${apiHost}/v1/session`;
const logout = `${apiHost}/v1/logout`;

export const CreateSession = async ({
  usernameOrEmail, password
}:{
  usernameOrEmail: string;
  password: string;
})=> {
  //TODO: This SHOULD NOT be sent in plaintext
  const request = {
    username_or_email: usernameOrEmail,
    password: password,
  }

  return await fetch(login,{
    method: 'POST',
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify(request)
  })
  .then(res => res.json())
  .then(res => { return res; })
  .catch(e => {
    return {
      success: false,
      error_reason: "frontend_error",
    };
  });
}
export const GetSession = async () => {
  return await fetch(getSession, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : SessionResponse = res;
    return response;
  })
  .catch(e => {
    return {
      success: false,
      error_reason: "frontend_error",
    };
  });
}
export async function DestroySession() : Promise<boolean> {
  return await fetch(logout, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : SessionResponse = res;
    return response.success;
  })
  .catch(e => {
    return false;
  });
}