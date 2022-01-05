import React, { useEffect, useState } from 'react';
import { TtsCategory } from '../../../api/category/ListTtsCategories';
import { TtsModelListItem } from '../../../api/tts/ListTtsModels';

interface Props {
  allTtsCategories: TtsCategory[],
  allTtsModels: TtsModelListItem[],
}

export function MultiDropdownSearch(props: Props) {
  const { allTtsCategories, allTtsModels } = props;

  // Lookup table
  // Structure: { categoryToken -> category }
  const [allCategoriesByTokenMap, setAllCategoriesByTokenMap] = useState<Map<string,TtsCategory>>(new Map());

  // Outer array has length of at least one, one element per <select>
  // Inner array contains the categories in each level.
  // Structure: [dropdownLevel][categories]
  const [dropdownCategories, setDropdownCategories] = useState<TtsCategory[][]>([]);

  // Every category in the heirarchy that has been selected by the user.
  // Empty list if none are selected.
  // Structure: [firstSelected, secondSelected...]
  const [selectedCategories, setSelectedCategories] = useState<TtsCategory[]>([]);

  // A TTS voice is attached to every category up the tree from the leaf.
  // We recursively build this, 1) to ensure we can access a voice at all levels 
  // of specificity, and 2) to prune empty categories.
  const [ttsModelsByCategoryToken, setTtsModelsByCategoryToken] = useState<Map<string,Set<TtsModelListItem>>>(new Map());

  // TODO: Handle empty category list
  useEffect(() => {
    // Category lookup table
    let categoriesByTokenMap = new Map();
    allTtsCategories.forEach(category => {
      categoriesByTokenMap.set(category.category_token, category);
    })
    setAllCategoriesByTokenMap(categoriesByTokenMap);

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


  // 1. Create lookup map [string token] => object

  // 2. Build parentless dropdown (level 0), filter(category => !category.parent_token)

  // 3. Build "All Voices" special parentless dropdown
  // 4. Select a random voice (perhaps from a pre-approved set)


  //// ----- user interaction -------

  // 1. User selects eg. "Gender"

  // 2. Find all subcategories & voices and put into dropdown
  // 3. Select a random subcategory or voice, which may incur the need to select more recursively... (BAD AND CONFUSING)
  // 3. -- OR -- Make the user select something, but this invalidates the voice selection. 
  // 3. -- OR -- Keep previous voice choice until set?

  // Combine voice and category dropdowns? Or keep voice dropdown always separate?  -- If separate, we can always choose a 
  //     default if we prepopulate the list.
  // 

  const handleChangeCategory = (ev: React.FormEvent<HTMLSelectElement>, level: number) => { 
    console.log('======= handleChangeCategory =======')

    const maybeToken = (ev.target as HTMLSelectElement).value;
    if (!maybeToken) {
      return true;
    }

    // Slice off all the irrelevant child category choices, then append new choice.
    let newCategorySelections = selectedCategories.slice(0, level);
    
    // And the dropdowns themselves
    let newDropdownCategories = dropdownCategories.slice(0, level + 1);

    let category = allCategoriesByTokenMap.get(maybeToken);
    if (!!category) {
      newCategorySelections.push(category);
    }

    console.log('newCategorySelections', newCategorySelections);
    setSelectedCategories(newCategorySelections);

    const newSubcategories = allTtsCategories.filter(category => {
      return category.maybe_super_category_token === maybeToken;
    });

    console.log('new subcategories', newSubcategories.length);

    newDropdownCategories.push(newSubcategories);

    setDropdownCategories(newDropdownCategories);

    return true;
  };

  let categoryDropdowns = [];

  console.log('-------render-------');

  for (let i = 0; i < dropdownCategories.length; i++) {
    const currentDropdownCategories = dropdownCategories[i];

    let maybeSelectedToken = (!!selectedCategories[i])? selectedCategories[i].category_token : undefined;

    console.log('maybeSelectedToken', i, maybeSelectedToken, selectedCategories.map(c => c.category_token));

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
      // No sense trying to build a disjointed tree.
      break; 
    }

    categoryDropdowns.push(
      <>
        <div className="select is-normal">
          <select
            key={i}
            onChange={(ev) => handleChangeCategory(ev, i)}
            defaultValue="*"
            >
            {dropdownOptions}
          </select>
        </div>
        <br />
      </>
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

  let modelDropdown = (
    <div className="select is-normal">
      <select>
        {Array.from(leafiestCategoryModels).map(model => {
          return (
            <option
              key={model.model_token}
              value={model.model_token}
              >{model.title}</option>
          );
        })}
      </select>
    </div>
  );

  return (
    <div>
      {categoryDropdowns}
      {modelDropdown}
    </div>
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
