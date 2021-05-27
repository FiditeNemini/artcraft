import React from 'react';
import { FirehoseComponent } from './firehose/FirehoseComponent';
import { LoginComponent } from './login/LoginComponent';
import { LoginFunctionalComponent } from './login/LoginFunctionalComponent';
import { NewTopNav } from './NewTopNav';
import { ProfileComponent } from './profile/ProfileComponent';
import { ProfileDataComponent } from './profile_data/ProfileDataComponent';
import { SessionWrapper } from '../session/SessionWrapper';
import { SignupComponent } from './signup/SignupComponent';
import { Switch, Route, RouteProps } from 'react-router-dom';
import { TtsModelListComponent } from './tts_model/TtsModelListComponent';
import { UploadChoiceFc } from './upload/UploadChoiceFc';
import { UploadW2lPhotoFc } from './upload/UploadW2lPhotoFc';
import { UploadW2lVideoFc } from './upload/UploadW2lVideoFc';
import { W2lTemplateListFc } from './w2l_template_list/W2lTemplateListFc';
import { UploadTtsModelFc } from './upload/UploadTtsModelFc';
import { UploadComponent } from './upload/UploadComponent';

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionAction: () => void,
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
              <LoginFunctionalComponent
                sessionWrapper={this.props.sessionWrapper}
                querySessionAction={this.props.querySessionAction}
              />
            </Route>


            <Route path="/profile/:username/data"
              render={(routeProps: RouteProps) => (
                <ProfileDataComponent
                  querySessionCallback={()=>{}}
                  sessionWrapper={this.props.sessionWrapper}
                  routeProps={routeProps}
                />
              )}
            />

            <Route path="/profile/:username"
              render={(routeProps: RouteProps) => (
                <ProfileComponent
                  querySessionCallback={()=>{}}
                  sessionWrapper={this.props.sessionWrapper}
                  routeProps={routeProps}
                />
              )}
            />

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

            <Route path="/video">
              <W2lTemplateListFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/upload/w2l_photo">
              <UploadW2lPhotoFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/upload/w2l_video">
              <UploadW2lVideoFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/upload/tts">
              <UploadTtsModelFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/upload">
              <UploadChoiceFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/upload2">
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
