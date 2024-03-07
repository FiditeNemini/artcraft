import { createContext } from "react";
import { BaseQueueObject, GetQueuesResponse } from "@storyteller/components/src/api/stats/queues/GetQueues";

interface InferenceJobsContext { inferenceJobs?: any, byCategory?: any, enqueue?: any, queueStats: GetQueuesResponse }

export default createContext<InferenceJobsContext>({
	queueStats: BaseQueueObject()
});