import { useCallback, useEffect, useId, useState } from "react";
import { Button, Input, TransitionDialogue, LoadingDots } from "~/components";
import {
  UploadEngineAsset,
  UploadEngineAssetResponse,
} from "~/api/media_files/UploadEngineAsset";
import {
  UploadMedia,
  UploadMediaResponse,
} from "~/api/media_files/UploadMedia";
import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import "./UploadModal.scss";
import { fitCameraToCenteredObject } from "./fitCameraToCenteredObject";
import { EditCoverImage } from "~/api/media_files/EditCoverImage";
import { Visibility } from "~/pages/PageEnigma/js/api_manager";
import { AssetType } from "~/pages/PageEnigma/models";

interface Props {
  closeModal: () => void;
  file: File;
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
  resetModal: boolean;
  resetModalSet: (b: boolean) => void;
  type: AssetType;
}

enum UploaderState {
  ready,
  uploadingAsset,
  uploadingCover,
  settingCover,
  success,
  assetError,
  coverCreateError,
  coverSetError,
  loaderError,
}

export default function UploadModal({
  closeModal,
  file,
  isOpen,
  onClose,
  onSuccess,
  resetModal,
  resetModalSet,
  type,
}: Props) {
  const [title, titleSet] = useState("");
  const [visibility, visibilitySet] = useState("public");
  const [objUploadStatus, objUploadStatusSet] = useState(UploaderState.ready);
  const [assetToken, assetTokenSet] = useState("");
  const [coverToken, coverTokenSet] = useState("");
  const [targetNode, targetNodeSet] = useState(null);
  const objPreviewRef = useCallback((node) => {
    if (node !== null) {
      targetNodeSet(node);
    }
  }, []);

  const resetModalState = useCallback(() => {
    resetModalSet(false);
    titleSet("");
    visibilitySet("");
    objUploadStatusSet(UploaderState.ready);
    assetTokenSet("");
    coverTokenSet("");
  }, [resetModalSet]);

  useEffect(() => {
    // modal reset needed because we don't unmount components for some reason
    if (resetModal) {
      resetModalState();
    }

    if (targetNode !== null) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: targetNode,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(
        targetNode?.clientWidth || 0,
        targetNode?.clientWidth || 0,
      );

      const color = 0xfcece7;
      const light = new THREE.HemisphereLight(color, 0x8d8d8d, 3.0);
      const loader = new GLTFLoader();

      scene.add(light);

      if (file) {
        loader.load(
          URL.createObjectURL(file),
          (glb) => {
            glb.scene.children.forEach((child) => {
              child.userData["color"] = "#FFFFFF";
              scene.add(child);

              if (scene.children[1]) {
                fitCameraToCenteredObject(camera, scene.children[1]);

                renderer.render(scene, camera);
              }
            });
          },
          () => {},
          (loaderError) => {
            console.log("loader error:", loaderError);
            objUploadStatusSet(UploaderState.loaderError);
          },
        );
      }
    }
  }, [file, targetNode, resetModal, resetModalState]);

  // for visibility later

  // const visiblityOpts = [
  //   {
  //     label: "public",
  //     value: "public",
  //   },
  //   {
  //     label: "private",
  //     value: "private",
  //   },
  // ];
  // const visiblityId = `fy-uploader-modal-visibility-${useId()}`;

  const setCoverImage = (asset: string, cover: string) => {
    objUploadStatusSet(UploaderState.settingCover);
    EditCoverImage(asset, {
      cover_image_media_file_token: cover,
    })
      .then(() => {
        objUploadStatusSet(UploaderState.success);
        onSuccess();
      })
      .catch(() => {
        objUploadStatusSet(UploaderState.coverSetError);
      });
  };

  const createCoverImage = (asset: string) => {
    targetNode.toBlob((blob) => {
      // TODO failure modal
      const newCap = new File([blob], "storyteller-cap.png");
      objUploadStatusSet(UploaderState.uploadingCover);
      UploadMedia({
        uuid_idempotency_token: uuidv4(),
        file: newCap,
        source: "file",
        title: `Cover image${title ? " for " + title : ""}`,
      })
        .then((captureRes: UploadMediaResponse) => {
          coverTokenSet(captureRes.media_file_token);
          setCoverImage(asset, captureRes.media_file_token);
        })
        .catch(() => {
          objUploadStatusSet(UploaderState.coverCreateError);
        });
    });
  };

  const uploadAsset = () => {
    objUploadStatusSet(UploaderState.uploadingAsset);
    UploadEngineAsset({
      engine_category: type === AssetType.CHARACTER ? "character" : "object",
      file,
      media_file_subtype: "mixamo",
      title,
      visibility,
      uuid_idempotency_token: uuidv4(),
    })
      .then((assetRes: UploadEngineAssetResponse) => {
        if ("media_file_token" in assetRes) {
          assetTokenSet(assetRes.media_file_token);
          createCoverImage(assetRes.media_file_token);
        }
      })
      .catch(() => {
        objUploadStatusSet(UploaderState.assetError);
      });
  };

  const objUploaderContent = () => {
    switch (objUploadStatus) {
      case UploaderState.ready:
        return (
          <>
            <canvas
              {...{
                className: "object-preview-canvas",
                ref: objPreviewRef,
              }}></canvas>
            <Input
              {...{
                label: "Name",
                onChange: ({ target }: React.ChangeEvent<HTMLInputElement>) =>
                  titleSet(target.value),
                placeholder: "Enter a name",
                value: title,
              }}
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button
                {...{
                  onClick: () => {
                    closeModal();
                    onClose();
                  },
                  variant: "secondary",
                }}>
                Cancel
              </Button>
              <Button
                {...{
                  onClick: () => uploadAsset(targetNode),
                }}>
                Upload
              </Button>
            </div>
          </>
        );
      case UploaderState.uploadingAsset:
      case UploaderState.uploadingCover:
      case UploaderState.settingCover:
        return (
          <div {...{ className: "obj-uploader-modal-load-view" }}>
            <LoadingDots {...{ className: "uploader-dots" }} />
            <div {...{ className: "uploader-message" }}>Uploading...</div>
          </div>
        );
      case UploaderState.success:
        return (
          <div {...{ className: "obj-uploader-modal-success-view" }}>
            <div
              {...{
                className: "uploader-message",
              }}>{`Added ${title} to objects`}</div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                {...{
                  onClick: () => {
                    closeModal();
                    onClose();
                  },
                  variant: "primary",
                }}>
                Ok
              </Button>
            </div>
          </div>
        );
      case UploaderState.assetError:
      case UploaderState.coverCreateError:
      case UploaderState.coverSetError:
        return (
          <>
            {objUploadStatus === UploaderState.assetError
              ? "There was a problem uploading your object."
              : "There was a problem creating art for your object"}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                {...{
                  onClick: () => {
                    closeModal();
                    onClose();
                  },
                  variant: "secondary",
                }}>
                Cancel
              </Button>
              <Button
                {...{
                  onClick: () => {
                    switch (objUploadStatus) {
                      case UploaderState.assetError: {
                        uploadAsset();
                        break;
                      }
                      case UploaderState.coverCreateError: {
                        createCoverImage(assetToken);
                        break;
                      }
                      case UploaderState.coverSetError: {
                        setCoverImage(assetToken, coverToken);
                        break;
                      }
                    }
                  },
                  variant: "primary",
                }}>
                Try again
              </Button>
            </div>
          </>
        );
      case UploaderState.loaderError:
        return (
          <>
            There was a problem loading your object. Try another.
            <div className="mt-6 flex justify-end gap-2">
              <Button
                {...{
                  onClick: () => {
                    closeModal();
                    onClose();
                  },
                  variant: "secondary",
                }}>
                Cancel
              </Button>
              <Button
                {...{
                  onClick: () => {
                    objUploadStatusSet(UploaderState.ready);
                    resetModalState();
                  },
                  variant: "primary",
                }}>
                Cancel
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <TransitionDialogue
      {...{
        isOpen,
        onClose,
        title: "Upload",
      }}>
      {objUploaderContent()}
    </TransitionDialogue>
  );
}
