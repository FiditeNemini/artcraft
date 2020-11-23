import React from 'react';

interface Props {
}

interface State {
  queueLength: number,
  queueHeadPosition: number,
  queueTailPosition: number,
}

class VideoStatsComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      queueLength: 0,
      queueHeadPosition: 0,
      queueTailPosition: 0,
    };
  }

  componentDidMount() {
    console.log('component did mount');
    this.pollStats();
    setTimeout(() => this.pollStats(), 5000);
  }

  pollStats = () => {
    fetch("https://grumble.works/job")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            queueLength: result.queue_length,
            queueHeadPosition: result.queue_head_position,
            queueTailPosition: result.queue_tail_position,
          })
        }
      );
  }

  public render() {
    let queueLength = this.state.queueLength;
    return (
      <div className="content is-size-4">
        <p>
          <strong>Queue Length: {queueLength}</strong> (Each takes ~1-5 minutes) 
        </p>
      </div>
    )
  }
}

export { VideoStatsComponent }
