import React from "react";
import SubRoutes from "./routes";
import { Container } from "components/common";

export default function ComponentsLibrary() {
  return (
    <Container type="panel" className="my-5">
      <SubRoutes />
    </Container>
  );
}
