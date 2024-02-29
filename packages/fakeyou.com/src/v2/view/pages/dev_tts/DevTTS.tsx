import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from 'components/layout/PageHeader';
import { MediaBrowser } from "components/modals";
import { CardBadge } from "components/entities";
import { Button, Container, Label, Panel, TempTextArea as TextArea, TempInput as Input, WeightCoverImage } from "components/common";
import { useDebounce, useModal } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faRotateLeft, faSearch } from "@fortawesome/pro-solid-svg-icons";
import "./DevTTS.scss";

interface Props {
  value?: any;
}

export default function DevTTS({ value }: Props) {
  const { modalState, open } = useModal();
  const [search,searchSet] = useState("");
  const [updated,updatedSet] = useState(false);
  const [selectedVoice,selectedVoiceSet] = useState<Weight | undefined>();
  const [text,textSet] = useState("");
  const bucketConfig = new BucketConfig();
  const preview = bucketConfig.getCdnUrl(selectedVoice?.cover_image?.maybe_cover_image_public_bucket_path || "");

  const textChange = ({ target }: { target: any }) => {
    textSet(target.value);
  };

  const searchChange = (setUpdate = true) => ({ target }: { target: any }) => {
    // console.log("🩵",target.value);
    if (setUpdate) updatedSet(true);
    // console.log("aaaa",);
    searchSet(target.value);
  };

  useDebounce({
    blocked: !(updated && !modalState && search),
    onTimeout: () => {
      updatedSet(false);
      open({
        component: MediaBrowser,
        props: {
          onSelect: (weight: any) => selectedVoiceSet(weight),
          inputMode: 3,
          onSearchChange: searchChange(false),
          search
        }
      });
    }
  });

  return <Container>
    <PageHeader {...{ title: "TTS" }}/>
    <Panel padding {...{ className: ""}}>
      <Label {...{ label: "Select a voice" }}/>
      <div {...{ className: `fy-weight-picker mb-3 fy-weight-picker-${ selectedVoice ? "full" : "empty" }` }}>
        <Input autoFocus {...{ icon: faSearch, placeholder: "Search 9999 voices...", onChange: searchChange(), value: search  }}/>
        {
          selectedVoice && <div {...{ className: "fy-weight-picker-preview p-3" }}>
            <WeightCoverImage {...{ src: preview, height: 60, width: 60 }}/>
            <div {...{ className: "fy-weight-picker-preview-details" }}>
              <h6>
                { selectedVoice.title }
                 <CardBadge {...{
                  className: `fy-entity-type-${ selectedVoice.weight_type || "" }`,
                  label: selectedVoice.weight_type || ""
                }}/>
              </h6>
              <span>
                by 
                <Link {...{ className: "fw-medium", to: `/profile/${ selectedVoice.creator?.username || "" }`}}>
                  {
                    " " + selectedVoice.creator?.display_name || "" 
                  }
                </Link>
              </span>

            </div>
            <Icon {...{ className: "fy-weight-picker-reselect", icon: faRotateLeft }}/>
          </div>
        }
      </div>
      { selectedVoice && <TextArea autoFocus {...{ label: "Enter text", onChange: textChange, value: text }}/> }
      {
        text && <Button autoFocus {...{ label: "Speak" }}/>
      }
    </Panel>
  </Container>;
};