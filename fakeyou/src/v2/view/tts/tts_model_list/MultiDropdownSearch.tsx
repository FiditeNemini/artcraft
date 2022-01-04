import React, { useEffect, useCallback, useState } from 'react';
import { TtsCategory } from '../../../api/category/ListTtsCategories';
import { TtsModelListItem } from '../../../api/tts/ListTtsModels';

interface Props {
  allTtsCategories: TtsCategory[],
  //allTtsModels: TtsModelListItem[],
}

//interface TtsModelLite {
//  ttsModelToken: string,
//  categoryTokens: string[],
//}
//
//interface CategoryLite {
//  categoryToken: string,
//  maybeParentCategoryToken?: string,
//}

/*
rootCat
  .children[]
  .allVoices[]

rootCat
  .children[]
  .allVoices[]
*/

export function MultiDropdownSearch(props: Props) {
  const { allTtsCategories } = props;

  // categoryToken -> category
  const [allCategoriesByTokenMap, setAllCategoriesByTokenMap] = useState<Map<string,TtsCategory>>(new Map());

  // [dropdownLevel][categories]
  // Outer array has length of at least one, one element per <select>
  // Inner array contains the categories in each level.
  const [dropdownCategories, setDropdownCategories] = useState<TtsCategory[][]>([]);

  // Empty if none are selected.
  const [selectedCategories, setSelectedCategories] = useState<TtsCategory[]>([]);

  // TODO: Handle empty category list
  useEffect(() => {
    // Lookup table
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

  }, [allTtsCategories]);


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
    const maybeToken = (ev.target as HTMLSelectElement).value;
    if (!maybeToken) {
      return;
    }

    let category = allCategoriesByTokenMap.get(maybeToken);
    if (!category) {
      return;
    }

    // Pop off all the irrelevant child choices.
    let newCategorySelections = selectedCategories.slice(0, level);

    newCategorySelections.push(category);

    console.log('level', level);
    console.log('maybe token', maybeToken);
    console.log('category', category);
    console.log(newCategorySelections);
    /*ev.preventDefault();
    return false;*/
  };

  let dropdowns = [];

  for (let i = 0; i < dropdownCategories.length; i++) {
    const currentDropdownCategories = dropdownCategories[i];

    let maybeSelectedToken = (selectedCategories[i] !== undefined)? selectedCategories[i].category_token : undefined;

    let dropdownOptions = [];
    dropdownOptions.push(<option value="">Select...</option>);

    currentDropdownCategories.forEach(category => {
      const isSelected = category.category_token === maybeSelectedToken;
      dropdownOptions.push(
        <option
          value={category.category_token}
          selected={isSelected}
          >
          {category.name}
        </option>
      )
    })

    dropdowns.push(
      <select
        onChange={(ev) => handleChangeCategory(ev, i)}
        >
        {dropdownOptions}
      </select>
    );
  }

  return (
    <div>
      {dropdowns}
    </div>
  )
}