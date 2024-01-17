import { createContext } from "react";

export enum ModalView {
  Closed,
  Signup,
  Login
}

interface ModalProps {
  close: () => void,
  open: () => void,
  view: ModalView
}

interface SessionContextType {
  check: () => boolean,
  loggedIn: boolean,
  modal: ModalProps,
  querySession?: any,
  querySubscriptions?: any,
  sessionFetched: boolean,
  user?: any
}

export default createContext<SessionContextType>({
  check: () => false,
  loggedIn: false,
  sessionFetched: false,
  modal: {
    close: () => {},
    open: () => {},
    view: ModalView.Closed,
  }
});