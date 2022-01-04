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

  // [dropdownLevel][categories]
  // Outer array has length of at least one, one element per <select>
  // Inner array contains the categories in each level.
  const [dropdownCategories, setDropdownCategories] = useState<TtsCategory[][]>([]);

  // Empty if none are selected.
  const [selectedCategories, setSelectedCategories] = useState<TtsCategory[]>([]);

  useEffect(() => {
    const rootCategories = allTtsCategories.filter(category => {
      return !category.maybe_super_category_token;
    });
    const rootLevel = [rootCategories];
    setDropdownCategories(rootLevel)
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

  let dropdowns = [];

  for (let i = 0; i < dropdownCategories.length; i++) {
    const currentDropdownCategories = dropdownCategories[i];

    let dropdownOptions = [];

    dropdownOptions.push(<option>Select...</option>);

    currentDropdownCategories.forEach(category => {
      dropdownOptions.push(<option>{category.name}</option>)
    })

    dropdowns.push(<select>{dropdownOptions}</select>);
  }

  return (
    <div>
      {dropdowns}
    </div>
  )
}