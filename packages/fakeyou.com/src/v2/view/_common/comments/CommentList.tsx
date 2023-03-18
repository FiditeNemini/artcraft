import React from "react";
import { formatDistance } from "date-fns";
import {
  Comment,
} from "@storyteller/components/src/api/comments/ListComments";

const Fade = require("react-reveal/Fade");

interface Props {
  entityType: string;
  entityToken: string;
  comments: Comment[];
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

    rows.push(
      <tr key={comment.token}>
        <td>
          <div className="py-2">
            <div>
              <span className="fw-medium text-white">
                {comment.user_display_name}
              </span>
              <span className="px-2">·</span>
              <span className="opacity-75">{relativeCreateTime}</span>
            </div>
            {/* 
              It's okay to set "dangerous" html here as the server safely created 
              it from markdown and shields against user injection attempts. Don't
              do this with other server data, though, unless you know that field 
              is safe from the backend engineers. 
            */}
            <div
              className="mt-1 text-center text-lg-start"
              dangerouslySetInnerHTML={{
                __html: comment.comment_rendered_html || "",
              }}
            />
          </div>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <table className="table">
        <Fade cascade bottom duration="200" distance="10px">
          <tbody>{rows}</tbody>
        </Fade>
      </table>
    </div>
  );
}

export { CommentList };
