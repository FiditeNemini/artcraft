import { useCallback, useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { AudioTabPages } from "~/pages/PageEnigma/enums";
import { AudioPanelState } from "~/pages/PageEnigma/models/voice";
import {
  TtsModelListItem,
  VoiceConversionModelListItem,
} from "~/pages/PageEnigma/models";

import { ListTtsModels, ListVoiceConversionModels } from "./utilities";
import { initialTtsState, initialV2VState } from "./values";

import { PageAudioLibrary } from "./pageAudioLibrary";
import { PageAudioGeneration } from "./pageAudioGeneration";
import { PageSelectTtsModel } from "./pageSelectTtsModel";
import { PageSelectV2VModel } from "./pageSelectV2VModel";
import { PollUserAudioItems } from "~/hooks/useBackgroundLoadingMedia/utilities";

export const AudioTab = () => {
  useSignals();

  // local states and data
  const [state, setState] = useState<AudioPanelState>({
    firstLoad: false,
    page: AudioTabPages.LIBRARY,
    // children states are managed at top level for persistent memories
    lastWorkingAudioGeneration: AudioTabPages.TTS,
    ttsState: initialTtsState,
    v2vState: initialV2VState,
  });

  const [ttsModels, setTtsModels] = useState<Array<TtsModelListItem>>([]);
  const [v2vModels, setV2VModels] = useState<
    Array<VoiceConversionModelListItem>
  >([]);

  useEffect(() => {
    if (!state.firstLoad) {
      //fetch all the data on first load once, after securing auth info
      ListTtsModels().then((res) => {
        if (res) setTtsModels(res);
      });
      ListVoiceConversionModels().then((res) => {
        if (res) setV2VModels(res);
      });
      setState((curr) => ({ ...curr, firstLoad: true }));
      // completed the first load
    }
  }, [state]);

  const changePage = useCallback((newPage: AudioTabPages) => {
    setState((curr) => ({
      ...curr,
      page: newPage,
    }));
  }, []);

  switch (state.page) {
    case AudioTabPages.LIBRARY: {
      return (
        <PageAudioLibrary
          changePage={changePage}
          reloadLibrary={PollUserAudioItems}
        />
      );
    }
    case AudioTabPages.SELECT_TTS_MODEL: {
      return (
        <PageSelectTtsModel
          changePage={changePage}
          ttsModels={ttsModels}
          onSelect={(selectedVoice) => {
            setState((curr) => ({
              ...curr,
              ttsState: { ...curr.ttsState, voice: selectedVoice },
              page: AudioTabPages.GENERATE_AUDIO,
            }));
          }}
        />
      );
    }
    case AudioTabPages.SELECT_V2V_MODEL: {
      return (
        <PageSelectV2VModel
          changePage={changePage}
          v2vModels={v2vModels}
          onSelect={(selectedVoice) => {
            setState((curr) => ({
              ...curr,
              v2vState: { ...curr.v2vState, voice: selectedVoice },
              page: AudioTabPages.GENERATE_AUDIO,
            }));
          }}
        />
      );
    }
    case AudioTabPages.GENERATE_AUDIO: {
      return (
        <PageAudioGeneration
          changePage={changePage}
          audioPanelState={state}
          setAudioPanelState={setState}
        />
      );
    }
    default:
      return <p>Unknown Page Error</p>;
  }
};
