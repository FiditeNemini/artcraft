import React, { useState, useCallback } from "react";
import {
  CreateComment,
  CreateCommentIsOk,
} from "@storyteller/components/src/api/comments/CreateComment";
import { v4 as uuidv4 } from "uuid";

interface Props {
  entity_type: string;
  entity_token: string;
}

/**
 * This is a reusable component that can be put on several different pages.
 *
 * It requires the entity type ("tts_model", "tts_result", "w2l_template", "w2l_result", etc.)
 * and the entity token, and it will be able to fetch a user's previous vote and change it.
 *
 * This button component manages all of its own state and API calls.
 */
function CreateCommentComponent(props: Props) {
  const [commentMarkdown, setCommentMarkdown] = useState<string>("");
  const [uuidIdempotencyToken, setUuidIdempotencyToken] = useState<string>(
    uuidv4()
  );

  const postComment = useCallback(async () => {
    const request = {
      uuid_idempotency_token: uuidIdempotencyToken,
      entity_type: props.entity_type,
      entity_token: props.entity_token,
      comment_markdown: commentMarkdown,
    };
    const rating = await CreateComment(request);
    if (CreateCommentIsOk(rating)) {
      //let ratingValue = rating.maybe_rating_value || undefined;
      //setUserRatingValue(ratingValue);
    }
  }, [
    props.entity_type,
    props.entity_token,
    uuidIdempotencyToken,
    commentMarkdown,
  ]);

  const handleCommentChange = (ev: React.FormEvent<HTMLTextAreaElement>) => {
    ev.preventDefault();
    const textValue = (ev.target as HTMLTextAreaElement).value.trim();
    if (textValue !== commentMarkdown) {
      setUuidIdempotencyToken(uuidv4()); // Regenerate on any change.
    }
    setCommentMarkdown(textValue);
    return false;
  };

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (commentMarkdown.trim() === "") {
      return false;
    }

    postComment();
    return false;
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div className="d-flex gap-3">
          <div className="form-group flex-grow-1">
            <textarea
              placeholder="Add a comment..."
              className="form-control textarea-comment"
              rows={1}
              onChange={handleCommentChange}
            >
              {commentMarkdown}
            </textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Submit Comment
          </button>
        </div>
      </form>
    </div>
  );
}

export { CreateCommentComponent };
