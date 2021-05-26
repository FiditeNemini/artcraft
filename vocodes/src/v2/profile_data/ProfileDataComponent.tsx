import React from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { RouteProps } from 'react-router-dom';

enum FieldTriState {
  EMPTY_FALSE,
  FALSE,
  TRUE,
}

interface Props {
  routeProps: RouteProps,
  sessionWrapper: SessionWrapper,
  querySessionCallback : () => void,
}

interface State {
}

class ProfileDataComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const api = new ApiConfig();
    const endpointUrl = api.getProfile(this.getUsername());

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      console.log('response', res)
      if (res.success) {
        console.log('success');
        return;
      }
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }

  getUsername() : string {
    console.log('route props', this.props.routeProps);
    return 'echelon';
  }

  public render() {
    return (
      <div>
        <h1 className="title is-1"> Profile </h1>
      </div>
    )
  }
}

export { ProfileDataComponent };