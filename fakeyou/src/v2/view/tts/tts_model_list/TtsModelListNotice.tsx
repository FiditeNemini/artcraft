import React from 'react';

interface Props {
}

function TtsModelListNotice(props: Props) {
  return (
    <article className="message is-link">
    <div className="message-body">
      You might have noticed a name change. <em>Vocodes</em> is now <strong><em>FakeYou</em></strong>!
      Why the change? Not many know what vocoders are, so the old name was kind of silly. 
      We've also got lots of ambitious plans for the future, including a full set of production tools, 
      so stay tuned.
    </div>
    </article>
  )  
}

export { TtsModelListNotice }
