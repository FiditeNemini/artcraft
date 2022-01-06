import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphonesAlt, faTags, faTimes } from '@fortawesome/free-solid-svg-icons';
import { TtsCategory } from '../../../api/category/ListTtsCategories';
import { TtsModelListItem } from '../../../api/tts/ListTtsModels';

/*
TODO: Spinner.

let selectClasses = 'select is-large';
if (listItems.length === 0) {
  selectClasses = 'select is-large is-loading';
  listItems.push((
    <option key="waiting" value="" disabled={true}>Loading...</option>
  ))
}


TODO: Persist default voice.


*/

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

  useEffect(() => {
    console.log('========= MultiDropdownSearch.useEffect() ===========')

    let selectedModelToken = undefined;

    if (maybeSelectedTtsModel) {
      selectedModelToken = maybeSelectedTtsModel.model_token;
    } else if (allTtsModels.length > 0) {
      //selectedModelToken = allTtsModels[0].model_token;
    }

    let maybeElement = document.getElementsByName('tts-model-select')[0];

    if (!!maybeElement && !!selectedModelToken) {
      console.log(`Setting dropdown to ${selectedModelToken}`);

      (maybeElement as any).value = selectedModelToken;
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
    let maybeToken = '*';

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
    dropdownOptions.push(<option key={`option-${i}-*`} value="*">{defaultName}</option>);

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
      <div className="control has-icons-left" key={`categoryDropdown-${i}`}>
        <div className="select is-normal">
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

        &nbsp;

        <button 
          className="button is-danger is-normal is-inverted is-rounded"
          onClick={() => handleRemoveCategory(i)}
        >
          <span className="icon is-normal">
            <FontAwesomeIcon icon={faTimes} title="remove" />
          </span>
        </button>
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

  return (
    <div>
      {/* Category Dropdowns */}
      <strong>Category Filters</strong>
      <br />
      {categoryDropdowns}
      <br />

      {/* Model Dropdown */}
      <strong>Voice ({voiceCount} to choose from)</strong>
      <br />
      <div className="control has-icons-left">
        <div className="select is-normal">
          <select 
              name="tts-model-select"
              onChange={handleChangeVoice}
            >
            {Array.from(leafiestCategoryModels).map(model => {
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
