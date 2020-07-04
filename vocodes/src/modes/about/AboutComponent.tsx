import React from 'react';

interface Props {
  resetModeCallback: () => void,
}

function AboutComponent(props: Props) {
  return (
    <div id="usage">
      <h1> Updates </h1>
      <h2>
        July 4, 2020: Website improvements.
      </h2>

      <p>
        Now you can download and reply previously generated speech from the "History" tab.
        I'll also work on testing the website on a variety of browsers, platforms, and 
        devices to ensure it works. Making the website friendly for mobile devices is also
        a priority.
      </p>

      <h2>
        June 14, 2020: New website.
      </h2>

      <p>
        I'm creating models for a variety of speakers.
      </p>

      <h2>
        June 7, 2020: Website rewrite.
      </h2>

      <p>
        I rewrote the incredibly dated frontend in React and added help, news, and other
        information. The frontend won't be a huge concern for me going forward, but I'll
        periodically continue to make upgrades. One critical feature I intend to add is the 
        ability to download audio files and replay them.
      </p>

      <h2>
        June 4, 2020: There's a new model.
      </h2>

      <p>
        I replaced the old model with a completely new one that doesn't crash and is a 
        10x speed up over the last one. While it doesn't currently sound as good as the 
        old model, the performance improvements were good enough to warrant using it 
        immediately. I'll make it sound better soon. So many things in the pipeline...
      </p>

      <h2>May 30, 2020: Intermittent failure.</h2> 

      <p>
        There's now another issue with how models are distributed to the workers. I have 
        a solution in the works and expect it to be in place before morning tomorrow.
      </p>

      <h2>
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


      <h1>Usage Recommendations</h1>

      <h2>Short sentences are bad</h2>

      <p>
        Don't say things like "hello" or "hi". They're too short for the current 
        model to generate good audio from. This may improve in the future, but it 
        is low on the list of priorities.
      </p>

      <h2>Try and try again</h2>

      <p>
        If you're unhappy with how the results sound, try changing the words a litle. 
        Experiment. Try adding punctuation, such as periods and question marks.
      </p>

      <h2>Use real words</h2>

      <p>
        "Asdfagdadf" is not a word, and Trump won't know how to say it. 
      </p>

      <h2>Sound out difficult words</h2>
      
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

      <h2>Example sentences</h2>

      <p>Try getting Trump to say the following:</p>

      <ul>
        <li>Why does it always rain on Christmas? It's so depressing.</li>
        <li>I really appreciate how good of a friend you are.</li>
        <li>You're clearly not trying hard enough. What's up with you?</li>
        <li>The Dinosaurs were the dominant land animals of the Mesozoic era. 
          Over 500 different genera of dinosaurs are known. Fossils of dinosaurs 
          have been found on every continent, and there are still frequent 
          new discoveries.</li>
        <li>Dinosaurs had adaptations which helped make them successful. 
          The first known dinosaurs were small predators that walked on two legs. 
          All their descendants had an upright posture, with the legs underneath 
          the body. This transformed their whole lifestyle.</li>
        <li>Are you really reading this far? Good for you.</li>
      </ul>

      <h1>Help Wanted</h1>

      <h2>Training Data</h2>
      <p>
        Are you currently creating TTS models? I'd be happy to pay to license
        your annotated audio samples. Tell me what voices you have, the sample 
        rate, how noisy the data is, and a little about your annotation process.
      </p>

      <h2>3D Modeller</h2>
      <p>
        I'm looking for a 3D artist or animator to make custom models and 
        animations for various characters (speaking, walking, articulating).
        Environment, terrain, and world building skills are a huge plus.
        I could rip models from VR Chat and make an attempt myself, but I'm 
        quite busy with working on the speech engine.
      </p>

      <p>
        This is a paid position. It isn't necessarily for this project.
      </p>

      <h2>Contact</h2>

      <p>Send me a message on Twitter or Gmail (same handle).</p>

      <button onClick={() => props.resetModeCallback()}>Go Back</button>
    </div>
  )
}

export { AboutComponent };
