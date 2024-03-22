// Write unsubcribe and run the remainder of the clip tech.
class Clip {
    name: string
    startOffset: number
    timerID: NodeJS.Timeout | null
    lengthOfClip: number
    scrubberEndingPosition: number

    constructor(name: string, startOffset: number, lengthOfClip: number) {
        this.startOffset = startOffset
        this.lengthOfClip = lengthOfClip
        this.name = name
        this.timerID = null

        this.scrubberEndingPosition = 100
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

class API {
    timelineItems: Clip[]
    timerID: NodeJS.Timeout | null
    timeLineLimit: number
    
    runningClips: Clip[]

    constructor() {
        this.timelineItems = []
        this.timerID = null
        this.timeLineLimit = 1000 * 10
        this.runningClips = []
    }

    async addPlayableClip(clip: Clip): Promise<void> {
        this.timelineItems.push(clip)
    }

    async start(): Promise<void> {
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
    const api = new API()
    api.addPlayableClip(new Clip("clip1", 0, 1000))
    api.start()
}

function CheckIfBasicClipWorks3SecondsAfterTimelineStops() {
    const api = new API()
    api.addPlayableClip(new Clip("clip1", 0, 10000))
    api.start()
}

function CheckIfTwoClipsAtTheSameTimeWorks() {
    const api = new API()
    api.addPlayableClip(new Clip("clip1", 0, 1000))
    api.start()
}

function CheckIfTwoClipsOneAfterAnotherWorks() {
    const api = new API()
    api.addPlayableClip(new Clip("clip1", 0, 1000))
    api.addPlayableClip(new Clip("clip2", 0, 2000))
    api.start()
}

function CheckIfTimeLineStopBeforeClipPlays() {
    const api = new API()
    api.addPlayableClip(new Clip("clip3",0,1000))
    api.start()
    setInterval(async ()=> {
        api.stop()
    },1100)
    console.log("Stopped")
}

function CheckIfTimeLineStartAfterClipPlays() {
    const api = new API() 
    api.addPlayableClip(new Clip("clip3",0,1000))
    api.start()
    setInterval(async ()=> {
        api.stop()
    },500)
    console.log("Stopped")
}

function CheckIfClipsPlayAllTogetherConcurrently() {
    const api = new API() 
    api.addPlayableClip(new Clip("clip1",0,1000))
    api.addPlayableClip(new Clip("clip2",0,1000))
    api.addPlayableClip(new Clip("clip3",0,1000))
    api.addPlayableClip(new Clip("clip4",0,1000))
    api.start()
}

function CheckIfClipsPlayAllTogether() {
    const api = new API() 
    api.addPlayableClip(new Clip("clip1",0,1000))
    api.addPlayableClip(new Clip("clip2",0,1000))
    api.addPlayableClip(new Clip("clip3",0,1000))
    api.addPlayableClip(new Clip("clip4",0,1000))
    api.start()
}

CheckIfBasicClipWorks()
CheckIfTwoClipsAtTheSameTimeWorks()
// CheckIfTwoClipsOneAfterAnotherWorks()
// CheckIfTimeLineStopBeforeClipPlays()
// CheckIfTimeLineStartAfterClipPlays()
// CheckIfClipsPlayAllTogetherConcurrently()

// CheckIfClipsPlayAllTogether()
