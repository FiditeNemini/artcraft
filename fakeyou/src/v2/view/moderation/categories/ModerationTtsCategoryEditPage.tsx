import React, { useCallback, useEffect, useState } from 'react';
import { BackLink } from '../../_common/BackLink';
import { Category, GetCategory, GetCategoryIsError, GetCategoryIsOk } from '../../../api/category/GetCategory';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { Link, useHistory } from 'react-router-dom';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { useParams } from 'react-router-dom';
import { EditCategory, EditCategoryIsError, EditCategoryIsSuccess, EditCategoryRequest } from '../../../api/moderation/category/EditCategory';
import { ListTtsCategories, ListTtsCategoriesIsError, ListTtsCategoriesIsOk, TtsCategory } from '../../../api/category/ListTtsCategories';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ModerationTtsCategoryEditPage(props: Props) {
  const { token } : { token : string } = useParams();

  const history = useHistory();

  const [category, setCategory] = useState<Category|undefined>(undefined);

  // Fields
  const [name, setName] = useState('');
  const [maybeSuperCategoryToken, setMaybeSuperCategoryToken] = useState<string|undefined>(undefined); // Optional
  const [maybeDropdownName, setMaybeDropdownName] = useState<string|undefined>(undefined); // Optional
  const [canDirectlyHaveModels, setCanDirectlyHaveModels] = useState(false);
  const [canHaveSubcategories, setCanHaveSubcategories] = useState(false);
  const [canOnlyModsApply, setCanOnlyModsApply] = useState(false);
  const [isModApproved, setIsModApproved] = useState(false);
  const [maybeModComments, setMaybeModComments] = useState<string|undefined>(undefined); // Optional

  // Additional object lookups to support parent categories
  const [allTtsCategories, setAllTtsCategories] = useState<TtsCategory[]>([]);
  //const [maybeSuperCategory, setMaybeSuperCategory] = useState<Category|undefined>(undefined);

  const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined); 

  const getCategory = useCallback(async (categoryToken: string) => {
    const categoryList = await GetCategory(categoryToken);

    if (GetCategoryIsOk(categoryList)) {
      const category = categoryList.category;
      setCategory(category);
      setName(category.name);
      setMaybeSuperCategoryToken(category.maybe_super_category_token);
      setMaybeDropdownName(category.maybe_dropdown_name);
      setCanDirectlyHaveModels(category.can_directly_have_models);
      setCanHaveSubcategories(category.can_have_subcategories);
      setCanOnlyModsApply(category.can_only_mods_apply);
      setIsModApproved(category.is_mod_approved || false); // Default to false
      setMaybeModComments(category.maybe_mod_comments);
    } else if (GetCategoryIsError(categoryList))  {
      setErrorMessage("error fetching category");
    }
  }, []);
  
  //const getSuperCategory = useCallback(async (parentCategoryToken: string) => {
  //  const categoryList = await GetCategory(parentCategoryToken);

  //  if (GetCategoryIsOk(categoryList)) {
  //    const category = categoryList.category;
  //    setMaybeSuperCategory(category);
  //  } else if (GetCategoryIsError(categoryList))  {
  //    setErrorMessage("error fetching parent category");
  //  }
  //}, []);

  const listTtsCategories = useCallback(async () => {
    const categoryList = await ListTtsCategories();

    if (ListTtsCategoriesIsOk(categoryList)) {
      setAllTtsCategories(categoryList.categories);
    } else if (ListTtsCategoriesIsError(categoryList))  {
      setErrorMessage("error listing all categories");
    }
  }, []);

  useEffect(() => {
    getCategory(token);
    listTtsCategories();
  }, [token, getCategory, listTtsCategories]);

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  if (category === undefined) {
    return <div />
  }

  const handleNameChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value;
    setName(value);
  }

  const handleMaybeDropdownNameChange = (ev: React.FormEvent<HTMLInputElement>) => {
    let value = (ev.target as HTMLInputElement).value;
    setMaybeDropdownName( !!value ? value : undefined);
  }

  const handleCanDirectlyHaveModelsChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).checked;
    setCanDirectlyHaveModels(value);
  }

  const handleCanHaveSubcategoriesChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).checked;
    setCanHaveSubcategories(value);
  }

  const handleCanOnlyModsApplyChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).checked;
    setCanOnlyModsApply(value);
  }

  const handleIsModApprovedChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    const value = (ev.target as HTMLSelectElement).value;
    const updatedValue = value === "true" ? true : false;
    setIsModApproved(updatedValue)
  };

  const handleSetSuperCategory = async (ev: React.FormEvent<HTMLSelectElement>) => {
    const superCategoryToken = (ev.target as HTMLSelectElement).value;
    let fixedSuperCategoryToken = !!superCategoryToken ? superCategoryToken : undefined;
    setMaybeSuperCategoryToken(fixedSuperCategoryToken);
  }

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) : Promise<boolean> => {
    ev.preventDefault();

    setErrorMessage(undefined);

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
    }

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

  const isModApprovedHtmlFormState = isModApproved ? "true" : "false";
  const maybeSuperCategoryTokenFormHtmlState = maybeSuperCategoryToken ? maybeSuperCategoryToken : "";

  const superCategoryOptions = allTtsCategories.filter(category => {
    const isSelf = token === category.category_token;
    const cannotAdd = !category.can_directly_have_models;
    return !isSelf && !cannotAdd;
  }).map(category => {
    return (
      <>
        <option value={category.category_token}>{category.name}</option>
      </>
    )
  });

  const currentlyDeleted = !!category?.deleted_at;

  const deleteButtonTitle = currentlyDeleted ? "Undelete Category?" : "Delete Category?";

  const deleteButtonCss = currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  let deletedNotice = <></>;

  if (currentlyDeleted) {
    deletedNotice = (
      <>
        <br />
        <article className="message is-warning">
          <div className="message-body">
            Category is currently deleted and will not show up unless undeleted.
          </div>
        </article>
      </>
    );
  }

  return (
    <div>
      <h1 className="title is-1"> Moderate TTS Category </h1>

      <BackLink link={FrontendUrlConfig.moderationTtsCategoryList()} text="Back to category list" />

      <br />

      {errorFlash}
      {deletedNotice}

      <br />


      <form onSubmit={handleFormSubmit}>

        <label className="label">Mod Approval (sets public list visibility)</label>

        <div className="select is-info is-large">
          <select name="approve" value={isModApprovedHtmlFormState} onChange={handleIsModApprovedChange}>
            <option value="true">Approve</option>
            <option value="false">Disapprove</option>
          </select>
        </div>

        <br />
        <br />

        <div className="field">
          <label className="label">Category Name</label>
          <div className="control">
            <input className="input" type="text" placeholder="Category Name" value={name} onChange={handleNameChange} />
          </div>
        </div>

        <br />

        <div className="field">
          <label className="label">Dropdown Name Override (optional)</label>
          <div className="control">
            <input className="input" type="text" placeholder="Dropdown Name" value={maybeDropdownName} onChange={handleMaybeDropdownNameChange} />
          </div>
          <p>(eg. if the category name is "Gender", this might be named "By Gender" for the dropdown.)</p>
        </div>

        <br />

        <label className="label">Permission Flags</label>

        <label className="checkbox">
          <input 
            type="checkbox"
            checked={canOnlyModsApply} 
            onChange={handleCanOnlyModsApplyChange} />
          &nbsp;Can only mods apply this category? (Model authors can't add this themselves. For "Best of" and other special categories.)
        </label>

        <br />
        <br />

        <label className="label">Topology (Children)</label>

        <label className="checkbox">
          <input 
            type="checkbox"
            checked={canDirectlyHaveModels} 
            onChange={handleCanDirectlyHaveModelsChange} />
          &nbsp;Can this category be directly assigned to models? (If not, it's only a super category.)
        </label>

        <br />

        <label className="checkbox">
          <input 
            type="checkbox"
            checked={canHaveSubcategories} 
            onChange={handleCanHaveSubcategoriesChange} />
          &nbsp;Can this category have subcategories?
        </label>

        <br />
        <br />

        <label className="label">Topology (Optional Parent Category)</label>

        <div className="field">
          <div className="control">
            <div className="select is-info">
              <select onChange={handleSetSuperCategory} value={maybeSuperCategoryTokenFormHtmlState}>
                <option value="">None (this is optional)</option>
                {superCategoryOptions}
              </select>
            </div>
          </div>
        </div>

        <br />

        <button className="button is-link is-large is-fullwidth"> Save Changes </button>

      </form>

      <br />

      <Link 
        className={deleteButtonCss}
        to={FrontendUrlConfig.moderationCategoryDeletePage(token)}
        >{deleteButtonTitle}</Link>

      <br />

      <BackLink link={FrontendUrlConfig.moderationTtsCategoryList()} text="Back to category list" />
    </div>
  )
}

export { ModerationTtsCategoryEditPage };
