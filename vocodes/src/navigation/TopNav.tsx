import React from 'react';
import { Mode } from '../AppMode'

interface Props {
  mode: Mode,
  switchModeCallback: (mode: Mode) => void,
}

function TopNav(props: Props) {
  return (
    <nav>
      <span id="logo_text">
        <span className="vo">Vo</span><span className="codes">codes</span>
      </span>
      <a href="#speak" onClick={() => props.switchModeCallback(Mode.SPEAK_MODE)}>Speak</a>
      <a href="#history" onClick={() => props.switchModeCallback(Mode.HISTORY_MODE)}>History</a>
      <a href="#use" onClick={() => props.switchModeCallback(Mode.ABOUT_MODE)}>About</a>
      <hr />
    </nav>
  )
}

export { TopNav };
