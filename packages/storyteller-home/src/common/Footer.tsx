import React from 'react';
import { GitSha } from '@storyteller/components/src/elements/GitSha';

interface Props {
}

function Footer(props: Props) {
  return (
    <>
      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            Copyright &copy; 2020 &mdash; 2022 Learning Machines, Inc. (makers of FakeYou and Storyteller)
          </p>
          <p>
            <GitSha />
          </p>
        </div>
      </footer>
    </>
  )
}

export { Footer }