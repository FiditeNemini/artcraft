import React, { useState, useEffect, useCallback } from "react";
import {
  CreateComment,
  CreateCommentIsOk,
} from "@storyteller/components/src/api/comments/CreateComment";
import { v4 as uuidv4 } from "uuid";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

interface Props {
  entity_type: string;
  entity_token: string;
  sessionWrapper: SessionWrapper;
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
  const [buttonVisible, setButtonVisible] = useState(false);

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

  const handleCommentChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    ev.preventDefault();
    const textValue = (ev.target as HTMLTextAreaElement).value.trim();
    if (textValue !== commentMarkdown) {
      setUuidIdempotencyToken(uuidv4()); // Regenerate on any change.
    }
    setCommentMarkdown(textValue);
    setButtonVisible(textValue.length > 0);
    return false;
  };

  const handleFormSubmit = (ev: React.ChangeEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (commentMarkdown.trim() === "") {
      return false;
    }

    postComment();
    return false;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  let commentButton = <></>;
  if (buttonVisible) {
    commentButton = (
      <button type="submit" className="btn btn-primary">
        Post Comment
      </button>
    );
  }

  let createCommentComponent = (
    <textarea
      placeholder="You need to be logged in to comment."
      className="form-control textarea-comment"
      rows={1}
      disabled
    >
      {commentMarkdown}
    </textarea>
  );
  if (props.sessionWrapper.isLoggedIn()) {
    createCommentComponent = (
      <form onSubmit={handleFormSubmit}>
        <div className="d-flex gap-3">
          <div className="form-group flex-grow-1">
            <textarea
              placeholder="Add a comment..."
              className="form-control textarea-comment"
              rows={1}
              onChange={handleCommentChange}
              onKeyDown={handleKeyDown}
            >
              {commentMarkdown}
            </textarea>
          </div>
          {commentButton}
        </div>
      </form>
    );
  }

  return <div>{createCommentComponent}</div>;
}

export { CreateCommentComponent };
