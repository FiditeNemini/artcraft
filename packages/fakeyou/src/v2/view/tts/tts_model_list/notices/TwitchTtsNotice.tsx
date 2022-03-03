import React from 'react';

interface Props {
  clearTwitchTtsNotice: () => void,
}

function TwitchTtsNotice(props: Props) {
  return (
    <>
      <div className="notification is-warning">
        <button className="delete" onClick={() => props.clearTwitchTtsNotice()}></button>
        <p>
          <strong>If you stream on Twitch, we have a brand new platform for you!</strong>
        </p>
        <br />
        <p>
          Allow us to introduce <a href="https://create.storyteller.io" target="_blank" rel="noreferrer"><strong>Storyteller</strong></a>, 
          a free, zero-download, easy to use platform that lets you use 
          FakeYou voices on your Twitch stream. Your audience can use bits, channel points, 
          and soon much more. We've got a ton of features in store. <a href="https://create.storyteller.io" target="_blank" rel="noreferrer">Try it out and 
          let us know what you think!</a>
        </p>
        <br />
        <p>You think voices are neat? Just wait until we show you what else we've been working on&hellip;</p>
      </div>
    </>
  )  
}

export { TwitchTtsNotice }
