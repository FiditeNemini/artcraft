import { t as oldT } from "i18next";
import { useTranslation } from 'react-i18next';
import { i18n2 } from "App";

export default function useLocalize(nameSpace: string) {
  const { t, ...translation } = useTranslation(nameSpace,{ i18n: i18n2, useSuspense: false });

  return { 
    oldT,
      t: (key: string, placeholder = '') => {
      let str = t(key);
      return str === key ? placeholder : str;
    },
    ...translation
  };
};

// https://www.notion.so/storytellerai/useLocalize-173c8223ebbd473e916c7664b2aeba41?pvs=4