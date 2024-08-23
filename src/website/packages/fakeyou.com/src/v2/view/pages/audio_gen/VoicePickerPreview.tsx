import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faChevronRight,
  faThumbsUp,
} from "@fortawesome/pro-solid-svg-icons";
import WeightCoverImage from "components/common/WeightCoverImage";
import CardBadge from "components/entities/CardBadge";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { isMobile } from "react-device-detect";
import { WeightType } from "@storyteller/components/src/api/_common/enums";
import useWeightTypeInfo from "hooks/useWeightTypeInfo";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { useLocalize } from "hooks";

interface VoicePickerPreviewProps {
  selectedVoice: any;
  openModal: () => void;
}

const VoicePickerPreview: React.FC<VoicePickerPreviewProps> = ({
  selectedVoice,
  openModal,
}) => {
  const bucketConfig = new BucketConfig();
  const preview = selectedVoice?.cover_image
    ?.maybe_cover_image_public_bucket_path
    ? bucketConfig.getCdnUrl(
        selectedVoice?.cover_image?.maybe_cover_image_public_bucket_path
      )
    : "/images/avatars/default-pfp.png";

  const weightTypeInfo = useWeightTypeInfo(
    selectedVoice?.weight_type || WeightType.NONE
  );
  const { label: weightType, color: weightTagColor } = weightTypeInfo;

  const { t } = useLocalize("NewTTS");

  return (
    <div className="fy-weight-picker-preview" onClick={openModal}>
      <WeightCoverImage
        {...{
          src: preview,
          height: isMobile ? 70 : 80,
          width: isMobile ? 70 : 80,
        }}
      />
      <div className="d-flex flex-column justify-content-center flex-grow-1">
        <h2 className="mb-1 fw-semibold d-flex gap-2 align-items-center fs-5 fy-weight-picker-preview-text">
          <div>{selectedVoice?.title || t("button.labelNoVoice")}</div>
          {selectedVoice?.weight_type && (
            <>
              <CardBadge
                className={`d-none d-lg-flex py-1 fy-entity-type-${
                  selectedVoice?.weight_type || ""
                }`}
                label={weightType || ""}
                small={true}
                color={weightTagColor || ""}
              />
              <span className="d-none d-lg-flex align-items-center gap-1 fs-7 opacity-75">
                <FontAwesomeIcon icon={faThumbsUp} />
                {selectedVoice?.stats?.positive_rating_count}
              </span>
            </>
          )}
        </h2>
        {selectedVoice ? (
          <span className="fs-7 d-flex gap-1 flex-column flex-lg-row">
            <div className="d-flex align-items-center">
              <Link
                className="fw-medium d-flex align-items-center"
                to={`/profile/${selectedVoice?.creator?.username || ""}`}
                onClick={e => e.stopPropagation()}
                style={{ gap: "6px" }}
              >
                <Gravatar
                  size={20}
                  noHeight={true}
                  email_hash={selectedVoice?.creator?.gravatar_hash}
                  avatarIndex={
                    selectedVoice?.creator?.default_avatar?.image_index || 0
                  }
                  backgroundIndex={
                    selectedVoice?.creator?.default_avatar?.color_index || 0
                  }
                />
                {" " + selectedVoice?.creator?.display_name || ""}
              </Link>
              <CardBadge
                className={`ms-2 d-flex d-lg-none fy-entity-type-${
                  selectedVoice?.weight_type || ""
                }`}
                label={weightType || ""}
                small={true}
                color={weightTagColor || ""}
              />
              <span className="ms-2 d-flex d-lg-none align-items-center gap-1 fs-7 opacity-75">
                <FontAwesomeIcon icon={faThumbsUp} />
                {selectedVoice?.stats?.positive_rating_count}
              </span>
            </div>
            <div className="d-flex gap-1 align-items-center">
              <span className="d-none d-lg-block px-1 opacity-50">|</span>
              <Link
                to={`/weight/${selectedVoice.weight_token}`}
                className="fw-medium"
                onClick={e => e.stopPropagation()}
              >
                {t("link.viewDetails")}
                <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
              </Link>
            </div>
          </span>
        ) : (
          <span className="fs-7 opacity-75">
            {t("button.labelClickToSelect")}
          </span>
        )}
      </div>
      <div className="d-flex gap-2 align-items-center">
        <span className="fw-medium opacity-75 pe-1 d-none d-lg-block">
          {selectedVoice
            ? t("button.labelChangeVoice")
            : t("button.labelSelectVoice")}
        </span>
        <FontAwesomeIcon icon={faChevronRight} className="fs-5 me-1" />
      </div>
    </div>
  );
};

export default VoicePickerPreview;
