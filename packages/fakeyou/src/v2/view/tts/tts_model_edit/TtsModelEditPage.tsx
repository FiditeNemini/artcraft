import React, { useState, useEffect, useCallback } from "react";
import { ApiConfig } from "@storyteller/components";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import { useParams, useHistory, Link } from "react-router-dom";
import { FrontendUrlConfig } from "../../../../common/FrontendUrlConfig";
import { VisibleIconFc } from "../../_icons/VisibleIcon";
import { HiddenIconFc } from "../../_icons/HiddenIcon";
import {
  GetTtsModel,
  GetTtsModelIsErr,
  GetTtsModelIsOk,
  TtsModel,
  TtsModelLookupError,
} from "@storyteller/components/src/api/tts/GetTtsModel";
import { BackLink } from "../../_common/BackLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faHome,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import {
  DEFAULT_MODEL_LANGUAGE,
  SUPPORTED_MODEL_LANGUAGE_TAG_TO_FULL,
} from "@storyteller/components/src/i18n/SupportedModelLanguages";
import { 
  TEXT_PIPELINE_NAMES, 
  TEXT_PIPELINE_NAMES_FOR_MODERATORS,
} from "@storyteller/components/src/constants/TextPipeline";
import { distance, delay, duration } from "../../../../data/animation";

const Fade = require("react-reveal/Fade");

const DEFAULT_VISIBILITY = "public";

const DEFAULT_PRETRAINED_VOCODER = "hifigan-superres";

interface Props {
  sessionWrapper: SessionWrapper;
  enqueueTtsJob: (jobToken: string) => void;
  ttsInferenceJobs: Array<TtsInferenceJob>;
}

function TtsModelEditPage(props: Props) {
  let { token } = useParams() as { token: string };

  const history = useHistory();

  // Model lookup
  const [ttsModel, setTtsModel] = useState<TtsModel | undefined>(undefined);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  // Fields
  const [title, setTitle] = useState("");
  const [textPipelineType, setTextPipelineType] = useState<string | null>(null);
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [fullLanguageTag, setFullLanguageTag] = useState(""); // NB: Should be full IETF, eg. ["en", "en-US", "es-419", etc.]
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
  const [defaultPretrainedVocoder, setDefaultPretrainedVocoder] = useState(
    DEFAULT_PRETRAINED_VOCODER
  );
  const [isFrontPageFeatured, setIsFrontPageFeatured] = useState(false);
  const [isTwitchFeatured, setIsTwitchFeatured] = useState(false);
  const [suggestedUniqueBotCommand, setSuggestedUniqueBotCommand] =
    useState("");

  const getModel = useCallback(async (token) => {
    const model = await GetTtsModel(token);

    if (GetTtsModelIsOk(model)) {
      setTtsModel(model);

      // NB: empty string isn't a correct value for Rust to parse as an enum
      // Server will also try to send us a guess if we don't have a value set in the DB.
      setTextPipelineType(
        model.text_pipeline_type || model.text_pipeline_type_guess || null
      );

      setTitle(model.title || "");
      setDescriptionMarkdown(model.description_markdown || "");
      setFullLanguageTag(model.ietf_language_tag || DEFAULT_MODEL_LANGUAGE);
      setVisibility(model.creator_set_visibility || DEFAULT_VISIBILITY);
      setDefaultPretrainedVocoder(
        model.maybe_default_pretrained_vocoder || DEFAULT_PRETRAINED_VOCODER
      );
      setIsFrontPageFeatured(model.is_front_page_featured || false);
      setIsTwitchFeatured(model.is_twitch_featured || false);
      setSuggestedUniqueBotCommand(
        model.maybe_suggested_unique_bot_command || ""
      );
    } else if (GetTtsModelIsErr(model)) {
      switch (model) {
        case TtsModelLookupError.NotFound:
          setNotFoundState(true);
          break;
      }
    }
  }, []);

  useEffect(() => {
    getModel(token);
  }, [token, getModel]);

  const handleTitleChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const textValue = (ev.target as HTMLInputElement).value;
    setTitle(textValue);
    return false;
  };

  const handleTextPipelineChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setTextPipelineType((ev.target as HTMLSelectElement).value);
  };

  const handleDescriptionMarkdownChange = (
    ev: React.FormEvent<HTMLTextAreaElement>
  ) => {
    ev.preventDefault();
    const textValue = (ev.target as HTMLTextAreaElement).value;
    setDescriptionMarkdown(textValue);
    return false;
  };

  const handleSpokenLanguageChange = (
    ev: React.FormEvent<HTMLSelectElement>
  ) => {
    setFullLanguageTag((ev.target as HTMLSelectElement).value);
  };

  const handleVisibilityChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setVisibility((ev.target as HTMLSelectElement).value);
  };

  const handleDefaultPretrainedVocoderChange = (
    ev: React.FormEvent<HTMLSelectElement>
  ) => {
    setDefaultPretrainedVocoder((ev.target as HTMLSelectElement).value);
  };

  const handleIsFrontPageFeaturedChange = (
    ev: React.FormEvent<HTMLSelectElement>
  ) => {
    const value = !((ev.target as HTMLSelectElement).value === "false");
    setIsFrontPageFeatured(value);
  };

  const handleIsTwitchFeaturedChange = (
    ev: React.FormEvent<HTMLSelectElement>
  ) => {
    const value = !((ev.target as HTMLSelectElement).value === "false");
    setIsTwitchFeatured(value);
  };

  const handleBotCommandChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value;
    const command = value.trim();
    setSuggestedUniqueBotCommand(command);
  };

  const modelLink = FrontendUrlConfig.ttsModelPage(token);

  const isModerator = props.sessionWrapper.canEditOtherUsersTtsModels();

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (ttsModel === undefined) {
      return false;
    }

    if (title.trim() === "") {
      return false;
    }

    const modelToken = ttsModel!.model_token;

    const api = new ApiConfig();
    const endpointUrl = api.editTtsModel(modelToken);

    let request: any = {
      title: title,
      description_markdown: descriptionMarkdown,
      creator_set_visibility: visibility || DEFAULT_VISIBILITY,
      maybe_default_pretrained_vocoder:
        defaultPretrainedVocoder || DEFAULT_PRETRAINED_VOCODER,
      ietf_language_tag: fullLanguageTag || DEFAULT_MODEL_LANGUAGE,
      text_pipeline_type: textPipelineType,
    };

    if (isModerator) {
      request.is_front_page_featured = isFrontPageFeatured;
      request.is_twitch_featured = isTwitchFeatured;
      if (!!suggestedUniqueBotCommand) {
        request.maybe_suggested_unique_bot_command = suggestedUniqueBotCommand;
      }
    }

    fetch(endpointUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(request),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res === undefined || !res.success) {
          return; // Endpoint error?
        }

        history.push(modelLink);
      })
      .catch((e) => {});

    return false;
  };

  if (notFoundState) {
    return (
      <div className="container py-5">
        <div className="py-5">
          <h1 className="fw-semibold text-center mb-4">Model not found</h1>
          <div className="text-center">
            <Link className="btn btn-primary" to="/">
              Back to main
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ttsModel) {
    return <div />;
  }

  let optionalModeratorFields = <></>;

  if (isModerator) {
    let isFrontPageFeaturedFormValue = isFrontPageFeatured ? "true" : "false";
    let isTwitchFeaturedFormValue = isTwitchFeatured ? "true" : "false";

    optionalModeratorFields = (
      <>
        <div>
          <label className="sub-title">
            Is Front Page Featured? (Don't set too many!)
          </label>
          <div>
            <div className="form-group input-icon">
              <FontAwesomeIcon
                icon={faHome}
                className="form-control-feedback"
              />
              <select
                name="default_pretrained_vocoder"
                onChange={handleIsFrontPageFeaturedChange}
                value={isFrontPageFeaturedFormValue}
                className="form-select"
              >
                <option value="true">Yes (randomly used as a default)</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="sub-title">
            Is Twitch Featured? (Don't set too many!)
          </label>
          <div>
            <div className="form-group input-icon">
              <FontAwesomeIcon
                icon={faTwitch}
                className="form-control-feedback"
              />
              <select
                name="default_pretrained_vocoder"
                onChange={handleIsTwitchFeaturedChange}
                value={isTwitchFeaturedFormValue}
                className="form-select"
              >
                <option value="true">Yes (randomly used as a default)</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="sub-title">
            Command Alias (Must be unique, eg. <em>&ldquo;mario&rdquo;</em> for
            commands like <code>/tts mario It's me!</code>)
          </label>
          <div className="form-group input-icon">
            <FontAwesomeIcon icon={faRobot} className="form-control-feedback" />
            <input
              onChange={handleBotCommandChange}
              className="form-control"
              type="text"
              placeholder="Optional Unique Bot Command (short and lowercase)"
              value={suggestedUniqueBotCommand}
            />
          </div>
          {/*<p className="help">{invalidReason}</p>*/}
        </div>
      </>
    );
  }

  let usableTextPipelines = isModerator ? TEXT_PIPELINE_NAMES_FOR_MODERATORS : TEXT_PIPELINE_NAMES;

  let isDisabled = ttsModel === undefined;

  const visibilityIcon =
    visibility === "public" ? <VisibleIconFc /> : <HiddenIconFc />;

  return (
    <div>
      <div className="container py-5 pb-4 px-lg-5 px-xl-3">
        <Fade cascade bottom distance={distance} duration={duration}>
          <div className="d-flex flex-column">
            <h1 className="display-5 fw-bold mb-3">Edit Model</h1>
            <p>
              <BackLink link={modelLink} text="Back to model" />
            </p>
          </div>
        </Fade>
      </div>

      <form onSubmit={handleFormSubmit}>
        <fieldset disabled={isDisabled}>
          <Fade
            bottom
            cascade
            distance={distance}
            delay={delay}
            duration={duration}
          >
            <div className="container-panel pt-4 pb-5">
              <div className="panel p-3 py-4 p-lg-4">
                <div className="d-flex flex-column gap-4">
                  <div>
                    <label className="sub-title">Model Title</label>
                    <div className="form-group input-icon">
                      <FontAwesomeIcon
                        icon={faMicrophone}
                        className="form-control-feedback"
                      />
                      <input
                        onChange={handleTitleChange}
                        className="form-control"
                        type="text"
                        placeholder="Model Title"
                        value={title}
                      />
                    </div>
                    {/*<p className="help">{invalidReason}</p>*/}
                  </div>

                  <div>
                    <label className="sub-title">
                      Description (supports Markdown)
                    </label>
                    <div className="form-group">
                      <textarea
                        onChange={handleDescriptionMarkdownChange}
                        className="form-control"
                        placeholder="Model description (ie. source of data, training duration, etc)"
                        value={descriptionMarkdown}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="sub-title">Model Spoken Language</label>
                    <div className="form-group">
                      <select
                        onChange={handleSpokenLanguageChange}
                        value={fullLanguageTag}
                        className="form-select"
                      >
                        {Array.from(
                          SUPPORTED_MODEL_LANGUAGE_TAG_TO_FULL,
                          ([languageTag, description]) => {
                            return (
                              <option key={languageTag} value={languageTag}>
                                {description}
                              </option>
                            );
                          }
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="sub-title">Text Pipeline</label>
                    <div className="form-group">
                      <select
                        name="text_pipeline_type"
                        onChange={handleTextPipelineChange}
                        value={textPipelineType || "legacy_fakeyou"}
                        className="form-select"
                      >
                        {Array.from(
                          usableTextPipelines,
                          ([textPipelineType, description]) => {
                            return (
                              <option
                                key={textPipelineType}
                                value={textPipelineType}
                              >
                                {description}
                              </option>
                            );
                          }
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="sub-title">Default vocoder</label>
                    <div className="form-group">
                      <select
                        name="default_pretrained_vocoder"
                        onChange={handleDefaultPretrainedVocoderChange}
                        value={defaultPretrainedVocoder}
                        className="form-select"
                      >
                        <option value="hifigan-superres">
                          HiFi-Gan (typically sounds best)
                        </option>
                        <option value="waveglow">WaveGlow</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="sub-title">
                      Model Visibility&nbsp;{visibilityIcon}
                    </label>
                    <div className="form-group">
                      <select
                        name="creator_set_visibility"
                        onChange={handleVisibilityChange}
                        value={visibility}
                        className="form-select"
                      >
                        <option value="public">
                          Public (visible from your profile)
                        </option>
                        <option value="hidden">
                          Unlisted (shareable URLs)
                        </option>
                      </select>
                    </div>
                  </div>

                  {optionalModeratorFields}
                </div>
              </div>
            </div>

            <div className="container pb-5">
              <button className="btn btn-primary w-100">Update</button>
            </div>
          </Fade>
        </fieldset>
      </form>
    </div>
  );
}

export { TtsModelEditPage };
