import React from 'react';
import { DiscordLink } from '../../_common/DiscordLink';

interface Props {
  clearLanguageNotice: () => void,
}

function LanguageNotice (props: Props) {
  return (
    <>
      {/* Alternate style message flash:
      <article className="message is-link">
        <div className="message-body">
          <em>Vocodes</em> is now <strong><em>FakeYou</em></strong>!
          Why the change? Not many know what vocoders are, so the old name was kind of silly. 
          We've also got lots of ambitious plans for the future, including a full set of virtual
          production and deepfake tools, so stay tuned.
        </div>
      </article>*/}
      <div className="notification is-link">
        <button className="delete" onClick={() => props.clearLanguageNotice()}></button>
        <h1>¡Bienvenidos!</h1>
        <p>Tenemos modelos de habla hispana. Echa un vistazo a la categoría "Español".</p>
        <p>Podemos ayudarte a hacer tus propias voces.&nbsp;
          <DiscordLink text="Únete a nuestro chat Discord" iconAfterText={true} />. 
          Pagaremos por los primeros veinte modelos subidos.</p>
      </div>
    </>
  )  
}

export { LanguageNotice }
