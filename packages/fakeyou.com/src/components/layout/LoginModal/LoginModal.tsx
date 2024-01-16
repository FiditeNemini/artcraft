import React, { useState } from "react";
import { a, config, useTransition } from "@react-spring/web";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { Spinner } from "components/common";
import useLogin from "./useLogin";
import LoginView from "./LoginView";
import SignupView from "./SignupView";
import { basicTransition } from "resources";
import { Analytics } from "common/Analytics";
import "./LoginModal.scss";

interface AniProps {
  animating: boolean,
  isLeaving: boolean,
  render: any,
  style: any
}

const AniMod = ({ animating, isLeaving, render: Render, style, ...rest }: AniProps) => <a.div {...{ style: {
    ...style,
    position: isLeaving && animating ? "absolute" : "relative" 
  } }}>
    <Render {...{ ...rest, animating }} />
  </a.div>;

const Loader = () => <div {...{ className: `fy-modal-page modal-spinner` }}><Spinner /></div>;

export default function LoginModal({ handleClose }: { handleClose: any }) {
  const [status,statusSet] = useState(FetchStatus.paused);
  const [viewLogin,viewLoginSet] = useState(false);
  const [animating,animatingSet] = useState(false);
  const { allAreValid, setProps, signup, state } = useLogin({
    onSuccess: () => {
      Analytics.accountSignupAttempt();
      handleClose(); 
    },
    status,
    statusSet
  });

  const index = status === FetchStatus.in_progress ? 2 : viewLogin ? 1: 0;

  const amt = 5;

  const transitions = useTransition(index, {
    config: { mass: 1, tension: 80, friction: 10 },
    from: { opacity: 0, transform: `translateX(${ viewLogin ? amt : -amt }rem)` },
    enter: { opacity: 1, transform: `translateX(0)` },
    leave: { opacity: 0, transform: `translateX(${ viewLogin ? -amt : amt }rem)` },
    onRest: () => animatingSet(false),
    onStart: () => animatingSet(true)
  }); 

  return <div {...{ className: "fy-login-modal" }}>
    {
      transitions((style: any, i: number, state: any) => {
        let isLeaving = state.phase === "leave";

        switch(i) {
          case 0: return <AniMod {...{ animating, handleClose, isLeaving, render: SignupView, setProps, signup, style, viewLoginSet }}/>;
          case 1: return <AniMod {...{ animating, handleClose, isLeaving, render: LoginView, setProps, signup, style, viewLoginSet }}/>;
          case 2: return <AniMod {...{ animating, handleClose, isLeaving, render: Loader, setProps, signup, style, viewLoginSet }}/>;
        }

      
      })
    }

  </div>;
};