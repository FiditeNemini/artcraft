import React from 'react';
import { FirehoseComponent } from './firehose/FirehoseComponent';
import { LoginFc } from './login/LoginFc';
import { NewTopNavFc } from './NewTopNavFc';
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
import { W2lTemplateViewFc } from './w2l_template_view/W2lTemplateViewFc';
import { ProfileDataFc } from './profile_data/ProfileDataFc';

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

          <NewTopNavFc
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
              <LoginFc
                sessionWrapper={this.props.sessionWrapper}
                querySessionAction={this.props.querySessionAction}
              />
            </Route>


            <Route path="/profile/:username/data"
              render={(routeProps: RouteProps) => (
                <ProfileDataFc
                  sessionWrapper={this.props.sessionWrapper}
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

            <Route path="/w2l/:templateSlug">
              <W2lTemplateViewFc
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
