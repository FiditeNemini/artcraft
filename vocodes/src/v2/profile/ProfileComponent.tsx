import React from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { RouteProps } from 'react-router-dom';

interface ProfileResponsePayload {
  success: boolean,
  error_reason?: string,
  user?: UserPayload,
}

interface UserPayload {
  user_token: string,
  username: string,
  display_name: string,
  email_gravatar_hash: string,
  profile_markdown: string,
  profile_rendered_html: string,
  user_role_slug: string,
  banned: boolean,
  dark_mode: string,
  avatar_public_bucket_hash: string,
  disable_gravatar: boolean,
  hide_results_preference: boolean,
  discord_username?: string,
  twitch_username?: string,
  twitter_username?: string,
  created_at: string,
}

interface Props {
  routeProps: RouteProps,
  sessionWrapper: SessionWrapper,
  querySessionCallback : () => void,
}

interface State {
  user?: UserPayload,
}

class ProfileComponent extends React.Component<Props, State> {

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

      const profileResponse : ProfileResponsePayload = res;

      if (profileResponse === undefined) {
        return; // Endpoint error?
      }

      if (!profileResponse.success) {
        return;
      }

      this.setState({
        user: profileResponse.user
      });
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
    if (this.state.user === undefined) {
      return (
        <div></div>
      );
    }

    let gravatar = <span />;
    if (this.state.user!.email_gravatar_hash !== undefined) {
      const hash = this.state.user!.email_gravatar_hash;
      const size = 50;
      const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size}`
      gravatar = <img alt="gravatar" src={gravatarUrl} />
    }

    return (
      <div>
        <h1 className="title is-1"> {gravatar} {this.state.user!.display_name} </h1>
        <p>Profiles are a work in progress.</p>
      </div>
    )
  }
}

export { ProfileComponent };