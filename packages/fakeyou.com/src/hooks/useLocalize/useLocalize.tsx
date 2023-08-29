import { t as oldT } from "i18next";
import { i18n2 } from "App";

export default function useLocalize(nameSpace: string) {
  const { getFixedT, loadNamespaces, ...rest } = i18n2;

  loadNamespaces(nameSpace);

  return { 
    ...rest,
    oldT,
    t: (key: string, placeholder = '') => {
      let str = getFixedT(null, nameSpace)(key);
      return str === key ? placeholder : str;
    },
  };
};

// https://www.notion.so/storytellerai/useLocalize-173c8223ebbd473e916c7664b2aeba41?pvs=4