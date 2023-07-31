import React from "react";
import { useParams } from "react-router-dom";

interface VcModelViewPageProps {}

export default function VcModelViewPage(props: VcModelViewPageProps) {
  let { token } = useParams() as { token: string };
  return <div>VcModelViewPage</div>;
}
