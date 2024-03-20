import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'


const products = [
  { name: 'Analytics', description: 'Get a better understanding of your traffic', href: '#', //icon: ChartPieIcon 
  },
  { name: 'Engagement', description: 'Speak directly to your customers', href: '#', //icon: CursorArrowRaysIcon 
  },
  { name: 'Security', description: 'Your customers’ data will be safe and secure', href: '#', //icon: FingerPrintIcon 
  },
  { name: 'Integrations', description: 'Connect with third-party tools', href: '#', //icon: SquaresPlusIcon
  },
  { name: 'Automations', description: 'Build strategic funnels that will convert', href: '#', //icon: ArrowPathIcon 
  },
]
const callsToAction = [
  { name: 'Watch demo', href: '#', //icon: PlayCircleIcon
  },
  { name: 'Contact sales', href: '#', //icon: PhoneIcon 
  },
]

function classNames({...classes}:Array<string>) {
  return classes.filter(Boolean).join(' ')
}

export const TopBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-ui-panel">
      <nav className="mx-auto flex max-w-full items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">FakeYou</span>
            <img className="h-8 w-auto" src="/resources/images/FakeYou-Logo-2.png" alt="Logo FakeYou StoryTeller.ai" />
          </a>
        </div>
      </nav>
    </header>
  )
}
