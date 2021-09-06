import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { GetUserList, GetUserListIsOk, UserForList } from '../../../api/moderation/GetUserList';
import { formatDistance } from 'date-fns';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { GravatarFc } from '../../_common/GravatarFc';
import { BackLink } from '../../_common/BackLink';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ModerationUserListFc(props: Props) {
  const [userList, setUserList] = useState<Array<UserForList>>([]);

  const getUsers = useCallback(async () => {
    const response = await GetUserList();

    if (GetUserListIsOk(response)) {
      setUserList(response.users);
    }

  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);


  if (!userList) {
    return <div />
  }

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  const now = new Date();
  let rows : Array<JSX.Element> = [];

  userList.forEach(user => {
    const createTime = new Date(user.created_at);
    const relativeCreateTime = formatDistance(createTime, now, { addSuffix: true });
    
    const updateTime = new Date(user.updated_at);
    const relativeUpdateTime = formatDistance(updateTime, now, { addSuffix: true });

    rows.push(
      <tr key={user.user_token}>
        <td>{user.user_id}</td>
        <td>
          <Link to={FrontendUrlConfig.userProfilePage(user.display_name)}>
            <GravatarFc username={user.display_name} email_hash={user.gravatar_hash} size={12} />
            &nbsp;
            {user.display_name}
          </Link>
        </td>
        <td>{relativeCreateTime}</td>
        <td>{relativeUpdateTime}</td>
        <td>{user.user_role_slug}</td>
        <td>{user.is_banned ? "banned" : ""}</td>
      </tr>
    )
  });

  return (
    <div>
      <h1 className="title is-1"> User list </h1>

      <BackLink link={FrontendUrlConfig.moderationMain()} text="Back to moderation" />

      <br />
      <br />

      <p>
        Brandon did the <strong>bare minimum</strong> to get this working. 
        It isn't paginated and will break once we get a lot of users. 
        It's also not sortable.
        I'll need to cycle back and fix it after we launch.
      </p>

      <br />
      
      <table className="table">
        <thead>
          <tr>
            <th>Id</th>
            <th>User</th>
            <th>Created</th>
            <th>Profile Updated</th>
            <th>Role</th>
            <th>Is Banned?</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}

export { ModerationUserListFc };
