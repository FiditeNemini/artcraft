import React from "react";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import { SearchFieldClass } from "../search/SearchFieldClass";
import { AVAILABLE_TTS_LANGUAGE_CATEGORY_MAP } from "../../../../../_i18n/AvailableLanguageMap";

interface Props {
}

export function LanguageOptions(props: Props) {
  const languageOptions = Object.entries(AVAILABLE_TTS_LANGUAGE_CATEGORY_MAP).map(([languageCode, language]) => {
    let label = `${language.languageName}`;

    if (language.languageNameLocalized !== undefined) {
      label = `${language.languageNameLocalized} / ${label}`;
    }
    
    if (language.flags.length > 0) {
      label += ` ${language.flags.join(' ')}`;
    }

    return {
      value: languageCode,
      label: label,
    };
  });

  return (
    <div>
      <span className="form-control-feedback">
        <FontAwesomeIcon icon={faGlobe} />
      </span>
      <Select
        value={languageOptions[0]}
        options={languageOptions}
        classNames={SearchFieldClass}
      />
    </div>
  )
}
