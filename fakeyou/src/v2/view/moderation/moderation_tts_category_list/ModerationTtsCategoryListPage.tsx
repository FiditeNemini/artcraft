import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { BackLink } from '../../_common/BackLink';
import { ListTtsCategoriesForModeration, ListTtsCategoriesForModerationIsError, ListTtsCategoriesForModerationIsOk, ModerationTtsCategory } from '../../../api/category/ListTtsCategoriesForModeration';
import { GravatarFc } from '../../_common/GravatarFc';
import { Link } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ModerationTtsCategoryListPage(props: Props) {
  const [ttsCategories, setTtsCategories] = useState<ModerationTtsCategory[]>([]);
  const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined); 

  const listTtsCategories = useCallback(async () => {
    const categoryList = await ListTtsCategoriesForModeration();

    if (ListTtsCategoriesForModerationIsOk(categoryList)) {
      setTtsCategories(categoryList.categories);
    } else if (ListTtsCategoriesForModerationIsError(categoryList))  {
      setErrorMessage("error listing all categories");
    }
  }, []);

  useEffect(() => {
    listTtsCategories();
  }, [listTtsCategories]);

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
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
      
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>Name</th>
            <th>Creator</th>
            <th>Approved</th>
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
              <tr>
                <td>
                  {name}
                </td>
                <td>
                  {creatorLink}
                </td>
                <td>
                  {approved}
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

export { ModerationTtsCategoryListPage };
