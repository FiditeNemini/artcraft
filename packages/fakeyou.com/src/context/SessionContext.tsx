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
  canEditTtsModel: (token:string) => boolean,
  check: () => boolean,
  loggedIn: boolean,
  modal: ModalProps,
  querySession?: any,
  querySubscriptions?: any,
  sessionFetched: boolean,
  user?: any,
  userTokenMatch: (token:string) => boolean
}

export default createContext<SessionContextType>({
  canEditTtsModel: () => false,
  check: () => false,
  loggedIn: false,
  sessionFetched: false,
  modal: {
    close: () => {},
    open: () => {},
    view: ModalView.Closed,
  },
  userTokenMatch: () => false
});