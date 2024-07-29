import { VoiceConversionModelListItem } from "@storyteller/components/src/api/voice_conversion/ListVoiceConversionModels";
import React from "react";
import Select, { createFilter } from "react-select";
import { SearchFieldClass } from "../../../tts/tts_model_list/search/components/SearchFieldClass";
import { FastReactSelectOption } from "../../../../_common/react_select/FastReactSelectOption";
import { Analytics } from "../../../../../../common/Analytics";
import { FixedSingleValueSelectOption } from "../../../../_common/react_select/FixedSingleValueSelectOption";

interface Props {
  voiceConversionModels: Array<VoiceConversionModelListItem>;
  setVoiceConversionModels: (
    ttsVoices: Array<VoiceConversionModelListItem>
  ) => void;

  maybeSelectedVoiceConversionModel?: VoiceConversionModelListItem;
  setMaybeSelectedVoiceConversionModel: (
    maybeSelectedVoiceConversionModel: VoiceConversionModelListItem
  ) => void;
}

function VcModelListSearch(props: Props) {
  const handleChange = (option: any, actionMeta: any) => {
    const voiceConversionModelToken = option?.value;
    // TODO: Cache a lookup table
    //const maybeNewVoiceConversionModel = props.allVoiceConversionModelsByTokenMap.get(token);
    const maybeNewVoiceConversionModel = props.voiceConversionModels.find(
      (voiceConversionModel) => {
        return voiceConversionModel.token === voiceConversionModelToken;
      }
    );
    if (maybeNewVoiceConversionModel !== undefined) {
      props.setMaybeSelectedVoiceConversionModel(maybeNewVoiceConversionModel);
    }
  };

  interface DropdownOption {
    label: string;
    value: string;
    creatorName?: string;
    modelType?: string;
  }

  let options: DropdownOption[] = props.voiceConversionModels.map(
    (voiceConversionModel) => {
      return {
        label: voiceConversionModel.title,
        value: voiceConversionModel.token,
        creatorName: voiceConversionModel.creator.display_name,
        modelType: voiceConversionModel.model_type,
      };
    }
  );

  let selectedOption = options.find(
    (option) => option.value === props.maybeSelectedVoiceConversionModel?.token
  );

  if (selectedOption === undefined && options.length > 0) {
    // NB: We shouldn't select the first item in the list since that won't update the currently
    // selected model. If the user were to close the dialogue, they'd think they had picked a voice,
    // when in reality no state would have changed. By forcing the user to choose, the user will set
    // the state appropriately.
    selectedOption = {
      label: "Select voice...",
      value: "*",
      creatorName: undefined,
    };
  }

  let isLoading = false;

  if (props.voiceConversionModels.length === 0) {
    // NB: react-select will cache values, even across different instances (!!!)
    // This can cause confusion when initializing a select instance before the data
    // is loaded, and the select will never update to show the new data.
    // The proper way to change voices after load from a placeholder "Loading..."
    // label is to use controlled props / value as is done here:
    isLoading = true;
    selectedOption = {
      label: "Loading...",
      value: "*",
      creatorName: undefined,
    };
  } else if (options.length === 0) {
    // NB: Perhaps the user has refined their search to be too narrow (langauge + category)
    selectedOption = {
      label: "No results (remove some filters)",
      value: "*",
      creatorName: undefined,
    };
  }

  // Function to build the options themselves, so we can introduce extra elements.
  const formatOptionLabel = (
    data: DropdownOption,
    formatOptionLabelMeta: any
  ) => {
    let creatorName = <></>;
    if (data.creatorName !== undefined) {
      creatorName = <span className="opacity-50"> — {data.creatorName}</span>;
    }
    let modelType = <></>;
    if (data.modelType !== undefined) {
      if (data.modelType === "so_vits_svc") {
        modelType = (
          <span className="badge-model badge-model-svc ms-2">SVC</span>
        );
      }
      else if (data.modelType === "rvc_v2") {
        modelType = (
          <span className="badge-model badge-model-rvc ms-2">RVCv2</span>
        );
      }
    }
    return (
      <div>
        {data.label}
        {modelType}
        {creatorName}
      </div>
    );
  };

  return (
    <>
      <Select
        value={selectedOption}
        options={options}
        classNames={SearchFieldClass}
        onChange={handleChange}
        onMenuOpen={() => {
          Analytics.ttsOpenPrimaryVoiceConversionSelectMenu();
        }}
        autoFocus={false}
        isLoading={isLoading}
        isSearchable={true}
        // NB: The following settings improve upon performance.
        // See: https://github.com/JedWatson/react-select/issues/3128
        filterOption={createFilter({ ignoreAccents: false })}
        components={
          {
            SingleValue: FixedSingleValueSelectOption,
            Option: FastReactSelectOption,
          } as any
        }
        formatOptionLabel={formatOptionLabel}
      />
    </>
  );
}

export { VcModelListSearch };
