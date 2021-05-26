import React from 'react';
import { NewTopNav } from '../v1/navigation/NewTopNav';
import { LoginComponent } from './login/LoginComponent';
import { SignupComponent } from './signup/SignupComponent';
import { Switch, Route } from 'react-router-dom';
import { SessionWrapper } from '../session/SessionWrapper';


interface Props {
  sessionWrapper: SessionWrapper,
}

interface State {
}

class NewVocodesContainer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
    }
  }

  logout = () => {
  }

  public render() {
    return (
      <div id="main" className="mainwrap">
        <div id="viewable">

          <NewTopNav
            logoutHandler={this.logout}
            sessionWrapper={this.props.sessionWrapper}
            />

          <Switch>
            <Route path="/login">
              <LoginComponent 
                querySessionCallback={()=>{}}
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/signup">
              <SignupComponent
                querySessionCallback={()=>{}}
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>
          </Switch>

        </div>
      </div>
    )
  }
}

export { NewVocodesContainer }
