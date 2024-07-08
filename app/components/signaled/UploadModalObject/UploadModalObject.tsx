import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  TransitionDialogue,
  LoadingDots,
} from "~/components";

import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { MMDLoader } from "three/addons/loaders/MMDLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

import {
  AssetType,
  FilterEngineCategories,
  MediaFileAnimationType,
} from "~/enums";

import "./UploadModal.scss";
import { MediaFilesApi, MediaUploadApi } from "~/Classes/ApiManager";
import { getFileExtension, getFileName } from "~/utilities";

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

export function UploadModalObject({
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
  // const [visibility, visibilitySet] = useState("public");
  const [objUploadStatus, objUploadStatusSet] = useState(UploaderState.ready);
  const [assetToken, assetTokenSet] = useState("");
  const [coverToken, coverTokenSet] = useState("");
  const [targetNode, targetNodeSet] = useState<HTMLCanvasElement | null>(null);
  const [animationType, animationTypeSet] = useState<
    MediaFileAnimationType | undefined
  >(undefined);

  const isCharacter = type === AssetType.CHARACTER;

  const objPreviewRef = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      targetNodeSet(node);
    }
  }, []);

  const resetModalState = useCallback(() => {
    setResetModal(false);
    titleSet("");
    // visibilitySet("");
    objUploadStatusSet(UploaderState.ready);
    assetTokenSet("");
    coverTokenSet("");
    animationTypeSet(undefined);
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
        if (file.name.includes(".glb")) {
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
          loader.load(
            "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
            function (font) {
              const textGeometry = new TextGeometry("MMD", {
                font: font,
                size: 100,
                depth: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 1,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5,
              });
              textGeometry.computeBoundingBox();
              const textMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
              });
              const textMesh = new THREE.Mesh(textGeometry, textMaterial);
              textMesh.scale.set(0.15, 0.15, 0.01);
              textMesh.position.set(-22, -5, 0);
              scene.add(textMesh);
              renderer.render(scene, camera);
            },
          );
        } else if (
          file.name.includes(".png") ||
          file.name.includes(".jpg") ||
          file.name.includes(".jpeg") ||
          file.name.includes(".gif")
        ) {
          const geometry = new THREE.PlaneGeometry(1, 1);
          const loader = new THREE.TextureLoader();
          const texture = loader.load(URL.createObjectURL(file));
          texture.colorSpace = THREE.SRGBColorSpace;
          console.log(texture);
          const image_material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: texture,
          });
          const obj = new THREE.Mesh(geometry, image_material);
          obj.receiveShadow = true;
          obj.castShadow = true;
          scene.add(obj);
        }
        const animate = function () {
          renderer.render(scene, camera);
        };
        renderer.setAnimationLoop(animate);
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

  const setCoverImage = async (assetToken: string, thumbnailToken: string) => {
    objUploadStatusSet(UploaderState.settingCover);
    const mediaFilesApi = new MediaFilesApi();
    const setThumbnailResponse = await mediaFilesApi.UpdateCoverImage({
      mediaFileToken: assetToken,
      imageToken: thumbnailToken,
    });
    if (!setThumbnailResponse.success) {
      objUploadStatusSet(UploaderState.coverSetError);
      return;
    }
    objUploadStatusSet(UploaderState.success);
  };

  const createCoverImage = async (assetToken: string) => {
    if (!targetNode) {
      //TODO: Verbose Error
      return;
    }
    await targetNode.toBlob(async (blob: Blob | null) => {
      if (!blob) {
        //TODO: Verbose Error
        return;
      }
      const thumbnailFile = new File([blob], "storyteller-cap.png");
      objUploadStatusSet(UploaderState.uploadingCover);
      const mediaUploadApi = new MediaUploadApi();
      const thumbnailResponse = await mediaUploadApi.UploadImage({
        uuid: uuidv4(),
        blob: thumbnailFile,
        fileName: getFileName(thumbnailFile),
        maybe_title: "thumbnail_" + title,
      });
      if (!thumbnailResponse.success || !thumbnailResponse.data) {
        objUploadStatusSet(UploaderState.coverCreateError);
        return;
      }
      coverTokenSet(thumbnailResponse.data);
      setCoverImage(assetToken, thumbnailResponse.data);
    });
  };

  const uploadAsset = async () => {
    objUploadStatusSet(UploaderState.uploadingAsset);
    const mediaUploadApi = new MediaUploadApi();
    const fileExtension = getFileExtension(file);
    console.log(fileExtension);
    const assetReponse = await (async () => {
      switch (fileExtension) {
        case ".zip":
          return mediaUploadApi.UploadPmx({
            file: file,
            fileName: file.name,
            engine_category: FilterEngineCategories.CHARACTER,
            maybe_title: title,
            maybe_animation_type: animationType,
            uuid: uuidv4(),
          });
        case ".png":
        case ".gif":
        case ".jpg":
        case ".jpeg":
          return mediaUploadApi.UploadNewEngineAsset({
            file: file,
            fileName: file.name,
            engine_category: FilterEngineCategories.IMAGE_PLANE,
            maybe_animation_type: animationType,
            maybe_title: title,
            uuid: uuidv4(),
          });
        default:
          return mediaUploadApi.UploadNewEngineAsset({
            file: file,
            fileName: file.name,
            engine_category: isCharacter
              ? FilterEngineCategories.CHARACTER
              : FilterEngineCategories.OBJECT,
            maybe_animation_type: animationType,
            maybe_title: title,
            uuid: uuidv4(),
          });
      }
    })();

    if (!assetReponse.success || !assetReponse.data) {
      objUploadStatusSet(UploaderState.assetError);
      return;
    }

    assetTokenSet(assetReponse.data);
    createCoverImage(assetReponse.data);
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
    { label: "Rigify", value: MediaFileAnimationType.Rigify },
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
                  value={animationType}
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
            >{`Added ${title} to your library`}</div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                {...{
                  onClick: () => {
                    onSuccess();
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
