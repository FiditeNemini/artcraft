import React, { createContext } from "react";
import {
	BaseQueueObject,
	GetQueuesResponse,
} from "@storyteller/components/src/api/stats/queues/GetQueues";
import { useQueuePoll } from "hooks";

interface InferenceJobsContextType {
	inferenceJobs?: any;
	byCategory?: any;
	enqueue?: any;
	queueStats: GetQueuesResponse;
}

export const InferenceJobsContext = createContext<InferenceJobsContextType>({
	queueStats: BaseQueueObject(),
});

interface Props {
	children?: any;
}

export default function InferenceJobsProvider({ children, ...rest }: Props) {
	const queueStats = useQueuePoll();

	return (
		<InferenceJobsContext.Provider {...{ value: { ...rest, queueStats } }}>
			{children}
		</InferenceJobsContext.Provider>
	);
}
