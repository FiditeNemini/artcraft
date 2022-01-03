import { faChevronRight, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { TtsCategory } from '../../api/category/ListTtsCategories';

export interface Props {
  // This is a list of categories in order: [grandparent/root, parent, child/leaf]
  categoryHierarchy: TtsCategory[]
  isCategoryMod: boolean,
}

export function CategoryBreadcrumb(props: Props) {

  if (props.categoryHierarchy.length === 0) {
    return null;
  }

  let parentCount = 0;
  let hierarchyWarning = null;

  let breadcrumbs = props.categoryHierarchy
      .map((category, index) => {
        let deletedWarning = null;
        let notApprovedWarning = null;
        let modelsNotAllowedWarning = null;

        if (!!category.maybe_super_category_token) {
          parentCount++;
        }

        if (!!category.category_deleted_at) {
            deletedWarning = (
            <>
                <span className="tag is-rounded is-warning is-medium is-light">
                Deleted category
                &nbsp;
                <FontAwesomeIcon icon={faExclamationCircle} />
                </span>
            </>
            )
        }

        if (!category.is_mod_approved) {
            notApprovedWarning = (
            <>
                <span className="tag is-rounded is-warning is-medium is-light">
                Not Mod Approved
                &nbsp;
                <FontAwesomeIcon icon={faExclamationCircle} />
                </span>
            </>
            )
        }

        const isLeaf = index === props.categoryHierarchy.length - 1;

        if (isLeaf && !category.can_directly_have_models) {
          modelsNotAllowedWarning = (
            <>
              <span className="tag is-rounded is-warning is-medium is-light">
              Models not directly allowed
              &nbsp;
              <FontAwesomeIcon icon={faExclamationCircle} />
              </span>
            </>
          )
        }

        return (
          <> {category.name} {deletedWarning} {modelsNotAllowedWarning} {notApprovedWarning}</>
        )
    })
    .reduce((acc, cur) => <>{acc} <FontAwesomeIcon icon={faChevronRight}/> {cur}</>)

  if (props.isCategoryMod && parentCount !== props.categoryHierarchy.length - 1) {
    hierarchyWarning = (
      <>
        <span className="tag is-rounded is-warning is-medium is-light">
          Bad parent category in chain
          &nbsp;
          <FontAwesomeIcon icon={faExclamationCircle} />
        </span>
      </>
    )
  }

  return (
    <>
      {hierarchyWarning} {breadcrumbs}
    </>
  )
}
