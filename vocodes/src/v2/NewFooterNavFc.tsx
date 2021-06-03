import React from 'react';
import { SessionWrapper } from '../session/SessionWrapper';
import { Link } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
}

function NewFooterNavFc(props: Props) {
  return (
    <footer>
      <hr />
      <p>
        We're trying to build a democratized <a href="https://the.storyteller.company">future of creativity, filmmaking and storytelling</a>.
      </p>
      <p>
        Contact <Link to="/profile/echelon">@echelon</Link> for more information.
      </p>
    </footer>
  )
}

export { NewFooterNavFc };
