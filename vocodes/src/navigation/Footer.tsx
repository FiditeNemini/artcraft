import React from 'react';
import { Mode } from '../AppMode'

interface Props {
  mode: Mode,
  switchModeCallback: (mode: Mode) => void,
}

function Footer(props: Props) {
  return (
    <footer>
      <p>
        Made in Atlanta by
        <a href="https://twitter.com/echelon">@echelon</a>.
      </p>
      <p>
        By using this, you agree to the
        <a href="#terms" 
          onClick={() => props.switchModeCallback(Mode.TERMS_MODE)}>terms of use</a>.
      </p>
      <div className="social">
        <a href="https://discord.gg/wr82xGc" target="_blank" rel="noopener noreferrer"><img src="/social-icons/016-discord.png" alt="Join us on Discord!" /></a>
        <a href="https://twitter.com/echelon" target="_blank" rel="noopener noreferrer"><img src="/social-icons/096-twitter.png" alt="Twitter" /></a>
        <a href="https://facebook.com/vocodes" target="_blank" rel="noopener noreferrer"><img src="/social-icons/024-facebook.png" alt="Facething" /></a>
      </div>
    </footer>
  )
}

export { Footer };
