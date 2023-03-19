import React from 'react';
import { Mode } from '../AppMode'

interface Props {
  mode: Mode,
  switchModeCallback: (mode: Mode) => void,
}

function Footer(props: Props) {
  return (
    <footer>
      {/*<p>
        Made in Atlanta by&nbsp;
        <a href="https://twitter.com/echelon">@echelon</a>.
      </p>*/}
      <p>
        Want more? <a href="https://vo.codes">Try over 50 cartoon and celebrity voices on vo.codes</a>.
      </p>
      <p>
        By using this, you agree to&nbsp;
        <a href="#terms" 
          onClick={() => props.switchModeCallback(Mode.TERMS_MODE)}>the things</a>.
      </p>
    </footer>
  )
}

export { Footer };
