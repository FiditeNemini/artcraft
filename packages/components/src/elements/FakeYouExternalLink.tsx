import React  from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

interface Props {
  hideIcon?: boolean,
  iconBeforeText?: boolean,
  title?: string,
  children?: string|Element|Array<any>, // Link text
}

function FakeYouExternalLink(props: Props) {
  let linkBody = props.children === undefined ? 
    <>FakeYou</> : 
    <>{props.children}</>;

  const showIcon = !(props.hideIcon ? true : false);
  const iconBeforeText = props.iconBeforeText ? true : false;

  const linkTitle = props.title ? props.title : 'FakeYou';

  if (showIcon) {
    linkBody = iconBeforeText ? 
        <><FontAwesomeIcon icon={faExternalLinkAlt} title={linkTitle}/> {linkBody}</> :
        <>{linkBody} <FontAwesomeIcon icon={faExternalLinkAlt} title={linkTitle}/></> ;
  }

  return (
    <a href="https://fakeyou.com?from=storyteller.io" 
       target="_blank" 
       rel="noopener noreferrer">{linkBody}</a>
  )
}

export { FakeYouExternalLink };
