import { useContext } from "react";
import { LoginModalContext } from "context";

export default function useLoginModal() {
  const login = useContext(LoginModalContext)

  return login;
};