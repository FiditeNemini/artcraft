import { audioFilter, audioItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";

export const AudioTabComponent = () => {
  useSignals();

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-2 flex justify-start gap-2 px-2">
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              audioFilter.value === AssetFilterOption.ALL
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (audioFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={[
              "bg-assets-background text-nowrap rounded-lg px-3 py-1 text-sm",
              "disabled:text-gray-500",
              audioFilter.value === AssetFilterOption.MINE
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (audioFilter.value = AssetFilterOption.MINE)}
            disabled={!audioItems.value.some((item) => item.isMine)}
          >
            My Audios
          </button>
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              "disabled:text-gray-500",
              audioFilter.value === AssetFilterOption.BOOKMARKED
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (audioFilter.value = AssetFilterOption.BOOKMARKED)}
            disabled={!audioItems.value.some((item) => item.isBookmarked)}
          >
            Bookmarked
          </button>
        </div>
      </div>
      <div className="px-2">
        <button className="bg-assets-background w-full rounded-lg py-2">
          Upload Audio
        </button>
      </div>
      <div className="overflow-y-auto px-2 pt-2">
        <ItemElements
          items={audioItems.value}
          assetFilter={audioFilter.value}
        />
      </div>
    </>
  );
};

// import { useContext, useEffect, useState } from "react";

// import { faArrowsRotate } from "@fortawesome/pro-solid-svg-icons";

// import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";

// import { APPUI_ACTION_TYPES } from "../../../reducers";
// import { AppUiContext } from "../../../contexts/AppUiContext";
// import { AuthenticationContext } from "~/contexts/Authentication";
// import { useSignals } from "@preact/signals-react/runtime";
// // import { timelineHeight } from "~/pages/PageEnigma/store";

// import { Button, ButtonIcon, Label, P } from "~/components";
// import { ClipType } from "../../../models/track";
// import { AudioElement } from "./AudioElement";
// import { ListAudioByUser, MediaFile } from "./listAudioByUser";

// export const TabAudio = () => {
//   const { audioClips } = useContext(TrackContext);
//   const { authState } = useContext(AuthenticationContext);
//   const [, dispatchAppUiState] = useContext(AppUiContext);
//   const [ userAudioClips, setUserAudioClips] = useState<MediaFile[]>([]);

//   useSignals();

//   useEffect(() => {
//     if(authState.userInfo && authState.userInfo.username && userAudioClips.length === 0)
//       ListAudioByUser(authState.userInfo.username)
//         .then(res=>{
//           setUserAudioClips([...res]);
//         });
//   }, [authState]);

//   const openTTSPanel = () =>{
//     dispatchAppUiState({
//       type: APPUI_ACTION_TYPES.OPEN_DIALOGUE_TTS
//     })
//   };
//   const handleRefreshUserMedia = ()=>{
//     if(authState.userInfo && authState.userInfo.username)
//       ListAudioByUser(authState.userInfo.username)
//         .then(res=>{
//           setUserAudioClips([...res]);
//         });
//   }
//   return (
//     <div 
//       className="flex flex-col gap-3"
//     >
//       <div className="flex flex-col">
//         <Label>Generate</Label>
//         <Button
//           onClick={openTTSPanel}
//           variant="secondary"
//         >
//           Create TTS Audio
//         </Button>
//         <span className="w-full h-3" />
//         <Button
//           disabled
//           variant="secondary"
//         >
//           Create Voice to Voice Audio
//         </Button>
//       </div>
//       <div className="flex flex-col mt-1">
//         <Label>Preset Dialogues</Label>
      
//         <div className="flex flex-wrap gap-2">
//           {audioClips.map((clip) => {
//             return (
//               <AudioElement
//                 key={clip.media_id}
//                 clip={clip}
//                 type={ClipType.AUDIO}
//               />
//             );
//         })}
//         </div>
//       </div>

//       <div className="flex flex-col mt-1">
//         <div className="flex justify-between">
//           <Label>My Dialogues</Label>
//           <ButtonIcon icon={faArrowsRotate} onClick={handleRefreshUserMedia}/>
//         </div>
//         {userAudioClips.length === 0 && 
//           <div className="flex justify-center items-center text-center w-full h-40">
//             <P className="text-brand-secondary-300"> No audio generated yet</P>
//           </div>
//         }
//         { userAudioClips.length >= 0 &&
//           <div className="flex flex-wrap gap-1">
//             {userAudioClips.map(item =>
//                 <AudioElement 
//                   key={item.token}
//                   clip={{
//                     version: 0,
//                     type: ClipType.AUDIO,
//                     media_id: item.token,
//                     name: item.origin['maybe_model'].title || "Unknown",
//                     length: 0,
//                   }}
//                   type={ClipType.AUDIO}
//                 />
//             )}
//           </div>
//         }
//       </div>

//       <Button className="w-fit m-auto px-6 py-2"> Add to Lip Sync Track</Button>
//     </div>
//   );
// };

