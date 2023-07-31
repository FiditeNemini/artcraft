import React from "react";

interface Props {
  childProps?: any;
  titleIcon?: JSX.Element;
  titleComponent?: React.ComponentType;
  title?: string;
  subText: string;
  showButtons: boolean;
  actionButtons?: JSX.Element;
}


export default function PageHeader({ actionButtons, childProps, showButtons, subText, titleComponent: Title, title, titleIcon }: Props) {
  return <div className="container-panel hero-section py-4">
    <div className="panel">
      <div className="p-3 py-4 p-md-4">
        { Title ? <Title {...childProps }/> : <h1 className="fw-bold text-center text-md-start">
            { titleIcon }
            { title }
          </h1> }
        <p className="text-center text-md-start pt-1">{ subText }</p>
        { showButtons && (
          <div className="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-md-start mt-4">
            { actionButtons }
          </div>
        )}
      </div>
    </div>
  </div>;
};

// export default PageHeader;
