import React from 'react';
import { FirehoseEventListFc } from './firehose/FirehoseEventListFc';
import { LoginFc } from './login/LoginFc';
import { ModerationFc } from './moderation/ModerationFc';
import { ModerationIpBanListFc } from './moderation_ip_ban_list/ModerationIpBanListFc';
import { NewFooterNavFc } from './NewFooterNavFc';
import { NewTopNavFc } from './NewTopNavFc';
import { ProfileEditFc } from './profile_edit/ProfileEditFc';
import { ProfileFc } from './profile/ProfileFc';
import { SessionWrapper } from '../session/SessionWrapper';
import { SignupComponent } from './signup/SignupComponent';
import { Switch, Route, RouteProps } from 'react-router-dom';
import { TtsInferenceJob, W2lInferenceJob } from '../App';
import { TtsModelFormFc } from './tts_model_list/TtsModelFormFc';
import { TtsModelListComponent } from './tts_model_list/TtsModelListComponent';
import { TtsModelUploadJob } from '../jobs/TtsModelUploadJobs';
import { TtsModelViewFc } from './tts_model_view/TtsModelViewFc';
import { TtsResultViewFc } from './tts_result_view/TtsResultViewFc';
import { UploadChoiceFc } from './upload/UploadChoiceFc';
import { UploadTtsModelFc } from './upload/UploadTtsModelFc';
import { UploadW2lPhotoFc } from './upload/UploadW2lPhotoFc';
import { UploadW2lVideoFc } from './upload/UploadW2lVideoFc';
import { W2lResultViewFc } from './w2l_result_view/W2lResultViewFc';
import { W2lTemplateListFc } from './w2l_template_list/W2lTemplateListFc';
import { W2lTemplateUploadJob } from '../jobs/W2lTemplateUploadJobs';
import { W2lTemplateViewFc } from './w2l_template_view/W2lTemplateViewFc';

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionAction: () => void,

  enqueueTtsJob: (jobToken: string) => void,
  ttsInferenceJobs: Array<TtsInferenceJob>,

  enqueueW2lJob: (jobToken: string) => void,
  w2lInferenceJobs: Array<W2lInferenceJob>,

  enqueueTtsModelUploadJob: (jobToken: string) => void,
  ttsModelUploadJobs: Array<TtsModelUploadJob>,

  enqueueW2lTemplateUploadJob: (jobToken: string) => void,
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>,
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
              <FirehoseEventListFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/login">
              <LoginFc
                sessionWrapper={this.props.sessionWrapper}
                querySessionAction={this.props.querySessionAction}
              />
            </Route>


            <Route path="/profile/:username/edit"
              render={(routeProps: RouteProps) => (
                <ProfileEditFc
                  sessionWrapper={this.props.sessionWrapper}
                />
              )}
            />

            <Route path="/profile/:username"
              render={(routeProps: RouteProps) => (
                <ProfileFc
                  sessionWrapper={this.props.sessionWrapper}
                />
              )}
            />

            <Route path="/signup">
              <SignupComponent
                querySessionCallback={()=>{}}
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/tts/result/:token">
              <TtsResultViewFc
                sessionWrapper={this.props.sessionWrapper}
              />
              </Route>

            <Route path="/tts/:token">
              <TtsModelViewFc
                sessionWrapper={this.props.sessionWrapper}
                enqueueTtsJob={this.props.enqueueTtsJob}
                ttsInferenceJobs={this.props.ttsInferenceJobs}
              />
            </Route>

            <Route path="/tts">
              <TtsModelListComponent
                querySessionCallback={()=>{}}
                sessionWrapper={this.props.sessionWrapper}
                enqueueTtsJob={this.props.enqueueTtsJob}
              />
            </Route>

            <Route path="/w2l/result/:token">
              <W2lResultViewFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/w2l/:templateSlug">
              <W2lTemplateViewFc
                sessionWrapper={this.props.sessionWrapper}
                enqueueW2lJob={this.props.enqueueW2lJob}
                w2lInferenceJobs={this.props.w2lInferenceJobs}
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
                w2lTemplateUploadJobs={this.props.w2lTemplateUploadJobs}
                enqueueW2lTemplateUploadJob={this.props.enqueueW2lTemplateUploadJob}
              />
            </Route>

            <Route path="/upload/w2l_video">
              <UploadW2lVideoFc
                sessionWrapper={this.props.sessionWrapper}
                w2lTemplateUploadJobs={this.props.w2lTemplateUploadJobs}
                enqueueW2lTemplateUploadJob={this.props.enqueueW2lTemplateUploadJob}
              />
            </Route>

            <Route path="/upload/tts">
              <UploadTtsModelFc
                sessionWrapper={this.props.sessionWrapper}
                ttsModelUploadJobs={this.props.ttsModelUploadJobs}
                enqueueTtsModelUploadJob={this.props.enqueueTtsModelUploadJob}
              />
            </Route>

            <Route path="/upload">
              <UploadChoiceFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/moderation/ip_bans">
              <ModerationIpBanListFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/moderation">
              <ModerationFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/">
              <TtsModelFormFc
                sessionWrapper={this.props.sessionWrapper}
                enqueueTtsJob={this.props.enqueueTtsJob}
                ttsInferenceJobs={this.props.ttsInferenceJobs}
                ttsModelUploadJobs={this.props.ttsModelUploadJobs}
                w2lInferenceJobs={this.props.w2lInferenceJobs}
                w2lTemplateUploadJobs={this.props.w2lTemplateUploadJobs}
              />
            </Route>

          </Switch>

          <NewFooterNavFc
            sessionWrapper={this.props.sessionWrapper}
            />

        </div>
      </div>
    )
  }
}

export { NewVocodesContainer }
