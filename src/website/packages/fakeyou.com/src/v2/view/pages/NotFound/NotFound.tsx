import React, { useEffect, useState } from "react";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import { AITools } from "components/marketing";

export default function NotFound() {
    const [loaded, loadedSet] = useState(false);

    useEffect(() => {
        if (!loaded) {
            loadedSet(true);
            // @ts-ignore
            window.dataLayer.push({
                "event": "fe_page_not_found",
                "page": "*",
                "user_id": "$user_id"
            });
        }
    }, [loaded]);

    return (
        <Container type="panel" className="mb-5">
            <PageHeader
                title="This page couldn't be found, maybe try one of our AI media creation tools?"
                titleH2={true}
                panel={false}
            />
            <AITools />
        </Container>
    );
}
