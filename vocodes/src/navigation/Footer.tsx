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
    </footer>
  )
}

export { Footer };
