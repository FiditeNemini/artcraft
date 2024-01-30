import React from "react";
import { Widget } from "@typeform/embed-react";
import { get, set } from "local-storage";

export default function TypeformWidget() {
  return (
    <div>
      {!get<boolean>("isSubmit") ? (
        <Widget
          id="UfvpJUpF?utm_source=xxxxx"
          height={400}
          opacity={80}
          onSubmit={() => {
            set<boolean>("isSubmit", true);
            console.log("Form submitted!");
            // window.location.reload();
          }}
          hideHeaders
          // disableAutoFocus
          enableSandbox
        />
      ) : null}
    </div>
  );
}
