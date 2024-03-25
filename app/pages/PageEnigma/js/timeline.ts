import { AnyJson } from "three/examples/jsm/nodes/core/constants.js";
import { ClipUI } from "../datastructures/clips/clip_offset";

import Scene from "./scene.js";
import AudioEngine from "./audio_engine";
import TransformEngine from "./transform_engine";
import LipSyncEngine from "./lip_sync_engine";
import AnimationEngine from "./animation_engine";

// Every object uuid / entity has a track.
export class TimelineCurrentReactState {
    isEditable: boolean
    selectedObjectID: number

    constructor() {
        this.isEditable = true // can add clips to it
        this.selectedObjectID = 0
    }
}

export class TimeLine {
    timelineItems: ClipUI[]
    runningClips: ClipUI[]

    //timerID: NodeJS.Timeout | null
    timeLineLimit: number
    scrubberPosition: number
    isPlaying: boolean

    timelineState: TimelineCurrentReactState

    // plays audio
    audioEngine: AudioEngine
    // key framing
    transformEngine: TransformEngine
    // animation engine
    animationEngine: AnimationEngine
    // lip sync engine
    lipSyncEngine: LipSyncEngine

    scene: Scene
    // ensure that the elements are loaded first.
    constructor(audioEngine: AudioEngine,
        transformEngine: TransformEngine,
        lipsyncEngine: LipSyncEngine,
        animationEngine: AnimationEngine,
        scene: Scene) {
        this.timelineItems = []
        this.timeLineLimit = 60 * 10 // 10 seconds
        this.runningClips = []
        this.isPlaying = false
        this.scrubberPosition = 0 // in frames into the tl
        this.timelineState = new TimelineCurrentReactState()

        // this will be used to play the audio clips
        this.audioEngine = audioEngine
        this.transformEngine = transformEngine
        this.lipSyncEngine = lipsyncEngine
        this.animationEngine = animationEngine

        this.scene = scene;
    }

    async addPlayableClip(clip: ClipUI): Promise<void> {
        this.timelineItems.push(clip)
    }

    // when given a media id item it will create the clip. 
    // Then the clip will be loaded by the engines, if they come from outside of the loaded scene.
    async createClipOffset(media_id: string, type: string): Promise<void> {
        // use engine to load based off media id and type animation | transform |  
    }

    // this will update the state of the clips based off uuid easing?
    async updateClip(clip_uuid: string, updates: AnyJson): Promise<void> {

    }

    async deleteClip(clip_uuid: string): Promise<void> {

    }

    // Events that will trigger from react
    async clipDidEnterDropZone() {

    }

    async clipDidExitDropZone() {

    }

    // timeline controls this.
    async scrubberDidStart(offset_frame: number) {

    }

    async scrub(offset_frame: number): Promise<void> {
        // only stream through to the position and rotation keyframes
        // debounce not really 
    }

    async scrubberDidStop(offset_frame: number) {

    }
    // public streaming events into the timeline from
    async setScrubberPosition(offset: number) {
        this.scrubberPosition = offset // in ms
    }

    // should play from the clip that is closest to the to scrubber
    async play(): Promise<void> {
        console.log(`Starting Timeline`)
        this.isPlaying = true
    }

    async reset_scene() {
        for (const element of this.timelineItems) {
            if (element.type == "transform") {
                let object = this.scene.get_object_by_uuid(element.object_uuid);
                if (object) { this.transformEngine.clips[element.object_uuid].reset(object); }
            }
            else if (element.type == "audio") {
                this.audioEngine.loadClip(element.media_id);
            }
            else if (element.type == "animation") {
            }
            else if (element.type == "lipsync") {
                
            }
            else {
                this.stop()
                throw "Error New Type of element in the timeline"
            }
        }
    }

    // called by the editor update loop on each frame
    async update(deltatime:number) {
        if (this.isPlaying == false) return; // start and stop 

        if (this.scrubberPosition <= 0) {
            await this.reset_scene();
        }

        this.scrubberPosition += 1;
        //2. allow stopping.
        //3. smallest unit is a frame and it is set by the scene and is in fps, our videos will be 60fps but we can reprocess them using the pipeline.
        for (const element of this.timelineItems) {
            if (element.start_offset <= this.scrubberPosition && this.scrubberPosition <= element.ending_offset) {
                // run async
                // element.play()
                // remove the element from the list
                let object = this.scene.get_object_by_uuid(element.object_uuid)
                if (element.type == "transform") {
                    if (object) {
                        this.transformEngine.clips[element.object_uuid].length = (element.ending_offset - element.start_offset)
                        this.transformEngine.clips[element.object_uuid].step(object)
                    }
                }
                else if (element.type == "audio") {
                    // global audio track
                    this.audioEngine.playClip(element.media_id)
                }
                else if (element.type == "lipsync") {
                    if(this.scrubberPosition+1 >= element.ending_offset){
                        this.lipSyncEngine.clips[element.object_uuid].stop();
                    }
                    else if (object) {
                        await this.lipSyncEngine.clips[element.object_uuid].play(object);
                        this.lipSyncEngine.clips[element.object_uuid].step();
                    }
                }
                else if (element.type == "animation") {
                    if (object) { 
                        await this.animationEngine.clips[object.uuid].play(object); 
                        this.animationEngine.clips[object.uuid].step(deltatime);
                    }
                }
                else {
                    this.stop()
                    throw "Error New Type of element in the timeline"
                }
                //this.timelineItems = this.timelineItems.filter(item => item !== element)
            }

            // find the offset of the longest clip and play until that clip is done
            if (this.scrubberPosition >= this.timeLineLimit) { // stops at where clips should // cannot throw clip
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
//const percision = 100 // using a fake update loop mock
//
//class AudioEngineMock {
//    async play(media_id:string) {
//        console.log("Audio Playing {media_id}")
//    }
//}
//
//// Visual verification tests.
//function CheckIfBasicAudioClipWorks() {
//    const timeline = new TimeLine()
//    timeline.addPlayableClip(new ClipUI(1.0,'audio',1,0))
//    timeline.play()
//}
//
//function CheckIfBasicTransformClipWorks() {
//    const timeline = new TimeLine()
//    timeline.addPlayableClip(new ClipUI(1.0,'transform',2,0))
//    timeline.play()
//}
//
//function CheckIfBasicClipWorks() {
//    const timeline = new TimeLine()
//    timeline.addPlayableClip(new ClipUI(1.0,'animation',3,0))
//    timeline.play()
//}

// function CheckIfBasicClipWorks3SecondsAfterTimelineStops() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip1", 0, 10000))
//     timeline.play()
// }

// function CheckIfTwoClipsAtTheSameTimeWorks() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip1", 0, 1000))
//     timeline.play()
// }

// function CheckIfTwoClipsOneAfterAnotherWorks() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip1", 0, 1000))
//     timeline.addPlayableClip(new ClipUI("clip2", 0, 2000))
//     timeline.play()
// }

// function CheckIfTimeLineStopBeforeClipPlays() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip3",0,1000))
//     timeline.play()
//     setInterval(async ()=> {
//         timeline.stop()
//     },1100)
//     console.log("Stopped")
// }

// function CheckIfTimeLineStartAfterClipPlays() {
//     const timeline = new TimeLine() 
//     timeline.addPlayableClip(new ClipUI("clip3",0,1000))
//     timeline.play()
//     setInterval(async ()=> {
//         timeline.stop()
//     },500)
//     console.log("Stopped")
// }

// function CheckIfClipsPlayAllTogetherConcurrently() {
//     const timeline = new TimeLine() 
//     timeline.addPlayableClip(new ClipUI("clip1",0,1000))
//     timeline.addPlayableClip(new ClipUI("clip2",0,1000))
//     timeline.addPlayableClip(new ClipUI("clip3",0,1000))
//     timeline.addPlayableClip(new ClipUI("clip4",0,1000))
//     timeline.play()
// }

// function CheckIfClipsPlayAllTogether() {
//     const timeline = new TimeLine() 
//     timeline.addPlayableClip(new TrackClip("clip1",0,1000))
//     timeline.addPlayableClip(new TrackClip("clip2",0,1000))
//     timeline.addPlayableClip(new TrackClip("clip3",0,1000))
//     timeline.addPlayableClip(new TrackClip("clip4",0,1000))
//     timeline.play()
// }

//CheckIfBasicClipWorks()
//CheckIfTwoClipsAtTheSameTimeWorks()
// CheckIfTwoClipsOneAfterAnotherWorks()
// CheckIfTimeLineStopBeforeClipPlays()
// CheckIfTimeLineStartAfterClipPlays()
// CheckIfClipsPlayAllTogetherConcurrently()

// CheckIfClipsPlayAllTogether()

