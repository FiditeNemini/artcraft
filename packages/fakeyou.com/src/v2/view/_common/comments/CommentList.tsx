import React from "react";
import { formatDistance } from "date-fns";
import { Comment } from "@storyteller/components/src/api/comments/ListComments";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SafeDeleteCommentButton } from "./SafeDeleteCommentButton";

import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { Link } from "react-router-dom";

interface Props {
  entityType: string;
  entityToken: string;
  comments: Comment[];
  loadComments: () => void;
  sessionWrapper: SessionWrapper;
}

/**
 * This is part of a reusable component for putting comments on several
 * different page types.
 *
 * See the documentation on the parent <CommentComponent />
 */
function CommentList(props: Props) {
  // NB: It's more convenient to show recent data first {.reverse()}
  var reversedComments = props.comments.slice();

  const now = new Date();

  let rows: Array<JSX.Element> = [];

  reversedComments.forEach((comment) => {
    const createTime = new Date(comment.created_at);
    const relativeCreateTime = formatDistance(createTime, now, {
      addSuffix: true,
    });

    // TODO: We'll soon add backend support for a third party that can delete
    // comments - the person that owns the thing the comment is attached to.
    // We want profile / model / result owner to be able to clear harassing
    // comments themselves. This isn't ready yet, though.
    const isAuthor = props.sessionWrapper.userTokenMatches(comment.user_token);
    const isModerator = props.sessionWrapper.canBanUsers();
    const canDelete = isAuthor || isModerator;

    let maybeDeleteButton = <></>;
    if (canDelete) {
      maybeDeleteButton = (
        <>
          <span>·</span>
          <SafeDeleteCommentButton
            commentToken={comment.token}
            loadComments={props.loadComments}
          />
        </>
      );
    }

    let profileLink = `/profile/${comment.username}`;

    rows.push(
      <tr key={comment.token}>
        <td className="px-0">
          <div className="d-flex gap-3 py-3">
            <Gravatar size={40} email_hash={comment.user_gravatar_hash} />
            <div>
              <div className="d-flex gap-2 align-items-center">
                <Link to={profileLink} className="fw-medium text-white">
                  {comment.user_display_name}
                </Link>
                <span>·</span>
                <span className="opacity-75 comment-time">
                  {relativeCreateTime}
                </span>

                {maybeDeleteButton}
              </div>
              {/* 
              It's okay to set "dangerous" html here as the server safely created 
              it from markdown and shields against user injection attempts. Don't
              do this with other server data, though, unless you know that field 
              is safe from the backend engineers. 
            */}
              <div
                className="mt-1"
                dangerouslySetInnerHTML={{
                  __html: comment.comment_rendered_html || "",
                }}
              />
            </div>
          </div>
        </td>
      </tr>
    );
  });

  return (
    <table className="table mb-0">
      <tbody>{rows}</tbody>
    </table>
  );
}

export { CommentList };
