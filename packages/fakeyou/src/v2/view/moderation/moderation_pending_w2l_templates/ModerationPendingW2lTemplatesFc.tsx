import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { formatDistance } from 'date-fns';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { GravatarFc } from '../../_common/GravatarFc';
import { BackLink } from '../../_common/BackLink';
import { GetPendingW2lTemplates, GetPendingW2lTemplatesIsOk, PendingW2lTemplatesEntryForList } from '../../../api/moderation/GetPendingW2lTemplates';
import { PhotoVideoIcon } from '../../_icons/PhotoVideoIcon';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ModerationPendingW2lTemplatesFc(props: Props) {
  const [templates, setTemplates] = useState<Array<PendingW2lTemplatesEntryForList>>([]);

  const getUsers = useCallback(async () => {
    const response = await GetPendingW2lTemplates();

    if (GetPendingW2lTemplatesIsOk(response)) {
      setTemplates(response.templates);
    }

  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);


  if (!templates) {
    return <div />
  }

  if (!props.sessionWrapper.canApproveW2lTemplates()) {
    return <h1>Unauthorized</h1>;
  }

  const now = new Date();
  let rows : Array<JSX.Element> = [];

  templates.forEach(template=> {
    const createTime = new Date(template.created_at);
    const relativeCreateTime = formatDistance(createTime, now, { addSuffix: true });
    
    rows.push(
      <tr key={template.template_token}>
        <td>
          <Link to={FrontendUrlConfig.w2lTemplatePage(template.template_token)}>
            <PhotoVideoIcon title="W2l Template" />
            &nbsp;
            {template.title}
          </Link>
        </td>
        <td>
          <Link to={FrontendUrlConfig.userProfilePage(template.creator_display_name)}>
            <GravatarFc username={template.creator_display_name} email_hash={template.creator_gravatar_hash} size={12} />
            &nbsp;
            {template.creator_display_name}
          </Link>
        </td>
        <td>{template.template_type}</td>
        <td>{relativeCreateTime}</td>
      </tr>
    )
  });

  return (
    <div>
      <h1 className="title is-1"> Unapproved W2L Templates </h1>

      <BackLink link={FrontendUrlConfig.moderationMain()} text="Back to moderation" />

      <br />
      <br />

      <p>
        This lists the templates that haven't yet been approved for display.
      </p>

      <br />

      <p>
        Don't delete templates unless they overwhelmingly break the rules. 
        Users can use templates in private without them necessarily being approved for public use.
      </p>

      <br />

      <p>
        Setting approved = TRUE will show the template on the main site for everyone to use.
        Setting approved = FALSE will still let the author and people directly accessing via 
        URL to use the template, but will not make it public. 
        It will also remove it from the moderation queue.
      </p>


      <br />
      
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>Template</th>
            <th>Creator</th>
            <th>Type</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}

export { ModerationPendingW2lTemplatesFc };
