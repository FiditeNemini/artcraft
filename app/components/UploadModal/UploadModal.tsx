import { useCallback, useEffect, useId, useState } from "react";
import { Button, Input, TransitionDialogue } from "~/components";
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

interface Props {
  closeModal: () => void;
  file: File;
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
}

export default function UploadModal({
  closeModal,
  file,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [targetNode, targetNodeSet] = useState(null);
  const objPreviewRef = useCallback((node) => {
    if (node !== null) {
      targetNodeSet(node);
    }
  }, []);

  useEffect(() => {
    if (!!targetNode) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );

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

      loader.load(URL.createObjectURL(file), (glb) => {
        glb.scene.children.forEach((child) => {
          child.userData["color"] = "#FFFFFF";
          scene.add(child);

          if (scene.children[1]) {
            fitCameraToCenteredObject(camera, scene.children[1]);

            renderer.render(scene, camera);
          }
        });
      });
    }
  }, [file, targetNode]);

  const [name, nameSet] = useState("");
  const visiblityOpts = [
    {
      label: "public",
      value: "public",
    },
    {
      label: "private",
      value: "private",
    },
  ];
  const visiblityId = `fy-uploader-modal-visibility-${useId()}`;

  const submitUpload = () => {
    UploadEngineAsset({
      uuid_idempotency_token: uuidv4(),
      file,
      media_file_subtype: "mixamo",
    }).then((assetRes: UploadEngineAssetResponse) => {
      if ("media_file_token" in assetRes) {
        targetNode.toBlob((blob) => {
          // TODO failure modal
          const newCap = new File([blob], "storyteller-cap.png");

          UploadMedia({
            uuid_idempotency_token: uuidv4(),
            file: newCap,
            source: "file",
          }).then((captureRes: UploadMediaResponse) => {
            EditCoverImage(assetRes.media_file_token, {
              cover_image_media_file_token: captureRes.media_file_token,
            }).then(() => {
              closeModal();
              onSuccess();
            });
          });
        });
      }
    });
  };

  return (
    <TransitionDialogue
      {...{
        isOpen,
        onClose,
        title: "Upload",
      }}>
      <canvas
        {...{
          className: "object-preview-canvas",
          ref: objPreviewRef,
        }}></canvas>
      <Input
        {...{
          label: "Name",
          onChange: ({ target }: React.ChangeEvent) => nameSet(target.value),
          value: name,
        }}
      />
      <label {...{ htmlFor: visiblityId }}>Visibility</label>
      <select {...{ id: visiblityId }}>
        {visiblityOpts.map(({ label, value }, key) => (
          <option key={key} {...{ value }}>
            {label}
          </option>
        ))}
      </select>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          {...{
            onClick: () => {
              closeModal();
            },
            variant: "secondary",
          }}>
          Cancel
        </Button>
        <Button
          {...{
            onClick: submitUpload,
          }}>
          Upload
        </Button>
      </div>
    </TransitionDialogue>
  );
}
