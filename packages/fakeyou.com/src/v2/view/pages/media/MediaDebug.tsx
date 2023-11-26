import React from 'react';
import { AudioInput } from "components/common";
import { useFile } from "hooks";

interface Props {
  value?: any;
}

export default function MediaDebug({ value }: Props) {
  const audioProps = useFile({});
  // console.log("😎",audioProps.file);
  return <div>
  	<h1>Hello world</h1>
  	<AudioInput {...{ ...audioProps }}/>
  </div>;
};