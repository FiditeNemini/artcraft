import React from 'react';

interface Props {
  resetModeCallback: () => void,
}

function TermsComponent(props: Props) {
  return (
    <div id="terms" className="content is-4">
        <h1 className="title is-3"> Terms and Conditions</h1>


        <h2>Don't use this website for mischief.</h2>

        <p>Please have fun with this app amongst your friends and colleages, but don't
        do anything stupid. The actions you take are your own, and I am not responsible
        for any trouble you might get into<sup>&dagger;</sup>. Use your best judgment.</p>

        <h1 className="title is-4"> Artistic Intent </h1>

        <p>This website is a form of artistic expression, parody, and engineering creativity.
        It is not meant to be harmful to anyone in any way. The audio generated is sufficiently
        poor in quality and should not be confused with actual speech. Everyone should be
        able to have a good laugh.</p>

        <h2>Deep fakes are good.</h2>

        <p>So-called <em>deep fakes</em> are not much different for us today than Photoshop
        was for new users of the World Wide Web back in the 90s. It's impressive new technology
        that defies our expectations. Instead of just pictures, machine learning can generate
        complex shapes in all sorts of signal domains. It's really impressive stuff.</p>

        <p>If you restrict the technology out of fear, it becomes the tool of state actors.
        If it's left wide open, it's just a toy. Society will learn to accept and enjoy it just
        as we did with Photoshop.</p>

        <p>
          Furthermore, this technology will propel us into a new era of creative productivity.
          We'll democratize music, giving voices to those who have none. We'll enhance film making, 
          making it possible for small teams to make movies visually comperable to big-budget 
          Hollywood films. We'll empower artists to make things they couldn't even dream of.
          This is one of the most exciting fields in the world right now.
        </p>


        <p>Our brains are already capable of reading passages in other people's voices and
        picturing vivid scenes without them ever existing. Deep models give computers the
        ability to do the same thing. That's powerful. This and related advances in computer
        vision will unlock a higher order of creativity than was ever before possible.</p>

        <p><em>Don't legislate deep fakes.</em></p>

        <p><sup>&dagger;</sup> Anyone can download Tacotron from Github to produce the same
        results on their own. Vocodes.com is not connected with your activities.</p>
        
      <button onClick={() => props.resetModeCallback()}>Go Back</button>
    </div>
  )
}

export { TermsComponent };
