import React from "react";
import { PageHeader } from "components/layout"

const Title: React.ComponentType = () => <div>
  <h1 className="fw-bold text-center text-md-start">
    Hello
  </h1>
</div>;

export default function LipsyncEditor({ ...rest }) {
	return <div>
    	<PageHeader {...{ extra: Title, subText: "some text", showButtons: false,}}/>
	</div>;
};