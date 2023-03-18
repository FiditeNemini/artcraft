import React, { useState, useEffect, useCallback } from "react";
import { formatDistance } from "date-fns";
import {
  Comment,
  ListComments,
  ListCommentsIsError,
  ListCommentsIsOk,
} from "@storyteller/components/src/api/comments/ListComments";

const Fade = require("react-reveal/Fade");

interface Props {
  entity_type: string;
  entity_token: string;
}

function CommentList(props: Props) {
  const [comments, setComments] = useState<Array<Comment>>([]);

  const getComments = useCallback(async () => {
    const response = await ListComments(props.entity_type, props.entity_token);

    if (ListCommentsIsOk(response)) {
      setComments(response.comments);
    } else if (ListCommentsIsError(response)) {
      // TODO
    }
  }, [props.entity_token, props.entity_type]);

  useEffect(() => {
    getComments();
  }, [getComments]);

  // NB: It's more convenient to show recent data first {.reverse()}
  var reversedComments = comments.slice();

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
            {/* It's okay to set "dangerous" html here as the server safely created it. */}
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
