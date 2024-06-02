import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useBookmarks, useMedia, useRatings, useSession } from "hooks";
import { MediaFileType } from "@storyteller/components/src/api/_common/enums/MediaFileType";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { Prompt } from "@storyteller/components/src/api/prompts/GetPrompts";
import { CreateFeaturedItem } from "@storyteller/components/src/api/featured_items/CreateFeaturedItem";
import { DeleteFeaturedItem } from "@storyteller/components/src/api/featured_items/DeleteFeaturedItem";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { ActionButtonProps, Container, Modal, Panel } from "components/common";
import MediaPage from "./MediaPage";
import VideoMediaPage from "./VideoMediaPage";

import { faStarShooting } from "@fortawesome/pro-duotone-svg-icons";
import { faStarShooting as faStarShootingOutline } from "@fortawesome/pro-regular-svg-icons";

import "./MediaPage.scss";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";

export interface MediaSubViewProps {
  bookmarkButtonProps: ActionButtonProps;
  canAccessStudio: () => boolean;
  canBanUsers: () => boolean;
  canEdit: boolean;
  featureButtonProps: ActionButtonProps;
  isFeatured: boolean;
  isModerator: boolean;
  mediaFile?: MediaFile;
  openDeleteModal: () => void;
  prompt?: Prompt;
  ratingButtonProps: ActionButtonProps;
  status: FetchStatus;
  title: string;
  titleSet: (title: string) => void;
  urlToken: string;
}

export default function MediaPageSwitch() {
  const { token: urlToken } = useParams<{ token: string }>();
  const { canAccessStudio, canBanUsers, canEditMediaFile, user } = useSession();
  const bookmarks = useBookmarks();
  const ratings = useRatings();

  const [isFeatured, isFeaturedSet] = useState(false);
  const [title, titleSet] = useState("");

  const { mediaFile, prompt, remove, status } = useMedia({
    mediaToken: urlToken,
    onSuccess: (res: any) => {
      isFeaturedSet(res.is_featured);
      titleSet(res.maybe_title || "Untitled Video");
      ratings.gather({ res, key: "token" });
      bookmarks.gather({ res, key: "token" });
    },
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canEdit = canEditMediaFile(mediaFile?.maybe_creator_user?.user_token);
  const isModerator = canBanUsers() || false;

  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const deleteMedia = () => remove(!!user?.can_ban_users);

  let pageTitle;

  switch (mediaFile?.media_type) {
    case MediaFileType.Audio:
      pageTitle = mediaFile?.maybe_title || "Audio File";
      break;
    case MediaFileType.Video:
      pageTitle = mediaFile?.maybe_title || "Video File";
      break;
    case MediaFileType.Image:
      pageTitle = mediaFile?.maybe_title || "Image File";
      break;
    default:
      pageTitle = mediaFile?.maybe_title || "Media File";
      break;
  }

  usePrefixedDocumentTitle(pageTitle);

  const bookmarkButtonProps: ActionButtonProps = {
    ...bookmarks.makeProps({
      entityToken: urlToken,
      entityType: "media_file",
    }),
    toolTipOff: "Add to bookmarks",
    toolTipOn: "Remove bookmark",
  };

  const ratingButtonProps: ActionButtonProps = {
    ...ratings.makeProps({
      entityToken: urlToken,
      entityType: "media_file",
    }),
    toolTipOff: "Like this",
    toolTipOn: "Unlike this",
  };

  const featureButtonProps: ActionButtonProps = {
    actionType: "feature",
    isToggled: isFeatured,
    labelOff: "Feature",
    labelOn: "Featured",
    iconOn: faStarShooting,
    iconOff: faStarShootingOutline,
    toggle: () => {
      (isFeatured ? DeleteFeaturedItem : CreateFeaturedItem)("", {
        entity_type: "media_file",
        entity_token: mediaFile?.token || "",
      }).then(() => {
        isFeaturedSet((current: boolean) => {
          return !current;
        });
      });
    },
    toolTipOff: "Feature this",
    toolTipOn: "Remove from featured",
  };

  const subViewProps: MediaSubViewProps = {
    bookmarkButtonProps,
    canAccessStudio,
    canBanUsers,
    canEdit,
    featureButtonProps,
    isFeatured,
    isModerator,
    mediaFile,
    openDeleteModal,
    prompt,
    ratingButtonProps,
    status,
    title,
    titleSet,
    urlToken,
  };

  const MediaSwitch = () => {
    switch (mediaFile?.media_type) {
      case MediaFileType.Video:
        return <VideoMediaPage {...subViewProps} />;
      default:
        return <MediaPage {...subViewProps} />;
    }
  };

  return (
    <>
      <Container type="panel" className="mb-5">
        <Panel clear={true} className="py-4 media-page-container d-flex">
          {MediaSwitch()}
        </Panel>
      </Container>
      <Modal
        {...{
          content: () => (
            <>{`Are you sure you want to delete this media file? This action cannot be undone.`}</> // replace w/ dynamic later -V
            // <>{`Are you sure you want to delete "${title}"? This action cannot be undone.`}</>
          ),
          handleClose: closeDeleteModal,
          onConfirm: deleteMedia,
          show: isDeleteModalOpen,
          title: "Delete Media",
        }}
      />
    </>
  );
}
