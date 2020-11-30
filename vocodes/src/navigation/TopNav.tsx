import React from 'react';
import { Mode } from '../AppMode'

interface Props {
  mode: Mode,
  historyBadgeCount: number,
  isHistoryCountBadgeVisible: boolean,
  switchModeCallback: (mode: Mode) => void,
}

function TopNav(props: Props) {
  let badge = <span />;

  if (props.historyBadgeCount > 0) {
    let className = "tag is-info is-light";

    if (props.isHistoryCountBadgeVisible) {
      className = "tag is-danger";
    }

    badge = <span className={className}>{props.historyBadgeCount}</span>;
  }

  return (
    <nav>
      <span id="logo_text">
        <a href="#speak" onClick={() => props.switchModeCallback(Mode.SPEAK_MODE)}><span 
          className="vo">Vo</span><span className="codes">codes</span></a>
      </span>
      <a href="#video" onClick={() => props.switchModeCallback(Mode.SPEAK_MODE)}>TTS</a>
      <a href="#video" onClick={() => props.switchModeCallback(Mode.VIDEO_MODE)}>Video</a>
      <a href="#history" onClick={() => props.switchModeCallback(Mode.HISTORY_MODE)}>Results {badge}</a>
      <a href="#use" onClick={() => props.switchModeCallback(Mode.ABOUT_MODE)}>About</a>
      <hr />
    </nav>
  )
}

export { TopNav };
