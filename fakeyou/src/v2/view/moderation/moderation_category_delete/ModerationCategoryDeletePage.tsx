import React, { useCallback, useEffect, useState } from 'react';
import { BackLink } from '../../_common/BackLink';
import { Category, GetCategory, GetCategoryIsError, GetCategoryIsOk } from '../../../api/category/GetCategory';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { Link, useHistory } from 'react-router-dom';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { useParams } from 'react-router-dom';
import { EditCategory, EditCategoryIsError, EditCategoryIsSuccess, EditCategoryRequest } from '../../../api/category/EditCategory';
import { ListTtsCategories, ListTtsCategoriesIsError, ListTtsCategoriesIsOk, TtsCategory } from '../../../api/category/ListTtsCategories';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ModerationCategoryDeletePage(props: Props) {
  const { token } : { token : string } = useParams();

  const history = useHistory();

  const [category, setCategory] = useState<Category|undefined>(undefined);

  const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined); 

  const getCategory = useCallback(async (categoryToken: string) => {
    const categoryList = await GetCategory(categoryToken);

    if (GetCategoryIsOk(categoryList)) {
      const category = categoryList.category;
      setCategory(category);
    } else if (GetCategoryIsError(categoryList))  {
      setErrorMessage("error fetching category");
    }
  }, []);
  
  useEffect(() => {
    getCategory(token);
  }, [token, getCategory]);

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  if (category === undefined) {
    return <div />
  }

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) : Promise<boolean> => {
    ev.preventDefault();

    /*setErrorMessage(undefined);

    let request : EditCategoryRequest = {
      name: name,
      maybe_dropdown_name: maybeDropdownName,
      maybe_mod_comments: maybeModComments,
      maybe_super_category_token: maybeSuperCategoryToken,
      can_directly_have_models: canDirectlyHaveModels,
      can_have_subcategories: canHaveSubcategories,
      can_only_mods_apply: canOnlyModsApply,
      is_mod_approved: isModApproved,
    }

    const response = await EditCategory(token, request);

    if (EditCategoryIsError(response)) {
      setErrorMessage('there was an error with the request'); // TODO: Fix error serialization
    } else if (EditCategoryIsSuccess(response)) {
      history.go(0); // NB: Force reload
    }*/

    return false;
  }

  let errorFlash = <></>;

  if (!!errorMessage) {
    errorFlash = (
      <>
        <br />
        <article className="message is-error">
          <div className="message-body">
            {errorMessage}
          </div>
        </article>
      </>
    );
  }

  const currentlyDeleted = !!category?.deleted_at;

  const deletePageTitle = currentlyDeleted ? "Undelete Category?" : "Delete Category?";
  const deleteButtonTitle = currentlyDeleted ? "Confirm Undelete Category" : "Confirm Delete Category";

  const deleteButtonCss = currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  return (
    <div>
      <h1 className="title is-1"> {deletePageTitle} </h1>

      <BackLink link={FrontendUrlConfig.moderationTtsCategoryEdit(token)} text="Back to category edit page" />

      <br />

      {errorFlash}

      <br />

      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th><abbr title="Detail">Detail</abbr></th>
            <th><abbr title="Value">Value</abbr></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Category Name</th>
            <td>
              {category.name}
            </td>
          </tr>
          <tr>
            <th>Creator</th>
            <td>
              <Link 
                to={FrontendUrlConfig.userProfilePage(category?.creator_username || "")}
                >{category?.creator_username}</Link>
            </td>
          </tr>
          <tr>
            <th>Created On</th>
            <td>
              {category.created_at}
            </td>
          </tr>
          <tr>
            <th>Is Mod Approved?</th>
            <td>
              {category.is_mod_approved ? "Yes" : "No"}
            </td>
          </tr>
        </tbody>
      </table>

      <form onSubmit={handleFormSubmit}>

        <button className={deleteButtonCss}> {deleteButtonTitle} </button>

      </form>

      <br />

      <BackLink link={FrontendUrlConfig.moderationTtsCategoryEdit(token)} text="Back to category edit page" />
    </div>
  )
}

export { ModerationCategoryDeletePage };
