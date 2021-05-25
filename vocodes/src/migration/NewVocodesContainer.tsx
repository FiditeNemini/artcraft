import React from 'react';
import { NewTopNav } from '../navigation/NewTopNav';


enum NewMode {
  LOGIN_MODE,
  SIGNUP_MODE,
  COMMUNITY_TTS_MODE,
  COMMUNITY_W2L_MODE,
  UPLOAD_MODE,
  MY_DATA_MODE,
  MY_PROFILE_MODE,
  EDIT_MY_PROFILE_MODE,
}

interface Props {
}

interface State {
  mode: NewMode,
}

class NewVocodesContainer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      mode: NewMode.SIGNUP_MODE,
    }
  }

  switchMode = (mode: NewMode) => {
    this.setState({mode: mode});
  }

  logout = () => {
  }

  public render() {
    let innerComponent = <div />;

    return (
      <div id="main" className="mainwrap">
        <div id="viewable">

          <NewTopNav
            mode={this.state.mode}
            switchModeCallback={this.switchMode}
            logoutHandler={this.logout}
            />

          {innerComponent}


        </div>
      </div>
    )
  }
}

export { NewVocodesContainer, NewMode }
