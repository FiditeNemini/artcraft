import React from 'react';

interface Props {
  resetModeCallback: () => void,
}

function AboutComponent(props: Props) {
  return (
    <div id="usage" className="content is-4">
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

      <p>
        Vocodes is not my startup, it's just a fun hobby that illustrates the kind of deep work I do.
        I'm not ready to give up the kind of equity that funds such as 
        Apollo Projects want this early on, but nevertheless I included Sam Altman and friends so that they'll 
        recognize me when the time comes.
      </p>

      <p>
        If you're dead set in helping me build something truly impressive that will strike a giant industry
        from existence and replace it with something several orders of magnitue cheaper and more accessible, 
        and you want me to accomplish that 
        <em>now</em>, consider buying Vocodes.com so that I can in turn buy all the expensive equipment I need. 
        I'm by no means relying on nor anticipating this, but I'll be able to speed up my work dramatically.
        It's not low hanging CRUD fruit, but it is important and transformative and I believe in it wholeheartedly.
      </p>

      {/*<h1 className="title is-4"> Hello VC</h1>

      <p>
        Please buy this stupid app so Brandon has the capital to work on something world-changing.
      </p>

      <p>
        You can get in touch with Brandon via Twitter (@echelon) or Gmail (echelon@).
        He'll accept $3M at $30M (OBO), standard pro rata rights and no board seat. This isn't the 
        problem he's solving; rather, he's making several quadratic human processes linear and automated, 
        Uber-ing a vast industry that isn't ready for change. This makes a lot of people very happy, 
        and a few people rather upset. The world isn't the same anymore.
      </p>
        
      <p>
        If $3M is too much, I'll throw in Vocodes.com (again, unrelated to my product). I won't just 
        accept this from anyone. Only qualified mentors that want a three comma exit in an exciting
        new market. Get in touch and I'll send you my pitch.
      </p>*/}

      {/*<h1 className="title is-4"> Updates </h1>
      <h2 className="subtitle is-5">
        July 24, 2020: Lots of updates.
      </h2>
      <p>I don't always keep this list updated with changes, but yesterday I knocked out a lot of work.</p>

      <p>
        I took a day OOO to help my partner with immigration paperwork, and I closed out the day
        by knocking out a number of unfinishd tasks on Vocodes. I added nine new voices, scaled 
        the cluster, and made numerous backend improvements.
      </p>

      <h2 className="subtitle is-5">
        July 12, 2020: HTML rewrite.
      </h2>

      <p>
        I can do HTML, CSS, and responsive design. I just don't have the time to roll my own with all
        other (more important) work that must be done, so I ported to Bulma instead.
      </p>

      <h2 className="subtitle is-5">
        July 10, 2020: Social media + new models.
      </h2>

      <p>
        I'm going to be setting aside some time to promote the site. Once I get it running, I'll see
        if I can outsource so that I can focus on product development.
      </p>

      <p>Also, David Attenborough and Richard Nixon join the party.</p>

      <h2 className="subtitle is-5">
        July 4, 2020: Website improvements.
      </h2>

      <p>
        Now you can download and reply previously generated speech from the "History" tab.
        I'll also work on testing the website on a variety of browsers, platforms, and 
        devices to ensure it works. Making the website friendly for mobile devices is also
        a priority.
      </p>

      <h2 className="subtitle is-5">
        June 14, 2020: New website.
      </h2>

      <p>
        I'm creating models for a variety of speakers.
      </p>

      <h2 className="subtitle is-5">
        June 7, 2020: Website rewrite.
      </h2>

      <p>
        I rewrote the incredibly dated frontend in React and added help, news, and other
        information. The frontend won't be a huge concern for me going forward, but I'll
        periodically continue to make upgrades. One critical feature I intend to add is the 
        ability to download audio files and replay them.
      </p>

      <h2 className="subtitle is-5">
        June 4, 2020: There's a new model.
      </h2>

      <p>
        I replaced the old model with a completely new one that doesn't crash and is a 
        10x speed up over the last one. While it doesn't currently sound as good as the 
        old model, the performance improvements were good enough to warrant using it 
        immediately. I'll make it sound better soon. So many things in the pipeline...
      </p>

      <h2 className="subtitle is-5">
        May 30, 2020: Intermittent failure.
      </h2> 

      <p>
        There's now another issue with how models are distributed to the workers. I have 
        a solution in the works and expect it to be in place before morning tomorrow.
      </p>

      <h2 className="subtitle is-5">
        May 25, 2020: I'm actively working on development.
      </h2>

      <p>
        This site has been sitting in limbo for four years. It used to use concatenative
        TTS, but now uses Tacotron. I've been working on ML for the past year, but haven't
        taken the time to update this website.
      </p>
      
      <p>
        I've got an improved model in the works, and I'm focused on scaling the cluster.
        There's an occasional server crash bug I'm chasing down (right now the server 
        instances respawn when they die). The frontend will be updated soon to no longer
        cache results.
        </p>*/}

      <h1 className="title is-4">Usage Recommendations</h1>

      <h2 className="subtitle is-5">
        Short sentences are bad
      </h2>

      <p>
        Don't say things like "hello" or "hi". They're too short for the current 
        model to generate good audio from. This may improve in the future, but it 
        is low on the list of priorities.
      </p>

      <h2 className="subtitle is-5">
        Try your sentences again
      </h2>

      <p>
        If you're unhappy with how the results sound, try changing the words a litle. 
        Experiment. Try adding punctuation, such as periods and question marks.
      </p>

      <h2 className="subtitle is-5">Use real words</h2>

      <p>
        "Asdfagdadf" is not a word, and the models won't know how to say it. The technical
        reason is that I use CMUdict lookup and there are "only" 140,000 entries (plus a 
        few I've made). In the future there will be an additional model step to predict
        phonemes from graphemes or words.
      </p>

      <h2 className="subtitle is-5">Sound out difficult words</h2>
      
      <p>
        To make unpronounceable words work, try sounding them out: "pikachu is a pokemon"
        can be rewritten as "peek ah choo is a poke ay mon". You can use "Fort Night" 
        instead of "Fortnite". 
      </p>

      <h1 className="title is-4">Contact</h1>

      <p>
        I'm "echelon" on Gmail, Twitter, and Hacker News. Say hi.
      </p>

      <div className="columns is-mobile">
        <div className="column">
          <figure className="image is-square">
            <img src="/logos/pytorch.png" alt="models are written in pytorch" />
          </figure>

        </div>
        <div className="column">
          <figure className="image is-square">
            <img src="/logos/kubernetes.png" alt="the cluster scales with k8s" />
          </figure>
        </div>
        <div className="column">
          <figure className="image is-square">
            <img src="/logos/rust.png" alt="core server components are written in Rust" />
          </figure>
        </div>
      </div>

      <button className="button is-link is-medium" onClick={() => props.resetModeCallback()}>Go Back</button>
    </div>
  )
}

export { AboutComponent };
