import React, { useCallback, useEffect, useState } from "react";
import {
  faBarsStaggered,
  faDeleteLeft,
  faEdit,
  faEye,
  faMemo,
  faMemoCircleInfo,
  faMessages,
  faTrash,
  faWaveformLines,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Panel from "components/common/Panel/Panel";
import { Link } from "react-router-dom";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import PageHeader from "components/layout/PageHeader";
import { CommentComponent } from "v2/view/_common/comments/CommentComponent";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import Container from "components/common/Container/Container";
import TextArea from "components/common/TextArea";
import { Button } from "components/common";
import { SessionTtsInferenceResultList } from "v2/view/_common/SessionTtsInferenceResultsList";
import { InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import { faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { GetVoice } from "@storyteller/components/src/api/voice_designer/voices/GetVoice";

interface VoiceDesignerUseVoicePageProps {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  inferenceJobs: Array<InferenceJob>;
  ttsInferenceJobs: Array<TtsInferenceJob>;
}

export default function VoiceDesignerUseVoicePage(
  props: VoiceDesignerUseVoicePageProps
) {
  const { voice_token } = useParams<{ voice_token: string }>();
  const [textBuffer, setTextBuffer] = useState("");
  const [titleTest, setTitleTest] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  //Test Get voice details
  const getVoiceDetails = useCallback(async (voice_token: string) => {
    try {
      console.log("Fetching details for token:", voice_token);
      let result = await GetVoice(voice_token, {});
      console.log("API Response:", result);

      if (result.title) {
        setTitleTest(result.title);
        setIsLoading(false);
      } else {
        setTitleTest("not found");
        setError(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching voice details:", error);
      setError(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getVoiceDetails(voice_token);
  }, [voice_token, getVoiceDetails]);

  const title = titleTest;
  const subText = (
    <div>
      Voice Designer TTS model by{" "}
      <Link to="/profile/Vegito1089">Vegito1089</Link>
    </div>
  );
  // const tags = ["Speaking", "English", "Character", "Singing", "Spanish"];

  let modelCreatorLink = <Link to="">Creator Name</Link>;
  let modelTitle = title;
  let modelDescription = "This is a description of the model";
  let modelUseCount = 10000;
  let modelLanguage = "English";
  let modelType = "RVCv2";
  let modelUploadDate = "2021-09-10T06:15:04Z";
  let modelVisibility = (
    <div>
      <FontAwesomeIcon icon={faEye} className="me-2" />
      Public
    </div>
  );
  let modelCreatorBanned = "good standing";
  let modelCreationIp = "0.0.0.0.0";
  let modelUpdateIp = "0.0.0.0.0";
  let frontPageFeatured = "no";
  let moderatorDeletedAt = "not deleted";
  let userDeletedAt = "not deleted";

  // if (voices.data) {
  //   modelCreatorLink = <Link to="">{voices.data.creator.username}</Link>;
  //   modelTitle = voices.data.title;
  //   modelDescription = "This is a dynamic description of the model";
  // }

  const voiceDetails = [
    { label: "Creator", value: modelCreatorLink },
    { label: "Title", value: modelTitle },
    { label: "Use count", value: modelUseCount },
    { label: "Spoken language", value: modelLanguage },
    { label: "Model type", value: modelType },
    { label: "Upload date (UTC)", value: modelUploadDate },
    { label: "Visibility", value: modelVisibility },
  ];

  const voiceDetailsModerator = [
    { label: "Creator is banned?", value: modelCreatorBanned },
    { label: "Creation IP address", value: modelCreationIp },
    { label: "Update IP address", value: modelUpdateIp },
    { label: "Mod deleted at (UTC)", value: moderatorDeletedAt },
    { label: "User deleted at (UTC)", value: userDeletedAt },
    { label: "Front page featured?", value: frontPageFeatured },
  ];

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => {
    const textValue = (ev.target as HTMLTextAreaElement).value;
    setTextBuffer(textValue);
  };

  if (!voice_token) {
    return <div>Voice token not found.</div>;
  }

  return (
    <Container type="panel">
      <PageHeader title={title} subText={subText} />

      <Panel padding={true} mb={true}>
        <form onSubmit={handleFormSubmit}>
          <div className="row g-4">
            <div className="col-12 col-lg-6 d-flex flex-column gap-3">
              <h4>
                <FontAwesomeIcon icon={faWaveformLines} className="me-3" />
                Use Voice
              </h4>
              <TextArea
                placeholder="Enter text you want your character to say here..."
                value={textBuffer}
                onChange={handleChangeText}
                rows={8}
              />
              <div className="d-flex gap-3">
                <Button icon={faVolumeUp} label="Speak" full={true} />
                <Button
                  icon={faDeleteLeft}
                  label="Clear"
                  full={true}
                  variant="danger"
                />
              </div>
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column gap-3">
              <h4>
                <FontAwesomeIcon icon={faBarsStaggered} className="me-3" />
                Session TTS Results
              </h4>
              <div className="d-flex flex-column gap-3 session-tts-section">
                <SessionTtsInferenceResultList
                  inferenceJobs={props.inferenceJobs}
                  ttsInferenceJobs={props.ttsInferenceJobs}
                  sessionSubscriptionsWrapper={
                    props.sessionSubscriptionsWrapper
                  }
                />
              </div>
            </div>
          </div>
        </form>
      </Panel>

      {modelDescription && (
        <Panel padding mb>
          <h4 className="mb-4">
            <FontAwesomeIcon icon={faMemo} className="me-3" />
            Description
          </h4>
          <p>{modelDescription}</p>
        </Panel>
      )}

      <Panel padding mb>
        <h4 className="mb-4">
          <FontAwesomeIcon icon={faMemoCircleInfo} className="me-3" />
          Voice Details
        </h4>
        <table className="table">
          <tbody>
            {voiceDetails.map((item, index) => (
              <tr key={index}>
                <th scope="row" className="fw-semibold">
                  {item.label}
                </th>
                <td>{item.value}</td>
              </tr>
            ))}
            {props.sessionWrapper.canBanUsers() &&
              voiceDetailsModerator.map((item, index) => (
                <tr key={index}>
                  <th scope="row" className="fw-semibold">
                    {item.label}
                  </th>
                  <td>{item.value}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {props.sessionWrapper.canBanUsers() && (
          <div className="d-flex flex-column flex-md-row gap-3 mt-5">
            <Link className={"btn btn-secondary w-100"} to="">
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              Edit Model Details
            </Link>
            <Link className="btn btn-destructive w-100" to="">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              Delete Model
            </Link>
          </div>
        )}
      </Panel>

      <Panel padding className="mb-5">
        <h4 className="mb-4">
          <FontAwesomeIcon icon={faMessages} className="me-3" />
          Comments
        </h4>
        <CommentComponent
          entityType="user"
          entityToken="test"
          sessionWrapper={props.sessionWrapper}
        />
      </Panel>
    </Container>
  );
}
