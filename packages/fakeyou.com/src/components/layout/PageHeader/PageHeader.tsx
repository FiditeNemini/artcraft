import React from "react";

interface Props {
  titleIcon?: JSX.Element;
  extra?: React.ComponentType;
  title?: string;
  subText: string;
  showButtons: boolean;
  actionButtons?: JSX.Element;
}


//export default function PageHeader({ actionButtons, showButtons, subText, Extra, title, titleIcon }: Props)

const PageHeader: React.FunctionComponent<Props> = ({ actionButtons, showButtons, subText, extra, title, titleIcon }) => {
  console.log('aaa',extra);
  const Extra = extra || null;
  // return <div>Hiii</div>;
  return <Extra/>;
  // return <div className="container-panel hero-section py-4">
  //   <div className="panel">
  //     <div className="p-3 py-4 p-md-4">
  //       <Extra hello="true"/>
  //        {/* {
  //            Title ? (<Title />) :  <h1 className="fw-bold text-center text-md-start">
  //                 { titleIcon }
  //                 { title }
  //               </h1>
  //             }*/}
  //       <p className="text-center text-md-start pt-1">{ subText }</p>
  //       { showButtons && (
  //         <div className="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-md-start mt-4">
  //           { actionButtons }
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // </div>;
};

export default PageHeader;
