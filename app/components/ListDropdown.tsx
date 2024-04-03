import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { faCheck, faChevronDown } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


interface ListDropdownProps {
  list: {[key: string] : string}[];
}
export const ListDropdown = ({
  list
}:ListDropdownProps) => {
  const [selected, setSelected] = useState(list[0])

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full h-10 cursor-pointer rounded-md bg-brand-secondary py-2 pl-3 pr-10 text-left outline-none outline-offset-0 transition-all duration-150 ease-in-out focus:outline-brand-primary sm:text-sm">
          <span className="block truncate">{selected.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon icon={faChevronDown} aria-hidden="true"/>
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-brand-secondary py-1 text-base shadow-lg focus:outline-none sm:text-sm">
            {list.map((item, itemIdx) => (
              <Listbox.Option
                key={itemIdx}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4  text-white ${
                    active ? 'bg-brand-secondary-400' : ''
                  }`
                }
                value={item}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {Object.values(item)[0]}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                        <FontAwesomeIcon icon={faCheck} aria-hidden="true"/>
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}