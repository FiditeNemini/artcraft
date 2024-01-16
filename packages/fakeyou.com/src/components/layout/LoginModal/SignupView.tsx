import React from 'react';
import { TempInput } from "components/common";
import { faUser, faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";

interface Props {
  animating: boolean,
  handleClose: (x:any) => any,
  setProps: (x:any) => any,
  signup: (x:any) => any,
  viewLoginSet: (x:any) => void
}

export default function LoginView({ animating, handleClose, setProps, signup, viewLoginSet }: Props) {
  return <div {...{ className: `fy-modal-page${ animating ? " animating-modal-page" : ""}` }}>
    <header>
      <div {...{ className: "login-modal-title-row" }}>
        <h2>Signup</h2>
        <button {...{ ariaLabel: "Close", className: "btn-close", onClick: handleClose, type: "button" }}/>
      </div>
      <div {...{ className: "login-modal-subtitle-row" }}>
        <span {...{ className: "login-modal-subtitle" }}>Create a new account</span>
        <span {...{ className: "login-modal-login-link", onClick: () => { if (!animating) viewLoginSet(true); } }}>Or login instead</span>
      </div>
    </header>
    <TempInput {...{ icon: faUser, label: "Username", placeholder: "Username", ...setProps("username") }}/>
    <TempInput {...{ icon: faEnvelope, label: "Email", placeholder: "Email", ...setProps("email") }}/>
    <TempInput {...{ icon: faKey, label: "Password", placeholder: "Enter a new password", type: "password", ...setProps("password") }}/>
    <TempInput {...{ icon: faKey, label: "Confirm password", placeholder: "Confirm password", type: "password", ...setProps("passwordConfirm") }}/>
    <button {...{ className: "btn btn-primary w-100 mt-4", onClick: signup }}>Sign up</button>
  </div>;
};