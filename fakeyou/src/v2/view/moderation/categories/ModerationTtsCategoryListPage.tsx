import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { BackLink } from '../../_common/BackLink';
import { ListTtsCategoriesForModeration, ListTtsCategoriesForModerationIsError, ListTtsCategoriesForModerationIsOk, ListTtsCategoriesTriState, ModerationTtsCategory } from '../../../api/moderation/category/ListTtsCategoriesForModeration';
import { GravatarFc } from '../../_common/GravatarFc';
import { Link } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ModerationTtsCategoryListPage(props: Props) {
  const [ttsCategories, setTtsCategories] = useState<ModerationTtsCategory[]>([]);
  const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined); 

  const [deletedView, setDeletedView] = useState<ListTtsCategoriesTriState>(ListTtsCategoriesTriState.Exclude); 
  const [unapprovedView, setUnapprovedView] = useState<ListTtsCategoriesTriState>(ListTtsCategoriesTriState.Include); 

  const listTtsCategories = useCallback(async () => {
    const categoryList = await ListTtsCategoriesForModeration(deletedView, unapprovedView);

    if (ListTtsCategoriesForModerationIsOk(categoryList)) {
      setTtsCategories(categoryList.categories);
    } else if (ListTtsCategoriesForModerationIsError(categoryList))  {
      setErrorMessage("error listing all categories");
    }
  }, [deletedView, unapprovedView]);

  useEffect(() => {
    listTtsCategories();
  }, [listTtsCategories]);

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  const handleDeletedChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value;
    const maybeTriState = StringToTriState(value);
    if (maybeTriState !== undefined) {
      setDeletedView(maybeTriState);
    }
  }

  const handleUnapprovedChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value;
    const maybeTriState = StringToTriState(value);
    if (maybeTriState !== undefined) {
      setUnapprovedView(maybeTriState);
    }
  }

  let errorFlash = <></>;

  if (!!errorMessage) {
    errorFlash = (
      <>
        <article className="message is-error">
          <div className="message-body">
            {errorMessage}
          </div>
        </article>
      </>
    );
  }

  return (
    <div>
      <h1 className="title is-1"> Moderate TTS Categories </h1>

      <BackLink link={FrontendUrlConfig.moderationMain()} text="Back to moderation" />

      <br />

      {errorFlash}

      <br />

      <div className="control">
        <strong>Show Unapproved:</strong>
        &nbsp;
        <label className="radio">
          <input type="radio" name="unapproved" value="include" onChange={handleUnapprovedChange} />
          Include
        </label>
        <label className="radio">
          <input type="radio" name="unapproved" value="exclude" onChange={handleUnapprovedChange} />
          Exclude
        </label>
        <label className="radio">
          <input type="radio" name="unapproved" value="only" onChange={handleUnapprovedChange} />
          Only
        </label>
      </div>

      <div className="control">
        <strong>Show Deleted:</strong>
        &nbsp;
        <label className="radio">
          <input type="radio" name="deleted" value="include" onChange={handleDeletedChange} />
          Include
        </label>
        <label className="radio">
          <input type="radio" name="deleted" value="exclude" onChange={handleDeletedChange} />
          Exclude
        </label>
        <label className="radio">
          <input type="radio" name="deleted" value="only" onChange={handleDeletedChange} />
          Only
        </label>
      </div>

      <br />
      
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>Name</th>
            <th>Creator</th>
            <th>Approved</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ttsCategories.map(category => {
            let name = <>{category.name}</>;

            if (!!category.maybe_dropdown_name) {
              name = (
                <>
                  {category.name}<br />
                  ({category.maybe_dropdown_name})
                </>
              );

            }

            let creatorLink = <span />;

            if (!!category?.creator_display_name) {
              const creatorUrl = FrontendUrlConfig.userProfilePage(category?.creator_username || "username error");
              creatorLink = (
                <span>
                  <GravatarFc
                    size={15}
                    username={category.creator_display_name || ""} 
                    email_hash={category.creator_gravatar_hash || ""} 
                    />
                  &nbsp;
                  <Link to={creatorUrl}>{category.creator_display_name}</Link>
                </span>
              );
            }

            let approved = 'not set';
            if (category.is_mod_approved === undefined) {
              approved = 'not set';
            } else if (category.is_mod_approved === true) {
              approved = 'approved';
            } else if (category.is_mod_approved === false) {
              approved = 'DISAPPROVED';
            }

            return (
              <tr key={category.category_token}>
                <td>
                  {name}
                </td>
                <td>
                  {creatorLink}
                </td>
                <td>
                  {approved}
                </td>
                <td>
                  <Link to={FrontendUrlConfig.moderationTtsCategoryEdit(category.category_token)}>edit</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <BackLink link={FrontendUrlConfig.moderationMain()} text="Back to moderation" />
    </div>
  )
}

function StringToTriState(state: string) : ListTtsCategoriesTriState | undefined {
  switch (state) {
    case 'include':
      return ListTtsCategoriesTriState.Include;
    case 'exclude':
      return ListTtsCategoriesTriState.Exclude;
    case 'only':
      return ListTtsCategoriesTriState.Only;
  }
}

export { ModerationTtsCategoryListPage };
