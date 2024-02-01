import React from "react";
import { Widget } from "@typeform/embed-react";
import { get, set } from "local-storage";
import './TypeformContainer.scss';

export default function TypeformWidget() {
  return (
    <div className="typeformcontainer">
      {!get<boolean>("isSubmit") ? (
        <Widget
          id="UfvpJUpF"
          style={{ width: '100%', height: '100%' }}
          opacity={80}
          onSubmit={() => {
            set<boolean>("isSubmit", true);
            console.log("Form submitted!");
          }}
          hideHeaders
          enableSandbox={false}
        />
      ) : null}
    </div>
  );
}