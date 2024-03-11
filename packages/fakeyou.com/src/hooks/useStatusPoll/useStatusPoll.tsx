import { useEffect, useState } from "react";
import { StatusAlertCheck, StatusAlertCheckResponse } from "@storyteller/components/src/api/server/StatusAlertCheck";
import { useInterval, useNotifications } from "hooks";

export default function useStatusPoll() {
  const [serverStatus, serverStatusSet] = useState<StatusAlertCheckResponse>({});
  const [initialized,initializedSet] = useState(false);
  const [alerted,alertedSet] = useState(false);
  const notifications = useNotifications();

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
    if (serverStatus.maybe_alert && !alerted) {
      alertedSet(true);
      notifications.create({ autoRemove: false, title: "Server down for maintenence", });
    } else if (serverStatus.maybe_alert && alerted) {
      alertedSet(false);
      notifications.create({ autoRemove: false, title: "Server is back online", });
    }
  },[alerted,initialized,notifications,serverStatus]);

  useInterval({ interval: 15000, onTick, locked: !initialized, });

  return serverStatus;
};