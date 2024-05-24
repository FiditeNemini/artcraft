import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  TransitionDialogue,
  LoadingDots,
} from "~/components";
import {
  UploadNewEngineAsset,
  UploadNewEngineAssetResponse,
  MediaFileAnimationType,
  MediaFileEngineCategory,
} from "~/api/media_files/UploadNewEngineAsset";
import {
  UploadMedia,
  UploadMediaResponse,
} from "~/api/media_files/UploadMedia";
import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MMDLoader } from "three/addons/loaders/MMDLoader.js";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { EditCoverImage } from "~/api/media_files/EditCoverImage";
import { AssetType } from "~/enums";

import "./UploadModal.scss";

interface Props {
  closeModal: () => void;
  file: File;
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
  resetModal: boolean;
  setResetModal: (b: boolean) => void;
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

export function UploadModal({
  closeModal,
  file,
  isOpen,
  onClose,
  onSuccess,
  resetModal,
  setResetModal,
  type,
}: Props) {
  const [title, titleSet] = useState("");
  const [visibility, visibilitySet] = useState("public");
  const [objUploadStatus, objUploadStatusSet] = useState(UploaderState.ready);
  const [assetToken, assetTokenSet] = useState("");
  const [coverToken, coverTokenSet] = useState("");
  const [targetNode, targetNodeSet] = useState<HTMLCanvasElement | null>(null);
  const [animationType, animationTypeSet] =
    useState<MediaFileAnimationType | null>(null);

  const isCharacter = type === AssetType.CHARACTER;

  const objPreviewRef = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      targetNodeSet(node);
    }
  }, []);

  const resetModalState = useCallback(() => {
    setResetModal(false);
    titleSet("");
    visibilitySet("");
    objUploadStatusSet(UploaderState.ready);
    assetTokenSet("");
    coverTokenSet("");
    animationTypeSet(null);
  }, [setResetModal]);

  useEffect(() => {
    // modal reset needed because we don't unmount components for some reason
    if (resetModal) {
      resetModalState();
    }

    if (targetNode !== null) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.z = 2;


      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: targetNode,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(300 || 0, 300 || 0);

      const color = 0xfcece7;
      const light = new THREE.HemisphereLight(color, 0x8d8d8d, 3.0);

      scene.add(light);

      if (file) {
        if (file.name.includes(".glb")){
          const loader = new GLTFLoader();
          loader.load(
            URL.createObjectURL(file),
            (glb) => {
              glb.scene.children.forEach((child) => {
                child.userData["color"] = "#FFFFFF";
                scene.add(child);


                let maxSize = 2;
                if (scene.children.length > 0) {
                  scene.children.forEach((child) => {
                    child.traverse((object: THREE.Object3D | THREE.Mesh) => {
                      // Assuming `object` is your Three.js object and you know it's a Mesh
                      if (object instanceof THREE.Mesh) {
                        object.geometry.computeBoundingBox();
                        const boundingBox = object.geometry.boundingBox;
                        const center = new THREE.Vector3();
                        boundingBox.getCenter(center);
                        const dimensions = new THREE.Vector3();
                        boundingBox.getSize(dimensions);
                        const maxDim = Math.max(
                          dimensions.x,
                          dimensions.y,
                          dimensions.z,
                        );
                        if (maxSize < maxDim) {
                          maxSize = maxDim;
                          camera.position.set(-maxDim, maxDim, maxDim);
                          camera.lookAt(center);
                          camera.updateProjectionMatrix();
                        }
                      }
                    });
                  });
                }

                renderer.render(scene, camera);
              });
            },
            () => {},
            (loaderError) => {
              console.log("loader error:", loaderError);
              objUploadStatusSet(UploaderState.loaderError);
            },
          );
        } else if (file.name.includes(".pmd")) {
          camera.position.z = 30;
          const loader = new FontLoader();
          loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
              const textGeometry = new TextGeometry( 'MMD', {
                font: font,
                size: 100,
                depth: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 1,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5
              } );
              textGeometry.computeBoundingBox();
              const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
              const textMesh = new THREE.Mesh(textGeometry, textMaterial);
              textMesh.scale.set(0.15,0.15,0.01);
              textMesh.position.set(-22,-5,0);
              scene.add(textMesh);
              renderer.render(scene, camera);
          });

          // Cant load MMD due to threejs loader expecting ending extention.
          // const mmdLoader = new MMDLoader();
          // const url = URL.createObjectURL(file);
          // console.log(url)
          // mmdLoader.load(
          //   url,
          //   (mesh: THREE.SkinnedMesh) => {
          //     console.log("Loaded mesh")
          //     mesh.scale.set(0.1,0.1,0.1);
          //     console.log(mesh);
          //     scene.add(mesh);
          //   },
          //   (xhr) => {
          //     console.log(xhr)
          //   },
          //   (error) => {
          //     console.log(error)
          //   },
          // );
        }
        renderer.render(scene, camera);
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
    targetNode?.toBlob((blob: Blob | null) => {
      if (!blob) {
        return;
      }
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
    UploadNewEngineAsset({
      engine_category: isCharacter
        ? MediaFileEngineCategory.Character
        : MediaFileEngineCategory.Object,
      file,
      maybe_title: title,
      maybe_visibility: visibility === "public" ? "public" : "private",
      uuid_idempotency_token: uuidv4(),
      ...(isCharacter && animationType
        ? {
            maybe_animation_type: animationType,
          }
        : {}),
    })
      .then((assetRes: UploadNewEngineAssetResponse) => {
        if ("media_file_token" in assetRes) {
          assetTokenSet(assetRes.media_file_token);
          createCoverImage(assetRes.media_file_token);
        }
      })
      .catch(() => {
        objUploadStatusSet(UploaderState.assetError);
      });
  };

  const animationOptions = [
    { label: "ARKit", value: MediaFileAnimationType.ArKit },
    {
      label: "MikuMikuDance",
      value: MediaFileAnimationType.MikuMikuDance,
    },
    {
      label: "MikuMikuDance ARKit",
      value: MediaFileAnimationType.MikuMikuDanceArKit,
    },
    { label: "Mixamo", value: MediaFileAnimationType.Mixamo },
    {
      label: "Mixamo ARKit",
      value: MediaFileAnimationType.MixamoArKit,
    },
    { label: "MocapNet", value: MediaFileAnimationType.MocapNet },
    {
      label: "MocapNet ARKit",
      value: MediaFileAnimationType.MocapNetArKit,
    },
    { label: "Move AI", value: MediaFileAnimationType.MoveAi },
    {
      label: "Move AI ARKit",
      value: MediaFileAnimationType.MoveAiArKit,
    },
    { label: "Rigify", value: MediaFileAnimationType.MoveAi },
    {
      label: "Rigify ARKit",
      value: MediaFileAnimationType.MoveAiArKit,
    },
  ];

  const objUploaderContent = () => {
    switch (objUploadStatus) {
      case UploaderState.ready:
        return (
          <>
            <canvas
              {...{
                className: "object-preview-canvas m-auto",
                ref: objPreviewRef,
              }}
            ></canvas>
            <Input
              {...{
                label: "Name",
                onChange: ({ target }: React.ChangeEvent<HTMLInputElement>) =>
                  titleSet(target.value),
                placeholder: "Enter a name",
                value: title,
              }}
            />

            {isCharacter ? (
              <>
                <label
                  className="mb-2 mt-3 block"
                  htmlFor="upload-modal-animation-type-select"
                >
                  Animation type
                </label>
                <Select
                  options={animationOptions}
                  onChange={(value: MediaFileAnimationType) => {
                    animationTypeSet(value);
                  }}
                  placeholder="Select an animation type (optional)"
                  value={animationType!}
                />
              </>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                {...{
                  onClick: () => {
                    closeModal();
                    onClose();
                  },
                  variant: "secondary",
                }}
              >
                Cancel
              </Button>
              <Button
                {...{
                  onClick: () => uploadAsset(),
                }}
              >
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
              }}
            >{`Added ${title} to objects`}</div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                {...{
                  onClick: () => {
                    closeModal();
                    onClose();
                  },
                  variant: "primary",
                }}
              >
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
                }}
              >
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
                }}
              >
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
                }}
              >
                Cancel
              </Button>
              <Button
                {...{
                  onClick: () => {
                    objUploadStatusSet(UploaderState.ready);
                    resetModalState();
                  },
                  variant: "primary",
                }}
              >
                Try another
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
        onClose: () => {
          closeModal();
          onClose();
          resetModalState();
        },
        title: `Upload ${isCharacter ? "Character" : "Object"}`,
      }}
    >
      {objUploaderContent()}
    </TransitionDialogue>
  );
}
