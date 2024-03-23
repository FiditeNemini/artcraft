// Write unsubcribe and run the remainder of the clip tech.

// export class Clip {
//     version: number;
//     clip_id: number;
    
//     media_token_id: number;
//     type: 'animation' | 'audio' | 'position_rotation';
//     time_start_offset: number;
//     length_override: number | null;

//     constructor(
//         version: number,
//         clip_id: number,
//         media_token_id: number,
//         type: 'animation' | 'audio' | 'position_rotation',
//         time_start_offset: number,
//         length_override: number | null
//     ) {
//         this.version = version;
//         this.clip_id = clip_id;
//         this.media_token_id = media_token_id;
//         this.type = type;
//         this.time_start_offset = time_start_offset;
//         this.length_override = length_override;
//     }
// }


// export class Clip2 {
//     name: string
//     startOffset: number
//     timerID: NodeJS.Timeout | null
//     lengthOfClip: number
//     scrubberEndingPosition: number

//     constructor(name: string, startOffset: number, lengthOfClip: number) {
//         this.startOffset = startOffset
//         this.lengthOfClip = lengthOfClip
//         this.name = name
//         this.timerID = null

//         this.scrubberEndingPosition = 100
//     }

//     async play(): Promise<void> {
//         console.log(`Playing ${this.name}`)
//         this.timerID = setInterval(async () => {
//             console.log(`Running async ${this.name}`)
//             this.stop()
//         }, this.lengthOfClip)
//     }

//     async stop(): Promise<void> {
//         clearInterval(this.timerID!)
//         console.log(`Stopping ${this.name}`)
//     }
// }

// export class API2 {
//     timelineItems: Clip[]
//     timerID: NodeJS.Timeout | null
//     timeLineLimit: number
    
//     runningClips: Clip[]

//     constructor() {
//         this.timelineItems = []
//         this.timerID = null
//         this.timeLineLimit = 1000 * 10
//         this.runningClips = []
//     }

//     async addPlayableClip(clip: Clip): Promise<void> {
//         this.timelineItems.push(clip)
//     }

//     async start(): Promise<void> {
//         let start = 0
//         const updateInterval = 100
//         const timerID = setInterval(async () => {
//             console.log(`Current Time:${start}`)
            
//             // get last updated time when stopped
//             for (const element of this.timelineItems) {
//                 if (element.startOffset >= start) {
//                     element.play()
//                     // remove the element
//                     this.timelineItems = this.timelineItems.filter(item => item !== element)
//                 }
//             }
//             if (start == this.timeLineLimit || this.timelineItems.length == 0) {
//                 this.stop()
//             }
            
//             start += updateInterval
//         }, updateInterval)
        
//         this.timerID = timerID
//     }

//     async stop(): Promise<void> {
//         console.log(`Stopping Timeline`)
//         clearInterval(this.timerID!)
//     }
// }
