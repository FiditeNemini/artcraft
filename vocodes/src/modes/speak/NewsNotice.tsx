import React from 'react';

interface Props {
  showNewsNotice: boolean,
  toggleNewsNoticeCallback: () => void,
}

interface State {
}

class NewsNotice extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {
    if (!this.props.showNewsNotice) {
      return <article />;
    }

    return (
      <article className="message is-info news-notice">
        <div className="message-header">
          <p>Join our Twitch for Early Access</p>
          <button className="delete" aria-label="delete" onClick={() => this.props.toggleNewsNoticeCallback()}></button>
        </div>
        <div className="message-body">

          <div className="columns is-mobile is-centered is-vcentered">
            <div className="column is-one-third">
              <a href="https://twitch.tv/vocodes" target="_blank" rel="noopener noreferrer"><img 
                src="/banner/banner.webp" alt="Follow us on Twitch!" /></a>
            </div>
            <div className="column is-two-thirds">
                <p>
                  <a href="https://twitch.tv/vocodes" target="_blank" rel="noopener noreferrer">Follow us on Twitch!</a> We're
                  building streaming tools that will incorporate deep fake technology and audience interaction. You'll be able
                  to use this for your streams, too.
                </p>
                <br />
                <p>
                  You get early and exclusive access to new voices. We're also giving away $100 in prizes with every stream. 
                  Please check us out! <a href="https://twitch.tv/vocodes" target="_blank" rel="noopener noreferrer">Follow for notifications!</a> 
                </p>
                <br />
                <p>Early access voices: Goku, Tails, Knuckles, MJ, and more...</p>
            </div>
          </div>

        </div>
      </article>
    );
  }
}

export { NewsNotice }