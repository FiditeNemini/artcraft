// Write unsubcribe and run the remainder of the clip tech.
class TrackClip {
    name: string
    startOffset: number // ms in the 0 100 | 10 second clip
    timerID: NodeJS.Timeout | null
    lengthOfClip: number

    constructor(name: string, startOffset: number, lengthOfClip: number) {
        this.startOffset = startOffset
        this.lengthOfClip = lengthOfClip
        this.name = name
        this.timerID = null
    }

    async play(): Promise<void> {
        console.log(`Playing ${this.name}`)
        this.timerID = setInterval(async () => {
            console.log(`Running async ${this.name}`)
            this.stop()
        }, this.lengthOfClip)
    }

    async stop(): Promise<void> {
        clearInterval(this.timerID!)
        console.log(`Stopping ${this.name}`)
    }
}

class TimeLine {
    timelineItems: TrackClip[]
    timerID: NodeJS.Timeout | null
    timeLineLimit: number
    
    runningClips: TrackClip[]

    constructor() {
        this.timelineItems = []
        this.timerID = null
        this.timeLineLimit = 1000 * 10
        this.runningClips = []
    }

    async addPlayableClip(clip: TrackClip): Promise<void> {
        this.timelineItems.push(clip)
    }

    async play(): Promise<void> {
        let start = 0
        const updateInterval = 100
        const timerID = setInterval(async () => {
            console.log(`Current Time:${start}`)
            
            // get last updated time when stopped
            for (const element of this.timelineItems) {
                if (element.startOffset >= start) {
                    element.play()
                    // remove the element
                    this.timelineItems = this.timelineItems.filter(item => item !== element)
                }
            }
            if (start == this.timeLineLimit || this.timelineItems.length == 0) {
                this.stop()
            }
            
            start += updateInterval
        }, updateInterval)
        
        this.timerID = timerID
    }

    async stop(): Promise<void> {
        console.log(`Stopping Timeline`)
        clearInterval(this.timerID!)
    }
}

// How much timeline precision we have
const percision = 100

// Visual verification tests.
function CheckIfBasicClipWorks() {
    const api = new TimeLine()
    api.addPlayableClip(new TrackClip("clip1", 0, 1000))
    api.play()
}

function CheckIfBasicClipWorks3SecondsAfterTimelineStops() {
    const api = new TimeLine()
    api.addPlayableClip(new TrackClip("clip1", 0, 10000))
    api.play()
}

function CheckIfTwoClipsAtTheSameTimeWorks() {
    const api = new TimeLine()
    api.addPlayableClip(new TrackClip("clip1", 0, 1000))
    api.play()
}

function CheckIfTwoClipsOneAfterAnotherWorks() {
    const api = new TimeLine()
    api.addPlayableClip(new TrackClip("clip1", 0, 1000))
    api.addPlayableClip(new TrackClip("clip2", 0, 2000))
    api.play()
}

function CheckIfTimeLineStopBeforeClipPlays() {
    const api = new TimeLine()
    api.addPlayableClip(new TrackClip("clip3",0,1000))
    api.play()
    setInterval(async ()=> {
        api.stop()
    },1100)
    console.log("Stopped")
}

function CheckIfTimeLineStartAfterClipPlays() {
    const api = new TimeLine() 
    api.addPlayableClip(new TrackClip("clip3",0,1000))
    api.play()
    setInterval(async ()=> {
        api.stop()
    },500)
    console.log("Stopped")
}

function CheckIfClipsPlayAllTogetherConcurrently() {
    const api = new TimeLine() 
    api.addPlayableClip(new TrackClip("clip1",0,1000))
    api.addPlayableClip(new TrackClip("clip2",0,1000))
    api.addPlayableClip(new TrackClip("clip3",0,1000))
    api.addPlayableClip(new TrackClip("clip4",0,1000))
    api.play()
}

function CheckIfClipsPlayAllTogether() {
    const api = new TimeLine() 
    api.addPlayableClip(new TrackClip("clip1",0,1000))
    api.addPlayableClip(new TrackClip("clip2",0,1000))
    api.addPlayableClip(new TrackClip("clip3",0,1000))
    api.addPlayableClip(new TrackClip("clip4",0,1000))
    api.play()
}

CheckIfBasicClipWorks()
//CheckIfTwoClipsAtTheSameTimeWorks()
// CheckIfTwoClipsOneAfterAnotherWorks()
// CheckIfTimeLineStopBeforeClipPlays()
// CheckIfTimeLineStartAfterClipPlays()
// CheckIfClipsPlayAllTogetherConcurrently()

// CheckIfClipsPlayAllTogether()
