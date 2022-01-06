import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphonesAlt, faTags, faTimes } from '@fortawesome/free-solid-svg-icons';
import { TtsCategory } from './v2/api/category/ListTtsCategories';
import { TtsModelListItem } from './v2/api/tts/ListTtsModels';
import { App } from './App';

interface Props {
  // Certan browsers (iPhone) have pitiful support for drawing APIs. Worse yet,
  // they seem to lose the "touch event sandboxing" that allows for audio to be 
  // played after user interaction if the XHRs delivering the audio don't do so
  // as actual audio mimetypes. (Decoding from base64 and trying to play fails.)
  enableSpectrograms: boolean,
}

export function AppWrapper(props: Props) {
  // Caches of all objects queried
  // These may be triggered by a different page than the user initially lands on.
  const [allTtsCategories, setAllTtsCategories] = useState<TtsCategory[]>([]);
  const [allTtsModels, setAllTtsModels] = useState<TtsModelListItem[]>([]);

  // Lookup by primary key
  const [allCategoriesByTokenMap, setAllCategoriesByTokenMap] = useState<Map<string,TtsCategory>>(new Map());
  const [allTtsModelsByTokenMap, setAllTtsModelsByTokenMap] = useState<Map<string,TtsModelListItem>>(new Map());

  // Lookup by foreign key
  // A TTS voice is attached to every category up the tree from the leaf.
  // We recursively build this, 1) to ensure we can access a voice at all levels 
  // of specificity, and 2) to prune empty categories.
  const [ttsModelsByCategoryToken, setTtsModelsByCategoryToken] = useState<Map<string,Set<TtsModelListItem>>>(new Map());

  // Outer array has length of at least one, one element per <select>
  // Inner array contains the categories in each level.
  // Structure: [dropdownLevel][categories]
  const [dropdownCategories, setDropdownCategories] = useState<TtsCategory[][]>([]);

  // Every category in the heirarchy that has been selected by the user.
  // Empty list if none are selected.
  // Structure: [firstSelected, secondSelected...]
  const [selectedCategories, setSelectedCategories] = useState<TtsCategory[]>([]);

  // TODO: Handle empty category list
  useEffect(() => {
    // Category lookup by token
    let categoriesByTokenMap = new Map();
    allTtsCategories.forEach(category => {
      categoriesByTokenMap.set(category.category_token, category);
    })
    setAllCategoriesByTokenMap(categoriesByTokenMap);

    // TTS model lookup by token
    let ttsModelsByTokenMap = new Map();
    allTtsModels.forEach(model => {
      ttsModelsByTokenMap.set(model.model_token, model);
    })
    setAllTtsModelsByTokenMap(ttsModelsByTokenMap);

    // Initial dropdown state
    const rootCategories = allTtsCategories.filter(category => {
      return !category.maybe_super_category_token;
    });
    const rootLevel = [rootCategories];
    setDropdownCategories(rootLevel);

    // Voice lookup table
    let categoriesToTtsModelTokens = new Map();
    // Category ancestry memoization
    let categoryTokenToAllAncestorTokens : Map<string, Set<string>> = new Map();

    // N * M with memoization should't be too bad here.
    // Also note that the models should be lexographically sorted by name.
    allTtsModels.forEach(ttsModel => {
      if (ttsModel.category_tokens.length === 0) {
        // TODO: Attach to "uncategorized" special category
        return;
      }
      ttsModel.category_tokens.forEach(categoryToken => {
        let ancestors = categoryTokenToAllAncestorTokens.get(categoryToken);
        if (ancestors === undefined) {
          ancestors = findAllAncestorTokens(categoryToken, categoriesByTokenMap);
          categoryTokenToAllAncestorTokens.set(categoryToken, ancestors);
        }
        ancestors.forEach(categoryToken => {
          let models : Set<TtsModelListItem> = categoriesToTtsModelTokens.get(categoryToken);
          if (models === undefined) {
            models = new Set();
            categoriesToTtsModelTokens.set(categoryToken, models);
          }
          models.add(ttsModel);
        })
      });
    });
    setTtsModelsByCategoryToken(categoriesToTtsModelTokens);

  }, [allTtsCategories, allTtsModels]);


  const doChangeCategory = (level: number, maybeToken: string) => {
    // Slice off all the irrelevant child category choices, then append new choice.
    let newCategorySelections = selectedCategories.slice(0, level);
    
    // And the dropdowns themselves
    let newDropdownCategories = dropdownCategories.slice(0, level + 1);

    let category = allCategoriesByTokenMap.get(maybeToken);
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
      //props.setCurrentTtsModelSelected(maybeTtsModel);
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

  /*
  let selectClasses = 'select is-large';
  if (listItems.length === 0) {
    selectClasses = 'select is-large is-loading';
    listItems.push((
      <option key="waiting" value="" disabled={true}>Loading...</option>
    ))
  }
  */

  const leafiestCategory = selectedCategories[selectedCategories.length - 1];

  let leafiestCategoryModels : Set<TtsModelListItem> = new Set();
  if (leafiestCategory !== undefined) {
    leafiestCategoryModels = ttsModelsByCategoryToken.get(leafiestCategory.category_token) || new Set();
  } else {
    leafiestCategoryModels = new Set(allTtsModels);
  }

  const voiceCount = leafiestCategoryModels.size;

  let modelDropdown = (
    <div className="control has-icons-left">
      <div className="select is-normal">
        <select onChange={handleChangeVoice}>
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
  );

  return (
    <>
      <div>
        <strong>Category Filters</strong>
        <br />
        {categoryDropdowns}
        <br />
        <strong>Voice ({voiceCount} to choose from)</strong>
        <br />
        {modelDropdown}
      </div>
      <App 
          enableSpectrograms={props.enableSpectrograms} 

          allTtsCategories={allTtsCategories}
          setAllTtsCategories={setAllTtsCategories}

          allTtsModels={allTtsModels}
          setAllTtsModels={setAllTtsModels}

          allTtsCategoriesByTokenMap={allCategoriesByTokenMap}
          allTtsModelsByTokenMap={allTtsModelsByTokenMap}
          ttsModelsByCategoryToken={ttsModelsByCategoryToken}
          
          dropdownCategories={dropdownCategories}
          setDropdownCategories={setDropdownCategories}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
    </>
  )
}

function findAllAncestorTokens(categoryToken: string, allCategoriesByTokenMap: Map<string, TtsCategory>): Set<string> {
  const ancestorTokens = recursiveFindAllAncestorTokens(categoryToken, allCategoriesByTokenMap);
  return new Set(ancestorTokens);
}

function recursiveFindAllAncestorTokens(categoryToken: string, allCategoriesByTokenMap: Map<string, TtsCategory>): string[] {
  let category = allCategoriesByTokenMap.get(categoryToken)
  if (category === undefined) {
    return [];
  }
  if (!category.maybe_super_category_token) {
    return [categoryToken];
  }
  return [
    ...recursiveFindAllAncestorTokens(category.maybe_super_category_token, allCategoriesByTokenMap), 
    categoryToken,
  ];
}

