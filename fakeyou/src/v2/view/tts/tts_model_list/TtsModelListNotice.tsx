import React from 'react';

interface Props {
}

function TtsModelListNotice(props: Props) {
  return (
    <article className="message is-link">
    <div className="message-body">
      <em>Vocodes</em> is now <strong><em>FakeYou</em></strong>!
    </div>
    </article>
  )  
}

export { TtsModelListNotice }
