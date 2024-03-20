import { useState } from 'react'

import { Button } from '~/components/Button'

function classNames({...classes}:Array<string>) {
  return classes.filter(Boolean).join(' ')
}

export const TopBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-ui-panel">
      <nav className="mx-auto flex max-w-full items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">FakeYou</span>
            <img className="h-10 w-auto" src="/resources/images/Storyteller-Logo-1.png" alt="Logo FakeYou StoryTeller.ai" />
          </a>
        </div>
        <Button>Login</Button>
      </nav>
    </header>
  )
}
