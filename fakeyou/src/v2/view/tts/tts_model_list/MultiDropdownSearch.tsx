import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faHeadphonesAlt, faTags, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TtsCategory } from '../../../api/category/ListTtsCategories';
import { TtsModelListItem } from '../../../api/tts/ListTtsModels';

interface Props {
  allTtsCategories: TtsCategory[],
  allTtsModels: TtsModelListItem[],

  allTtsCategoriesByTokenMap: Map<string,TtsCategory>,
  allTtsModelsByTokenMap: Map<string,TtsModelListItem>,
  ttsModelsByCategoryToken: Map<string,Set<TtsModelListItem>>,

  dropdownCategories: TtsCategory[][],
  setDropdownCategories: (dropdownCategories: TtsCategory[][]) => void,

  selectedCategories: TtsCategory[],
  setSelectedCategories: (selectedCategories: TtsCategory[]) => void,

  maybeSelectedTtsModel?: TtsModelListItem,
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void,
}

export function MultiDropdownSearch(props: Props) {
  const { 
    allTtsCategories, 
    allTtsModels,
    allTtsCategoriesByTokenMap,
    allTtsModelsByTokenMap,
    ttsModelsByCategoryToken,
    dropdownCategories,
    setDropdownCategories,
    selectedCategories,
    setSelectedCategories,
    maybeSelectedTtsModel,
  } = props;

  const isLoading = allTtsModels.length === 0;

  useEffect(() => {
    // NB: Dropdowns do not seem to respect React very well.
    // Despite setting <select>'s value and defaultValue, and <option>'s selected=true, 
    // the dropdowns are left in a default state. I'll use the post-render side effect
    // to select the correct options.

    let selectedModelToken = undefined;

    if (maybeSelectedTtsModel) {
      selectedModelToken = maybeSelectedTtsModel.model_token;
    } else if (allTtsModels.length > 0) {
      // TODO: Move the initial model selection logic here, perhaps.
      //selectedModelToken = allTtsModels[0].model_token;
    }

    let maybeElement = document.getElementsByName('tts-model-select')[0];

    if (!!maybeElement && !!selectedModelToken) {
      (maybeElement as any).value = selectedModelToken;
    } else if (isLoading) {
      (maybeElement as any).value = ""; // Empty string will match "loading" <option>
    }

    let categoryDropdownElements = document.getElementsByClassName('category-dropdown');

    const iterLength = Math.min(selectedCategories.length, categoryDropdownElements.length);

    for (let i = 0; i < iterLength; i++) {
      let categoryDropdownElement = categoryDropdownElements[i];
      let selectedCategory = selectedCategories[i];
      if (!categoryDropdownElements || !selectedCategory) {
        break;
      }
      (categoryDropdownElement as any).value = selectedCategory.category_token;
    }
  });

  const doChangeCategory = (level: number, maybeToken: string) => {
    // Slice off all the irrelevant child category choices, then append new choice.
    let newCategorySelections = selectedCategories.slice(0, level);
    
    // And the dropdowns themselves
    let newDropdownCategories = dropdownCategories.slice(0, level + 1);

    let category = allTtsCategoriesByTokenMap.get(maybeToken);
    if (!!category) {
      newCategorySelections.push(category);
    }

    setSelectedCategories(newCategorySelections);

    const newSubcategories = allTtsCategories.filter(category => {
      return category.maybe_super_category_token === maybeToken;
    });

    newDropdownCategories.push(newSubcategories);
    setDropdownCategories(newDropdownCategories);

    // We might have switched into a category without our selected TTS model.
    // If so, pick a new TTS model.
    let maybeNewModel = undefined;
    const availableModelsForCategory = ttsModelsByCategoryToken.get(maybeToken);
    if (!!availableModelsForCategory && !!maybeSelectedTtsModel) {
      const modelValid = availableModelsForCategory.has(maybeSelectedTtsModel);
      if (!modelValid) {
        maybeNewModel = Array.from(availableModelsForCategory)[0];
      }
    }
    if (!!maybeNewModel) {
      props.setMaybeSelectedTtsModel(maybeNewModel);
    }
  }

  const handleChangeCategory = (ev: React.FormEvent<HTMLSelectElement>, level: number) => { 
    const maybeToken = (ev.target as HTMLSelectElement).value;
    if (!maybeToken) {
      return true;
    }
    doChangeCategory(level, maybeToken);
    return true;
  };

  const handleRemoveCategory = (level: number) => {
    let parentLevel = Math.max(level - 1, 0);
    let maybeToken = '*'; // NB: Sentinel for the "All Voices" / "Select..." <option>

    doChangeCategory(parentLevel, maybeToken);

    // NB: There's a bug selecting the "default" of the parent category.
    // React won't respect the state, so we'll brute force it here.
    let maybeElement = document.getElementsByName(`categories-${parentLevel}`)[0];
    if (maybeElement) {
      (maybeElement as any).value = '*';
    }
  }

  const handleChangeVoice = (ev: React.FormEvent<HTMLSelectElement>) => { 
    const ttsModelToken = (ev.target as HTMLSelectElement).value;
    const maybeTtsModel = allTtsModelsByTokenMap.get(ttsModelToken);
    if (maybeTtsModel) {
      props.setMaybeSelectedTtsModel(maybeTtsModel);
    }
  };

  let categoryDropdowns = [];

  for (let i = 0; i < dropdownCategories.length; i++) {
    const currentDropdownCategories = dropdownCategories[i];

    let defaultName = (i === 0) ? 'All Voices' : 'Select...';

    let dropdownOptions = [];
    dropdownOptions.push(
      <option 
        key={`option-${i}-*`} 
        value="*">
          {defaultName}
      </option>
    );

    currentDropdownCategories.forEach(category => {
      const models = ttsModelsByCategoryToken.get(category.category_token);
      if (models === undefined || models.size === 0) {
        return; // If there are no models at the leaves, skip
      }
      dropdownOptions.push(
        <option
          key={`option-${i}-${category.category_token}`}
          value={category.category_token}>
          {category.name_for_dropdown}
        </option>
      )
    })

    if (dropdownOptions.length <= 1) {
      // We've run out of subcategories. (1 == "Select...")
      // No sense trying to build more.
      break; 
    }

    categoryDropdowns.push(
      <React.Fragment key={`categoryDropdown-${i}`}>
        <div className="control has-icons-left is-expanded">
          <div className="select is-fullwidth">
            <select
              className="category-dropdown"
              name={`categories-${i}`}
              onChange={(ev) => handleChangeCategory(ev, i)}
              defaultValue="*"
              >
              {dropdownOptions}
            </select>
          </div>
          <span className="icon is-small is-left">
            <FontAwesomeIcon icon={faTags} />
          </span>
        </div>

        <div className="control">
          <button 
            className="button is-rounded is-outlined"
            onClick={() => handleRemoveCategory(i)}
          >
            <span className="icon is-normal">
              <FontAwesomeIcon icon={faTimes} title="remove" color="#f14668" />
            </span>
          </button>
        </div>


        <div className="control" >
          <FontAwesomeIcon icon={faChevronRight} size="2x" color="#999" />
        </div>
      </React.Fragment>
    );
  }

  // Group categories into rows of two (on Desktop)
  let groupSize = (window.innerWidth < 550) ? 1 : 2;
  let categoryFields = [];
  let categoryFieldGroups = [];

  for (let i = 0; i < categoryDropdowns.length; i++) {
    categoryFields.push(categoryDropdowns[i]);

    if (categoryFields.length >= groupSize) {
      categoryFieldGroups.push(
        <div className="field is-grouped is-grouped" key={`fieldGroup-${i}`}>
          {categoryFields.splice(0, categoryFields.length)}
        </div>
      );
    }
  }

  if (categoryFields.length >= 0) {
    categoryFieldGroups.push(
      <div className="field is-grouped is-grouped" key="fieldGroup-last">
        {categoryFields.splice(0, categoryFields.length)}
      </div>
    );
  }

  const leafiestCategory = selectedCategories[selectedCategories.length - 1];

  let leafiestCategoryModels : Set<TtsModelListItem> = new Set();
  if (leafiestCategory !== undefined) {
    leafiestCategoryModels = ttsModelsByCategoryToken.get(leafiestCategory.category_token) || new Set();
  } else {
    leafiestCategoryModels = new Set(allTtsModels);
  }

  const voiceCount = leafiestCategoryModels.size;

  let selectClasses = 'select is-normal';
  let loadingOption = undefined;

  if (isLoading) {
    selectClasses = 'select is-normal is-loading';
    loadingOption = (
      <option key="waiting" value="" disabled={true}>Loading...</option>
    )
  }

  return (
    <div>
      {/* Category Dropdowns */}
      <strong>Category Filters</strong>
      <br />
      {categoryFieldGroups}

      {/* Model Dropdown */}
      <strong>Voice ({voiceCount} to choose from)</strong>
      <br />
      <div className="control has-icons-left">
        <div className={selectClasses}>
          <select 
              name="tts-model-select"
              onChange={handleChangeVoice}
              disabled={isLoading}
            >
            {isLoading ? loadingOption : Array.from(leafiestCategoryModels).map(model => {
              return (
                <option
                  key={model.model_token}
                  value={model.model_token}
                  >{model.title} (by {model.creator_display_name})</option>
              );
            })}
          </select>
        </div>
        <span className="icon is-small is-left">
          <FontAwesomeIcon icon={faHeadphonesAlt} />
        </span>
      </div>
    </div>
  )
}
