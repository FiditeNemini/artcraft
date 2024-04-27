import { faAngleLeft, faClose } from "@fortawesome/pro-solid-svg-icons";
import { ButtonIcon } from "~/components";
import {
  lastSelectedTab,
  selectedTab,
  sidePanelVisible,
} from "~/pages/PageEnigma/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  title: string;
  onBack?: () => void;
}

export function TabTitle({ title, onBack }: Props) {
  const onClose = () => {
    lastSelectedTab.value = selectedTab.value;
    selectedTab.value = null;
    sidePanelVisible.value = false;
  };

  return (
    <div className="flex items-center justify-between px-4">
      {onBack ? (
        <div className="flex items-center gap-2">
          <button onClick={onBack}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          <div className="align-middle text-base font-bold">{title}</div>
        </div>
      ) : (
        <div className="align-middle text-base font-bold">{title}</div>
      )}
      <ButtonIcon
        onClick={onClose}
        icon={faClose}
        size="lg"
        className="h-auto w-auto opacity-75 hover:opacity-50"
      />
    </div>
  );
}
