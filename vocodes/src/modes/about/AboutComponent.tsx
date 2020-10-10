import React from 'react';

interface Props {
  resetModeCallback: () => void,
}

function AboutComponent(props: Props) {
  return (
    <div id="usage" className="content is-4 is-size-5">
      <h1 className="title is-4"> What is this? </h1>

      <p>
        This is Brandon's this pandemic side project. When he's not
        <a href="https://www.youtube.com/watch?v=x034jVB1avs" target="_blank" rel="noopener noreferrer">building
        games to play on the side of skyscrapers</a>, or working to replace a slow quadratic time industry with
        something linear and automated, he's doing crazy stuff like this.
      </p>

      <p>
        Your brain was already capable of imagining things spoken in other people's voices. This is
        a demonstration of how far computers have caught up. One day computers will be able to
        bring all of the rich and vivid imagery of your hopes and dreams to life. There's never been a
        better time throughout all history to be a creative than now.
      </p>

      <h1 className="title is-4"> Technology disclosure </h1>

      <p>
        <em>I'll be happy to remove any of the voices featured here for any reason.</em>
        &nbsp;
        I'm not a jerk, and I don't want anything in return. I don't mean to offend any parties, and my hope
        is that everyone will think this is really cool (like the laser video I linked above).
      </p>

      <p>
        The technology to clone voices is already out in the open, and 13 year olds are already replicating
        these results on thier own at home. People are making voices from all sorts of public figures
        (independent of me and my work) and posting them on YouTube and social media.
      </p>

      <p>
        Even if the United States chooses to ban this technology, institutions in China, Japan,
        and other countries all over the world are rapidly conducting and publishing research
        on this topic. People everywhere have access to this easy-to-use technology. State actors
        probably have even more sophisiticated versions available.
      </p>

      <p>
        This is kind of like Photoshop when it first came out. It's impressive, maybe a little scary, but it's
        about to become the new norm.
      </p>

      <p>
        As an interesting asside, the voices you are actually hearing are Linda Johnson or myself with a little
        bit layered on top. All voices have the same fundamental behavior and representation and only vary in
        a few paramenters.
      </p>

      <p>
        <a href="https://github.com/NVIDIA/tacotron2" target="_blank" rel="noopener noreferrer">NVIDIA
        makes these tools publicly available for you to make your own voice models</a>. Check it out!
      </p>

      <h1 className="title is-4"> Usage recommendations </h1>

      <p>
        <b>Short sentences don't work.&nbsp;</b>
        Don't say things like "hello" or "hi". They're too short for the model
        to generate good audio from. This may improve in the future, but it's
        low on the list of priorities.
      </p>

      <h2 className="subtitle is-5">
        Try your sentences again
      </h2>

      <p>
        If you're unhappy with how the results sound, try changing the words a litle.
        Experiment. Try adding punctuation, such as periods and question marks. Even
        submitting the same sentence twice may yield different results.
      </p>

      <h2 className="subtitle is-5">Sound out difficult words</h2>

      <p>
        To make unpronounceable words work, try sounding them out: "pikachu is a pokemon"
        can be rewritten as "peek ah choo is a poke ay mon". You can use "Fort Night"
        instead of "Fortnite".
      </p>

      <h1 className="title is-4">Thanks</h1>

      <p>
        Thanks to the following individuals (in no particular order) for help with data
        gathering and annotation, Discord moderation, etc.
      </p>

      <p>
        Vegito1089,
        Shin,
        Ashurath,
        MakaveliGH,
        Blutarch Mann,
        Yahia,
        Tim Squid,
        Seuneramet,
        Matt,
        Seth
      </p>

      <h1 className="title is-4">Contact</h1>

      <p>
        I'm "echelon" on Gmail, Twitter, and Hacker News. Say hi.
      </p>

      <p>
        &mdash; Learning Machines, LLC
      </p>

      <div className="columns is-mobile is-gapless">
        <div className="column">
          <figure className="image is-square is-fullwidth vocodes-grid-marginless">
            <img src="/logos/pytorch.png" alt="models are written in pytorch" />
          </figure>
        </div>
        <div className="column">
          <figure className="image is-square is-fullwidth vocodes-grid-marginless">
            <img src="/logos/rust.png" alt="core server components are written in Rust" />
          </figure>
        </div>
        <div className="column">
          <figure className="image is-square is-fullwidth vocodes-grid-marginless">
            <img src="/logos/kubernetes.png" alt="the cluster scales with k8s" />
          </figure>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <button className="button is-link is-medium" onClick={() => props.resetModeCallback()}>Go Back</button>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          {/* Necessary to break before the footer. */}
        </div>
      </div>

    </div>
  )
}

export { AboutComponent };
