import { useState } from "react";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { useSession } from "hooks";

interface Props {
  checker: any,
  fetcher: any,
  modLibrary?: any,
  onPass?: any,
  onFail?: any,
  resultsKey: string,
  toggleCheck: (x: any) => any
}

interface Library {
  [key: string]: any
}

interface Gather {
  expand?: boolean,
  modLibrary?: any,
  key: string,
  res: any
}

export default function useBatchContent({
  checker,
  fetcher,
  modLibrary = (current: any, res: any, entity_token: string ) => current,
  onPass,
  onFail = { fetch: () => new Promise(() => {}) },
  resultsKey,
  toggleCheck
}: Props) {
  const session = useSession();
  const [library, librarySet] = useState<Library>({});
  const [busyList, busyListSet] = useState<Library>({});
  const [status, statusSet] = useState(FetchStatus.ready);
  const [tokenType,tokenTypeSet] = useState("");

  const gather = ({ expand, key, res }: Gather) => {
    let tokens = res.results ? res.results.map((item: any) => item[key]) : [res[key]];
    let abc = tokens.reduce((obj = {},token = "") => ({ ...obj, [token]: true }),{})
    // console.log("🪙",fetcher);
    tokenTypeSet(key)
    busyListSet(abc); // add current batch to busy list
    fetcher("",{},{ tokens }).then((batchRes: any) => {

    // console.log("🦄",resultsKey,  res, modLibrary);
      if (batchRes.success && !!batchRes[resultsKey]) {
        // console.log("🥏",resultsKey);
        let newBatch = batchRes[resultsKey].reduce((obj = {}, { entity_token = "", ...current }) => {
          // console.log("🧲", resultsKey, {current, res, entity_token, obj});
          let newCurrent = {
            ...obj,
            [entity_token]: { ...modLibrary(current, res, entity_token, key) }
          };


          // console.log("😡", resultsKey, newCurrent);
          return newCurrent;
        },{});
        // console.log("🐸",busyList);
        busyListSet({}); // this should be a for each key in tokens delete from busyList, but this is fine for now
        librarySet((library: any) => expand ? { ...library, ...newBatch } : newBatch);
      }
    })
  };


  const busyAdd = (entity_token: string) => busyListSet(state => ({ ...state, [entity_token]: true }));

  const busyRemove = (entity_token: string) => busyListSet(state => {
    let newState = { ...state };
    delete newState[entity_token];
    return newState;
  });

  const toggle = (entity_token: string, entity_type: string) => {
    if (session.check()) {
      let inLibrary = library[entity_token];
      statusSet(FetchStatus.in_progress);
      busyAdd(entity_token);

      console.log(`⏳ toggling entity ${ entity_token }, in library?: ${ !!inLibrary }`);

      if (inLibrary && checker(inLibrary)) {
        // console.log("⭕️");
        return onPass.fetch(entity_token, entity_type, library)
        .then((res: any) => {
          console.log("⭕️",res);
          busyRemove(entity_token);
          librarySet(onPass.modLibrary(res, entity_token, entity_type, library));
          statusSet(FetchStatus.ready);
          return false;
        });
      } else {
        // console.log("❌");
        return onFail.fetch(entity_token, entity_type, library)
        .then((res: any) => {
          console.log("❌",res);
          busyRemove(entity_token);
          librarySet(onFail.modLibrary(res, entity_token, entity_type, library));
          statusSet(FetchStatus.ready);
          return true;
        });
      }
    }
  };

  const toggled = ( entity_token = "" ) => toggleCheck(library[entity_token]);

  const makeProps = ({ entityToken, entityType }: { entityToken: string, entityType: string }) => ({
    busy: busyList[entityToken],
    entityToken,
    entityType,
    isToggled: toggled(entityToken),
    toggle
  });


  return {
    busyAdd,
    busyRemove,
    busyList,
    busyListSet,
    gather,
    library,
    librarySet,
    makeProps,
    status,
    statusSet,
    tokenType,
    toggle,
    toggled
  };
};