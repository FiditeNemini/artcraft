import React from 'react';
import { NewTopNav } from './NewTopNav';
import { LoginComponent } from './login/LoginComponent';
import { SignupComponent } from './signup/SignupComponent';
import { Switch, Route } from 'react-router-dom';
import { SessionWrapper } from '../session/SessionWrapper';
import { UploadComponent } from './upload/UploadComponent';
import { FirehoseComponent } from './firehose/FirehoseComponent';
import { ProfileComponent } from './profile/ProfileComponent';
import { TtsModelListComponent } from './tts_model/TtsModelListComponent';
import { W2lTemplateListComponent } from './w2l_template_list/W2lTemplateListComponent';

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
            <Route path="/firehose">
              <FirehoseComponent
                querySessionCallback={()=>{}}
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/login">
              <LoginComponent 
                querySessionCallback={()=>{}}
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/profile">
              <ProfileComponent
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

            <Route path="/tts">
              <TtsModelListComponent
                querySessionCallback={()=>{}}
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/w2l">
              <W2lTemplateListComponent
                querySessionCallback={()=>{}}
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/upload">
              <UploadComponent
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
