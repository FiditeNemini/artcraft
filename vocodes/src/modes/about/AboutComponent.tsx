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
        games to play on the side of skyscrapers</a>, or working on his one-man film studio side hustle, he's doing 
        crazy stuff like this.
      </p>

      <p>
        Your brain was already capable of imagining things spoken in other people's voices. This is 
        a demonstration of how far computers have caught up to that. Can you imagine the day computers
        are able to bring all of the rich and vivid imagery you're capable of thinking to life? 
      </p>

      {/*<h1 className="title is-4"> Hello VC</h1>

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

      <h1 className="title is-4"> Updates </h1>
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
      </p>

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
        Try and try again
      </h2>

      <p>
        If you're unhappy with how the results sound, try changing the words a litle. 
        Experiment. Try adding punctuation, such as periods and question marks.
      </p>

      <h2 className="subtitle">Use real words</h2>

      <p>
        "Asdfagdadf" is not a word, and Trump won't know how to say it. 
      </p>

      <h2 className="subtitle">Sound out difficult words</h2>
      
      <p>
        If the words you want to use aren't working, that's likely because I trained the 
        network on phonemes instead of raw text. This phonetic information
        comes from a database, and although this database contains over 130,000 words, it 
        unfortunately doesn't have entries such as "Fortnite".
      </p>
      
      <p>
        To make this work, try sounding out the problematic words: "pikachu is a pokemon"
        can be rewritten as "peek ah choo is a poke ay mon". You can try "Fort Night" 
        instead of "Fortnite". 
      </p>

      <p>
        I'll fix this issue as soon as I can, because I know how important this is to you.
      </p>

      <h1 className="title is-4">Contact</h1>

      <button className="button is-link is-medium" onClick={() => props.resetModeCallback()}>Go Back</button>
    </div>
  )
}

export { AboutComponent };
