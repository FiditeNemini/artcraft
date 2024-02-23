import React from "react";
import { InferenceJobsContext } from "context";
import { useQueuePoll } from "hooks";

interface Props {
  children?: any;
}

export default function InferenceJobsProvider({  children, ...rest }: Props) {
	const queueStats = useQueuePoll();

	return <InferenceJobsContext.Provider {...{ value: { ...rest, queueStats } }}>
		{ children }
	</InferenceJobsContext.Provider>
};