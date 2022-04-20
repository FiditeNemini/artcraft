import React from 'react';

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
        </div>
      </footer>
    </>
  )
}

export { Footer }