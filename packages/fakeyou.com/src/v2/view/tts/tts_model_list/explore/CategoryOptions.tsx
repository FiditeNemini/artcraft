import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightLong,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "../../../../../AppWrapper";
//import { useTranslation } from "react-i18next";
import Select from "react-select";
import { SearchFieldClass } from "../search/SearchFieldClass";

interface Props {
  allTtsCategories: TtsCategoryType[];
  allTtsModels: TtsModelListItem[];

  allTtsCategoriesByTokenMap: Map<string, TtsCategoryType>;
  allTtsModelsByTokenMap: Map<string, TtsModelListItem>;
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>;

  dropdownCategories: TtsCategoryType[][];
  setDropdownCategories: (dropdownCategories: TtsCategoryType[][]) => void;

  selectedCategories: TtsCategoryType[];
  setSelectedCategories: (selectedCategories: TtsCategoryType[]) => void;

  maybeSelectedTtsModel?: TtsModelListItem;
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void;

  handleChangeCategory: (level: number, maybeToken?: string) => void;
}

export function CategoryOptions(props: Props) {
  const {
    ttsModelsByCategoryToken,
    dropdownCategories,
    selectedCategories,
    handleChangeCategory,
  } = props;

  //const { t } = useTranslation();

// NB: Not used anymore?
//  const isLoading = allTtsModels.length === 0;

  useEffect(() => {
    // NB: Dropdowns do not seem to respect React very well.
    // Despite setting <select>'s value and defaultValue, and <option>'s selected=true,
    // the dropdowns are left in a default state. I'll use the post-render side effect
    // to select the correct options.

// NB: Not used anymore?
//    let selectedModelToken = undefined;
//
//    if (maybeSelectedTtsModel) {
//      selectedModelToken = maybeSelectedTtsModel.model_token;
//    } else if (allTtsModels.length > 0) {
//      // TODO: Move the initial model selection logic here, perhaps.
//      //selectedModelToken = allTtsModels[0].model_token;
//    }

// NB: This was reaching across the DOM and breaking. Find a new way to handle loading 
//    let maybeElement = document.getElementsByName("tts-model-select")[0];
//
//    if (!!maybeElement && !!selectedModelToken) {
//      (maybeElement as any).value = selectedModelToken;
//    } else if (isLoading) {
//      (maybeElement as any).value = ""; // Empty string will match "loading" <option>
//    }

    let categoryDropdownElements =
      document.getElementsByClassName("category-dropdown");

    const iterLength = Math.min(
      selectedCategories.length,
      categoryDropdownElements.length
    );

    for (let i = 0; i < iterLength; i++) {
      let categoryDropdownElement = categoryDropdownElements[i];
      let selectedCategory = selectedCategories[i];
      if (!categoryDropdownElements || !selectedCategory) {
        break;
      }
      (categoryDropdownElement as any).value = selectedCategory.category_token;
    }
  });

//  const handleRemoveCategory = (level: number) => {
//    let parentLevel = Math.max(level - 1, 0);
//    let maybeToken = "*"; // NB: Sentinel for the "All Voices" / "Select..." <option>
//
//    doChangeCategory(parentLevel, maybeToken);
//
//    // NB: There's a bug selecting the "default" of the parent category.
//    // React won't respect the state, so we'll brute force it here.
//    let maybeElement = document.getElementsByName(
//      `categories-${parentLevel}`
//    )[0];
//    if (maybeElement) {
//      (maybeElement as any).value = "*";
//    }
//  };

//  const handleChangeVoice = (ev: React.FormEvent<HTMLSelectElement>) => {
//    const ttsModelToken = (ev.target as HTMLSelectElement).value;
//    const maybeTtsModel = allTtsModelsByTokenMap.get(ttsModelToken);
//    if (maybeTtsModel) {
//      props.setMaybeSelectedTtsModel(maybeTtsModel);
//    }
//  };

  let categoryDropdowns = buildDropdowns(
    dropdownCategories, 
    selectedCategories,
    ttsModelsByCategoryToken, 
    handleChangeCategory);

  const CATEGORY_SEPARATOR = (
    <div className="d-none d-md-flex align-items-center">
      <FontAwesomeIcon
          icon={faArrowRightLong}
          className="fs-6 opacity-75"
      />
    </div>
  );

  let categoryDropdownsWithSeparators = [];
  for (let i = 0; i < categoryDropdowns.length; i++) {
    categoryDropdownsWithSeparators.push(categoryDropdowns[i]);
    if (i < categoryDropdowns.length - 1) {
      categoryDropdownsWithSeparators.push(CATEGORY_SEPARATOR);
    }
  }

  return (
    <>
      <div className="d-flex flex-column flex-md-row gap-2">
        {categoryDropdownsWithSeparators}
      </div>
    </>
  );
}

function buildDropdowns(
  dropdownCategories: TtsCategoryType[][], 
  selectedCategories: TtsCategoryType[], 
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>,
  handleChangeCategory : (i: number, categoryToken?: string) => void,
) {
  if (dropdownCategories.length === 0 || ttsModelsByCategoryToken.size === 0) {
    // While the XHR requests are still completing, we may have nothing to build.
    // It's easier to return a fully disabled "loading" <Select /> component.
    return [
      <div className="w-100">
        <span className="form-control-feedback">
          <FontAwesomeIcon icon={faTags} />
        </span>
        <Select 
          isLoading={true}
          options={[]}
          inputValue={"Loading..."}
          classNames={SearchFieldClass}
          className={"w-100"}
        />
      </div>
    ];
  }

  let categoryDropdowns = [];

  for (let i = 0; i < dropdownCategories.length; i++) {
    const currentDropdownCategories = dropdownCategories[i];
    const selectedCategory = selectedCategories[i];

    let defaultName = i === 0 ? "All Voices" : "Select...";

    let dropdownOptions = [];
    dropdownOptions.push(
      <option key={`option-${i}-*`} value="*">
        {defaultName}
      </option>
    );

    // TODO(bt, 2023-01-18): Clean this up

    // Transform into "react-select" library compatible options
    const options = currentDropdownCategories
      .filter((category) => {
        // If there are no models at the leaves, skip the category
        const models = ttsModelsByCategoryToken.get(category.category_token);
        return !(models === undefined || models.size === 0);
      })
      .map((category) => {
        return {
          value: category.category_token,
          label: category.name_for_dropdown,
        }
      });

    currentDropdownCategories.forEach((category) => {
      const models = ttsModelsByCategoryToken.get(category.category_token);
      if (models === undefined || models.size === 0) {
        return; // If there are no models at the leaves, skip
      }
      dropdownOptions.push(
        <option
          key={`option-${i}-${category.category_token}`}
          value={category.category_token}
        >
          {category.name_for_dropdown}
        </option>
      );
    });

    let selectedCategoryOption = undefined;
    if (selectedCategory !== undefined) {
      selectedCategoryOption = {
        value: selectedCategory.category_token,
        label: selectedCategory.name_for_dropdown,
      };
    }

    if (dropdownOptions.length <= 1) {
      // We've run out of subcategories. (1 == "Select...")
      // No sense trying to build more.
      break;
    }
    
    let selectProps : any = {
      options: options,
      classNames: SearchFieldClass,
      className:"w-100",
      autoFocus: false, // On mobile, we don't want the onscreen keyboard to take up half the UI.
      onChange: (option: any) => handleChangeCategory(i, option?.value),
    };

    if (selectedCategoryOption === undefined) {
      // NB(bt, 2023-01-19): I'm not sure why we're having to do this to clear categories.
      // If I had more time to spend with this library, I might have a better solution than this hack.
      selectProps['value'] = {
        value: "*",
        label: "Select category...",
      };
    } else {
      selectProps['value'] = selectedCategoryOption;
    }

    categoryDropdowns.push(
      <React.Fragment key={`categoryDropdown-${i}`}>
        <div className="w-100">
          <span className="form-control-feedback">
            <FontAwesomeIcon icon={faTags} />
          </span>
          <Select {... selectProps}
          />
        </div>
      </React.Fragment>
    );
  }

  return categoryDropdowns;
}
