
class VideoQueueStats {
  queueLength: number;
  queueHeadPosition: number;
  queueTailPosition: number;

  constructor(
    queueLength: number, 
    queueHeadPosition: number, 
    queueTailPosition: number
  ) {
    this.queueLength = queueLength;
    this.queueHeadPosition = queueHeadPosition;
    this.queueTailPosition = queueTailPosition;
  }

  static default() : VideoQueueStats {
    return new VideoQueueStats(0, 0, 0);
  }

  static fromJson(json: any) : VideoQueueStats {
    return new VideoQueueStats(
      json.queue_length || 0,
      json.queue_head_position || 0,
      json.queue_tail_position || 0,
    );
  }
}

export { VideoQueueStats }
