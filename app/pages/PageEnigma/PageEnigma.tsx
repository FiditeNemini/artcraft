import {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  faChevronLeft,
  faWandSparkles,
} from "@fortawesome/pro-solid-svg-icons";


import {
  Button,
  ButtonLink,
} from '~/components';
import { ButtonDialogue } from '~/modules/ButtonDialogue';
import { TopBarHelmet } from '~/modules/TopBarHelmet/TopBarHelmet';
import { SidePanel } from '~/modules/SidePanel';
import { Tabs } from '~/modules/Tabs';
import { Controls3D } from './comps/Controls3D';
import { ControlsVideo } from './comps/ControlsVideo';
import { Timeline } from './comps/Timeline';

import Editor from './js/editor';

export const PageEnigma = () => {
  // const { setTopBarInner } = useContext(TopBarInnerContext) || {};

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const editorCallback = useCallback(() => {
    // handle editorCallback here
  },[]);

  useEffect(() => { //componentDidMount
    
    if (editorRef.current == null) {
      editorRef.current = new Editor();
      editorRef.current.initialize();
    }

  }, []);

  const handleButtonSave = ()=>{
    editorRef.current?.save();
  }

  const handleButtonCameraView = ()=> {
    editorRef.current?.change_camera_view();
  }

  return(
    <div>
      <TopBarHelmet>
        <div className="flex grow justify-between">
            <ButtonLink
              to={"/"}
              variant='secondary'
              icon={faChevronLeft}
            >
              Back to Dashboard
            </ButtonLink>
            <Button
              icon={faWandSparkles}
            >
                Generate Movie
            </Button>
            <span className="w-8"/>
          </div>
      </TopBarHelmet>
      <canvas ref={canvasRef} id="video-scene" width="1280px" height="720px" />
      <div className='fixed top-20 left-4'>
        <div className="flex mt-2 gap-2">
          <Button variant="secondary" onClick={handleButtonCameraView}>Toggle Camera View</Button>
          <Button variant="secondary" onClick={handleButtonSave}>Save Scene</Button>
          <ButtonDialogue
            buttonProps={{
              variant: 'secondary',
              label: 'Help'
            }}
            title="Help"
          >
            <p>Do you need help?</p>
            <p>Ask Michael about this project</p>
            <p>Ask Miles about ThreeJS</p>
            <p>Ask Wil about React</p>
          </ButtonDialogue>
          <Controls3D/>
          <ControlsVideo/>
        </div>
      </div>
      <SidePanel>
        <Tabs tabs={[
          {
            header: 'Animation',
            children: <p>Animation Tab</p>
          },{
            header: 'Camera',
            children: <p>Camera Tab</p>
          },{
            header: 'Audio',
            children: <p>Audio Tab</p>
          },{
            header: 'Styling',
            children: <p>Styling Tab</p>
          }
        ]}/>
      </SidePanel>
      <Timeline editorCurrent={editorRef.current}/>
    </div>
  );
}