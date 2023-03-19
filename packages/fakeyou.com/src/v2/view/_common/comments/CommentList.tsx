import React from "react";
import { formatDistance } from "date-fns";
import { Comment } from "@storyteller/components/src/api/comments/ListComments";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SafeDeleteCommentButton } from "./SafeDeleteCommentButton";
import { motion } from "framer-motion";
import { container, item } from "../../../../data/animation";

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
          <SafeDeleteCommentButton
            commentToken={comment.token}
            loadComments={props.loadComments}
          />
        </>
      );
    }

    rows.push(
      <motion.tr key={comment.token} variants={item}>
        <td>
          <div className="py-3">
            <div className="d-flex gap-2 align-items-center">
              <span className="fw-medium text-white">
                {comment.user_display_name}
              </span>
              <span>·</span>
              <span className="opacity-75 comment-time">
                {relativeCreateTime}
              </span>
              <span>·</span>
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
        </td>
      </motion.tr>
    );
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <table className="table">
        <tbody>{rows}</tbody>
      </table>
    </motion.div>
  );
}

export { CommentList };
