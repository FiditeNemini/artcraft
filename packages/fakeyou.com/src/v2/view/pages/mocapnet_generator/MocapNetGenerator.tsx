import React, { useState } from "react";
import { useLocalize } from "hooks";

export default function MocapNet(){
  const { t } = useLocalize("MocapNetGenerator");
  return <h1>{t("headings.title")}</h1>
}