import { AnyJson } from "three/examples/jsm/nodes/core/constants.js"
import { ClipOffset } from "../datastructures/clips/clip_offset"

// Every object uuid / entity has a track.
export class TimelineCurrentReactState {
    isEditable:boolean
    selectedObjectID:number
    
    constructor() {
        this.isEditable = true // can add clips to it
        this.selectedObjectID = 0
    }
}

export class TimeLine {
    timelineItems: ClipOffset[]
    runningClips: ClipOffset[]

    //timerID: NodeJS.Timeout | null
    timeLineLimit: number
    scrubberPosition: number
    isPlaying: boolean

    timelineState: TimelineCurrentReactState
    
    constructor() {
        this.timelineItems = []
        // this.timerID = null
        this.timeLineLimit = 1000 * 10 // 10 seconds
        this.runningClips = []
        this.isPlaying = false
        this.scrubberPosition = 0 // in ms into the tl
        this.timelineState = new TimelineCurrentReactState()
    }

    async createClipOffset(clip: ClipOffset): Promise<void> {

    }

    async addPlayableClip(clip: ClipOffset): Promise<void> {
        this.timelineItems.push(clip)
    }

    async deleteClip(clip_uuid: string): Promise<void> {

    }

    // this will update the state of the clips based off uuid easing?
    async modifyClip(clip_uuid: string, updates: AnyJson): Promise<void> {

    }   
    
    async clipDidEnterDropZone() {

    }
    
    async clipDidExitDropZone() {

    }

    // timeline controls this.
    async scrubberDidStart(offset_in_ms:number) {
        
    }

    async scrub(offset_in_ms:number): Promise<void> {
        // only stream through to the position and rotation keyframes
        // debounce not really 
    }
    async scrubberDidStop(offset_in_ms:number) {
        
    }
    // public streaming events into the timeline from
    async setScrubberPosition(offset:number) {
        this.scrubberPosition = offset // in ms
    }

    // should play from the clip that is closest to the to scrubber
    async play(): Promise<void> {
        console.log(`Starting Timeline`)
        this.isPlaying = true
        // const updateInterval = 100
        // const timerID = setInterval(async () => {
        //     console.log(`Current Time:${start}`)
            
        //     // get last updated time when stopped
        //     for (const element of this.timelineItems) {
        //         if (element.start_offset >= start) {
        //             // run async
        //             // element.play()
        //             // remove the element
        //             this.timelineItems = this.timelineItems.filter(item => item !== element)
        //         }
        //     }
        //     if (start == this.timeLineLimit || this.timelineItems.length == 0) {
        //         this.stop()
        //     }
            
        //     start += updateInterval
        // }, updateInterval)
        
        // this.timerID = timerID
    }


    // called by the editor update loop on each frame
    async update() {
        if (this.isPlaying == false) return; // start and stop 

        for (const element of this.timelineItems) {
            if (element.start_offset >= this.scrubberPosition) {
                // run async
                // element.play()
                // remove the element from the list
                if (element.type == "transform") {
                    
                }
                else if (element.type == "audio") {

                }
                else if (element.type == "animation") {

                } else {
                    throw "Error New Type"
                }
                this.timelineItems = this.timelineItems.filter(item => item !== element)
            }
            if (this.scrubberPosition == this.timeLineLimit) { // stops at where clips should // cannot throw clip
                this.stop()
            }
        }
    }

    async stop(): Promise<void> {
        this.isPlaying = false
        console.log(`Stopping Timeline`)
    }
}

// How much timeline precision we have
const percision = 100 // using a fake update loop mock

// Visual verification tests.
function CheckIfBasicAudioClipWorks() {
    const api = new TimeLine()
    api.addPlayableClip(new ClipOffset(1.0,'audio',1,0))
    api.play()
}

function CheckIfBasicTransformClipWorks() {
    const api = new TimeLine()
    api.addPlayableClip(new ClipOffset(1.0,'transform',2,0))
    api.play()
}

function CheckIfBasicClipWorks() {
    const api = new TimeLine()
    api.addPlayableClip(new ClipOffset(1.0,'animation',3,0))
    api.play()
}

// function CheckIfBasicClipWorks3SecondsAfterTimelineStops() {
//     const api = new TimeLine()
//     api.addPlayableClip(new ClipOffset("clip1", 0, 10000))
//     api.play()
// }

// function CheckIfTwoClipsAtTheSameTimeWorks() {
//     const api = new TimeLine()
//     api.addPlayableClip(new ClipOffset("clip1", 0, 1000))
//     api.play()
// }

// function CheckIfTwoClipsOneAfterAnotherWorks() {
//     const api = new TimeLine()
//     api.addPlayableClip(new ClipOffset("clip1", 0, 1000))
//     api.addPlayableClip(new ClipOffset("clip2", 0, 2000))
//     api.play()
// }

// function CheckIfTimeLineStopBeforeClipPlays() {
//     const api = new TimeLine()
//     api.addPlayableClip(new ClipOffset("clip3",0,1000))
//     api.play()
//     setInterval(async ()=> {
//         api.stop()
//     },1100)
//     console.log("Stopped")
// }

// function CheckIfTimeLineStartAfterClipPlays() {
//     const api = new TimeLine() 
//     api.addPlayableClip(new ClipOffset("clip3",0,1000))
//     api.play()
//     setInterval(async ()=> {
//         api.stop()
//     },500)
//     console.log("Stopped")
// }

// function CheckIfClipsPlayAllTogetherConcurrently() {
//     const api = new TimeLine() 
//     api.addPlayableClip(new ClipOffset("clip1",0,1000))
//     api.addPlayableClip(new ClipOffset("clip2",0,1000))
//     api.addPlayableClip(new ClipOffset("clip3",0,1000))
//     api.addPlayableClip(new ClipOffset("clip4",0,1000))
//     api.play()
// }

// function CheckIfClipsPlayAllTogether() {
//     const api = new TimeLine() 
//     api.addPlayableClip(new TrackClip("clip1",0,1000))
//     api.addPlayableClip(new TrackClip("clip2",0,1000))
//     api.addPlayableClip(new TrackClip("clip3",0,1000))
//     api.addPlayableClip(new TrackClip("clip4",0,1000))
//     api.play()
// }

CheckIfBasicClipWorks()
//CheckIfTwoClipsAtTheSameTimeWorks()
// CheckIfTwoClipsOneAfterAnotherWorks()
// CheckIfTimeLineStopBeforeClipPlays()
// CheckIfTimeLineStartAfterClipPlays()
// CheckIfClipsPlayAllTogetherConcurrently()

// CheckIfClipsPlayAllTogether()

