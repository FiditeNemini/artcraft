import { useEffect, useState } from "react";
import { StatusAlertCheck, StatusAlertCheckResponse } from "@storyteller/components/src/api/server/StatusAlertCheck";
import { useInterval, useNotifications } from "hooks";

export default function useStatusPoll() {
  const [serverStatus, serverStatusSet] = useState<StatusAlertCheckResponse>({});
  const [initialized,initializedSet] = useState(false);
  const [downAlerted,downAlertedSet] = useState(false);
  const [upAlerted,upAlertedSet] = useState(false);
  const notifications = useNotifications();
  const defaultInt = 60000;
  const interval = Math.max(defaultInt, serverStatus.refresh_interval_millis || defaultInt);

  const onTick = () => {
    StatusAlertCheck("",{})
    .then((res: StatusAlertCheckResponse) => {
      serverStatusSet(res);
    });
  };

  useEffect(() => {
    if (!initialized) {
      initializedSet(true);
      onTick();
    }
    if (serverStatus.maybe_alert && !downAlerted) {
      downAlertedSet(true);
      upAlertedSet(false);
      notifications.create({
        autoRemove: false,
        title: "Server down for maintenence",
        content: "Please check back shortly"
      });
    } else if (!serverStatus.maybe_alert && downAlerted && !upAlerted) {
      upAlertedSet(true);
      downAlertedSet(false);
      notifications.create({ autoRemove: false, title: "Server is back online", });
    }
  },[downAlerted,initialized,notifications,serverStatus,upAlerted]);

  useInterval({ interval, onTick, locked: !initialized, });

  return serverStatus;
};