import { useContext } from 'react';

import { Button } from '~/components/Button'
import { faRightToBracket } from '@fortawesome/pro-solid-svg-icons'
import { TopBarInnerContext } from '~/contexts/TopBarInner';

export const TopBar = () => {
  return (
    <header className="
      fixed top-0 left-0 w-full
      bg-ui-panel border-b border-ui-panel-border
    ">
      <nav className="mx-auto flex max-w-full items-center justify-between p-4" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">FakeYou</span>
            <img className="h-10 w-auto ml-0.5" src="/resources/images/Storyteller-Logo-1.png" alt="Logo FakeYou StoryTeller.ai" />
          </a>
          <span className="w-4 lg:w-8"/>
          <TopBarInner />
        </div>
        <Button icon={faRightToBracket}>Login</Button>
      </nav>
    </header>
    
  )
}

const TopBarInner = ()=>{
  const { TopBarInner } = useContext(TopBarInnerContext) || {}
  return(TopBarInner);
}