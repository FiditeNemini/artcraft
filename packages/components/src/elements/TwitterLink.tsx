import React  from 'react';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  hideIcon?: boolean,
  iconBeforeText?: boolean,
  title?: string,
  children?: string|Element|Array<any>, // Optional link text, child elements, etc.
}

function TwitterLink(props: Props) {
  let linkBody = props.children === undefined ? 
    <>Twitter</> : 
    <>{props.children}</>;

  const showIcon = !(props.hideIcon ? true : false);
  const iconBeforeText = props.iconBeforeText ? true : false;

  const linkTitle = props.title ? props.title : 'FakeYou Twitter';

  if (showIcon) {
    linkBody = iconBeforeText ? 
        <><FontAwesomeIcon icon={faTwitter} title={linkTitle}/> {linkBody}</> :
        <>{linkBody} <FontAwesomeIcon icon={faTwitter} title={linkTitle}/></> ;
  }

  return (
    <a href="https://twitter.com/intent/follow?screen_name=FakeYouApp" 
       target="_blank" 
       rel="noopener noreferrer">{linkBody}</a>
  )
}

export { TwitterLink };
