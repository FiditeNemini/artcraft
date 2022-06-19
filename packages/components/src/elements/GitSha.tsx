import React  from 'react';

const GIT_SHA = "CURRENT_STORYTELLER_VERSION";

interface Props {
}

function GitSha(props: Props) {
  return (
    <span className="git-sha">{GIT_SHA}</span>
  )
}

export { GitSha };
