import { faChevronLeft, faClose } from "@fortawesome/pro-solid-svg-icons";
import { ButtonIcon } from "~/components";
import {
  lastSelectedTab,
  selectedTab,
  sidePanelVisible,
} from "~/pages/PageEnigma/store";

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
    <div className="flex items-center justify-between px-4 pt-4">
      {onBack ? (
        <div className="flex items-center gap-3">
          <ButtonIcon
            onClick={onBack}
            icon={faChevronLeft}
            className="h-auto w-auto text-xl opacity-50 hover:opacity-90"
          />
          <div className="align-middle text-base font-bold">{title}</div>
        </div>
      ) : (
        <div className="align-middle text-base font-bold">{title}</div>
      )}
      <ButtonIcon
        onClick={onClose}
        icon={faClose}
        className="h-auto w-auto text-xl opacity-50 hover:opacity-90"
      />
    </div>
  );
}
