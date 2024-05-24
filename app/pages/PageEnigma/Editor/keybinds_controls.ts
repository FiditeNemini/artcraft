import Editor from "./editor";
import * as THREE from "three";
import { hideObjectPanel, hotkeysStatus, showObjectPanel } from "../signals";

export class MouseControls {
    editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    onMouseDown(event: any) {
        if (event.button === 1 && this.editor.camera_person_mode) {
            this.editor.lockControls?.lock();
        }
    }

    onMouseUp(event: any) {
        if (event.button === 1) {
            this.editor.lockControls?.unlock();
        }

        if (event.button !== 0 && this.editor.camera) {
            const camera_pos = new THREE.Vector3(
                parseFloat(this.editor.camera.position.x.toFixed(2)),
                parseFloat(this.editor.camera.position.y.toFixed(2)),
                parseFloat(this.editor.camera.position.z.toFixed(2)),
            );
            this.editor.camera_last_pos.copy(camera_pos);
        }
    }

    onkeydown(event: KeyboardEvent) {
        if (hotkeysStatus.value.disabled) {
            return;
        }
        if (event.key === "f" && this.editor.selected && this.editor.orbitControls) {
            this.editor.orbitControls.target.copy(this.editor.selected.position);
            this.editor.orbitControls.maxDistance = 4;
            this.editor.orbitControls.update();
            this.editor.orbitControls.maxDistance = 999;
            return;
        }
        if (event.key === " ") {
            if (!this.editor.rendering && !this.editor.switchPreviewToggle && this.editor.selectedCanvas) {
                this.editor.togglePlayback();
            }
            return;
        }
        if (event.key === "Backspace" || event.key === "Delete") {
            if (this.editor.selected) {
                this.editor.deleteObject(this.editor.selected.uuid);
            }
            return;
        }
    }

    // Sets new mouse location usually used in raycasts.
    onMouseMove(event: any) {
        if(this.editor.canvReference == undefined) { return; }
        const rect = this.editor.canvReference.getBoundingClientRect();
        if (this.editor.mouse == undefined) {
            return;
        }
        this.editor.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.editor.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.editor.timeline.mouse = this.editor.mouse;
    }

    // When the mouse clicks the screen.
    onMouseClick() {
        if(this.editor.camera == undefined) { return; }
        const camera_pos = new THREE.Vector3(
            parseFloat(this.editor.camera.position.x.toFixed(2)),
            parseFloat(this.editor.camera.position.y.toFixed(2)),
            parseFloat(this.editor.camera.position.z.toFixed(2)),
        );
        if (this.editor.camera_last_pos.equals(new THREE.Vector3(0, 0, 0))) {
            this.editor.camera_last_pos.copy(camera_pos);
        }

        if (
            this.editor.raycaster == undefined ||
            this.editor.mouse == undefined ||
            this.editor.control == undefined ||
            this.editor.outlinePass == undefined ||
            this.editor.camera_person_mode ||
            !this.editor.camera_last_pos.equals(camera_pos)
        ) {
            this.editor.camera_last_pos.copy(camera_pos);
            return;
        }
        this.editor.camera_last_pos.copy(camera_pos);

        this.editor.raycaster.setFromCamera(this.editor.mouse, this.editor.camera);
        const interactable: any[] = [];
        this.editor.activeScene.scene.children.forEach((child: THREE.Object3D) => {
            if (child.name != "") {
                if (
                    child.type == "Mesh" ||
                    child.type == "Object3D" ||
                    child.type == "Group" ||
                    child.type == "SkinnedMesh"
                ) {
                    interactable.push(child);
                }
            }
        });
        const intersects = this.editor.raycaster.intersectObjects(interactable, true);

        if (intersects.length > 0) {
            if (intersects[0].object.type != "GridHelper") {
                let currentObject = intersects[0].object;
                while (currentObject.parent && currentObject.parent.type !== "Scene") {
                    currentObject = currentObject.parent;
                }
                this.editor.selected = currentObject;
                // Show panel here

                if (this.editor.selected.type == "Scene") {
                    this.editor.selected = intersects[0].object;
                }
                this.editor.activeScene.selected = this.editor.selected;
                this.editor.publishSelect();

                // this.editor.update_properties()
                if (this.editor.selected.userData["locked"] !== true) {
                    this.editor.activeScene.scene.add(this.editor.control);
                    this.editor.control.attach(this.editor.selected);
                }

                this.editor.outlinePass.selectedObjects = [this.editor.selected];
                this.editor.transform_interaction = true;
                // Contact react land
                showObjectPanel();
                this.editor.updateSelectedUI();
            }
        } else {
            this.editor.removeTransformControls();
            hideObjectPanel();
        }
    }
}
