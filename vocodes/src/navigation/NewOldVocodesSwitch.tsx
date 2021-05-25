import React from 'react';

interface Props {
  enableAlpha: boolean
}

function NewOldVocodesSwitch(props: Props) {
  if (!props.enableAlpha) {
    return <nav />
  }

  return (
    <nav>
      New (Beta) | Old Site (80+ Voices)
      <hr />
    </nav>
  )
}

export { NewOldVocodesSwitch };
