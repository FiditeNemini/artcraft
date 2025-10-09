import { invoke } from "@tauri-apps/api/core";
import { CommandResult } from "../../common/CommandStatus";
import { TaskStatus, TaskType, TaskModelType, GenerationProvider } from "@storyteller/api-enums";

interface GetTaskQueueResponse {
  tasks: TaskQueueItem[],
}

export interface TaskQueueItem {
  id: string,
  task_status: TaskStatus,
  task_type: TaskType,
  model_type?: TaskModelType,
  provider?: GenerationProvider,
  provider_job_id?: string,
  created_at: Date,
  updated_at: Date,
  completed_at?: Date,
}

interface GetTaskQueueSuccess extends CommandResult {
  payload: GetTaskQueueResponse;
}

export const GetTaskQueue = async () : Promise<GetTaskQueueResponse> => {
  try {
    const result = await invoke("get_task_queue_command") as GetTaskQueueSuccess;

    const tasks = result?.payload?.tasks || [];

    // Convert timestamps to Date objects
    const newTasks : TaskQueueItem[] = tasks.map((task) => {
      return {
        id: task.id,
        task_status: task.task_status,
        task_type: task.task_type,
        model_type: task.model_type,
        provider: task.provider,
        provider_job_id: task.provider_job_id,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
        completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
      }
    });

    return {
      tasks: newTasks,
    };
  } catch (error) {
    throw error;
  }
}

// Temporary just for testing -
(window as any).test_get_task_queue = GetTaskQueue;
