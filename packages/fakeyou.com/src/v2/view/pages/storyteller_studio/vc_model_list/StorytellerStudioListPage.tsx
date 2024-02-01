import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import Iframe from "react-iframe";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import PageHeaderWithImage from "components/layout/PageHeaderWithImage";
import { Container, Panel } from "components/common";
import { faCameraMovie } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function StorytellerStudioListPage(props: Props) {
  return (
    <Container type="panel">
      <PageHeaderWithImage
        headerImage="mascot/may4th.webp"
        titleIcon={faCameraMovie}
        title="Storyteller Studio"
        subText="Anyone can make films."
      />

      <Panel className="overflow-hidden">
        <Iframe
          url="https://engine.fakeyou.com?mode=studio"
          width="100%"
          height="900px"
          id=""
          className="rounded"
          display="block"
          position="relative"
        />
        {/* <div className="alert alert-info">
          <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
          <span className="fw-medium">
            Get rewarded from our $15k prize pool for creating Voice to Voice
            models!
          </span>
          <Link to="/commissions" className="fw-semibold ms-2">
            See details <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
          </Link>
        </div> */}
      </Panel>
    </Container>
  );
}

// NB(bt,2024-01-12): Commenting out so netlify builds don't yell at us
//const LoadingIcon: React.FC = () => {
//  return (
//    <>
//      <span
//        className="spinner-border spinner-border-sm ms-3"
//        role="status"
//        aria-hidden="true"
//      ></span>
//      <span className="visually-hidden">Loading...</span>
//    </>
//  );
//};

export { StorytellerStudioListPage };
