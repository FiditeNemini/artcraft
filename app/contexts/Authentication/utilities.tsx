import { login, getSession, logout } from '~/api';
import {
  SessionResponse,
} from "./types";

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
    // credentials: 'include',
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
export const GetSession = async (sessionToken:string) => {
  return await fetch(getSession, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'session': sessionToken,
    },
    // credentials: 'include',
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
export async function DestroySession(sessionToken:string) : Promise<boolean> {
  return await fetch(logout, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'session': sessionToken,
    },
    // credentials: 'include',
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