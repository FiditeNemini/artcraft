import { useContext } from "react";
import { AccountModalContext } from "context";

export default function useLoginModal() {
  const login = useContext(AccountModalContext)

  return login;
};