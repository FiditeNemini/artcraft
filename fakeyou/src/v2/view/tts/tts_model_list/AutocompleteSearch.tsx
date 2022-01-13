
import React, { useState } from 'react';
import { TtsModelListItem } from '../../../api/tts/ListTtsModels';
import { TtsCategoryType } from '../../../../AppWrapper';
import Autocomplete from 'react-autocomplete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

// NB: This probably is not the best autocomplete library in the world
// A lot of the libraries are really old and depend on jQuery (gross). 
// This one seemed to be simple and minimal, but unfortunately it doesn't
// use any sort of Trie or caching, and it's almost too minimal.

interface Props {
  allTtsCategories: TtsCategoryType[],
  allTtsModels: TtsModelListItem[],
  allTtsModelsByTokenMap: Map<string,TtsModelListItem>,

  dropdownCategories: TtsCategoryType[][],
  setDropdownCategories: (dropdownCategories: TtsCategoryType[][]) => void,

  selectedCategories: TtsCategoryType[],
  setSelectedCategories: (selectedCategories: TtsCategoryType[]) => void,

  maybeSelectedTtsModel?: TtsModelListItem,
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void,
}

export function AutocompleteSearch(props: Props) {
  const [searchValue, setSearchValue] = useState<string>("");

  // NB: Hack to constrain number of matches.
  // It would be nice if the library stopped searching.
  const maxMenuItems = 15;

  return (
    <>
      <div className="field">
        <label className="label" style={{ margin: "5px 0 0 0"}}>Search</label>
        <div className="control has-icons-left">

          {/* NB: See note above about this library. */}
          <Autocomplete
            getItemValue={(item : TtsModelListItem) => item.title}
            items={props.allTtsModels}
            renderInput={(props) => (
              <input className="input" type="text" placeholder="search" value={searchValue} {...props} />
            )}
            renderMenu={children => (
              <div className="menu">
                {children.slice(0, maxMenuItems)}
              </div>
            )}
            renderItem={(item : TtsModelListItem, isHighlighted : boolean) =>
              <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                {item.title}
              </div>
            }
            value={searchValue}
            onChange={(e : any) => setSearchValue(e.target.value) }
            onSelect={(val : string, item: TtsModelListItem) => {

              // Slice off all the irrelevant child category choices, then append new choice.
              let newCategorySelections = props.selectedCategories.slice(0, 0);
              
              // And the dropdowns themselves
              let newDropdownCategories = props.dropdownCategories.slice(0, 1);

              // Nothing selected.
              props.setSelectedCategories([]);

              // Root dropdown
              //const newSubcategories = props.allTtsCategories.filter(category => {
              //  return category.maybe_super_category_token === undefined;
              //});

              //newDropdownCategories.push(newSubcategories);
              props.setDropdownCategories(newDropdownCategories);



              props.setMaybeSelectedTtsModel(item)
            }}
            shouldItemRender={(item : TtsModelListItem, value) => {
              // TODO: A trie would be so much better. Ugh, this is so bad.
              let test = value.toLocaleLowerCase().trim();
              if (test.length === 0) {
                return false;
              }
              return item.title.toLocaleLowerCase().includes(test);
            }}

            inputProps={{ id: 'states-autocomplete' }}
            wrapperStyle={{ position: 'relative', display: 'inline-block' }}
          />
          <span className="icon is-small is-left">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
      </div>
    </>
  )
}