import React from "react";
import { Mode } from "../AppMode";

interface Props {
  mode: Mode;
  switchModeCallback: (mode: Mode) => void;
}

function TopNav(props: Props) {
  return (
    <>
      <nav className="d-flex justify-content-center gap-4 align-items-center py-3">
        <a
          href="#speak"
          onClick={() => props.switchModeCallback(Mode.SPEAK_MODE)}
        >
          Speak
        </a>
        {/*<a onClick={() => props.switchModeCallback(Mode.HISTORY_MODE)}>Downloads</a>*/}
        <a
          href="#use"
          onClick={() => props.switchModeCallback(Mode.USAGE_MODE)}
        >
          Usage
        </a>
        <a
          href="#news"
          onClick={() => props.switchModeCallback(Mode.NEWS_MODE)}
        >
          News
        </a>
        <a
          href="#help"
          onClick={() => props.switchModeCallback(Mode.HELP_WANTED_MODE)}
        >
          Help Wanted
        </a>
      </nav>
      <hr className="mt-0 mb-4" />
      <h1 className="fw-bold text-center fs-2">
        Trumped Donald Trump TTS by FakeYou
      </h1>
    </>
  );
}

export { TopNav };
