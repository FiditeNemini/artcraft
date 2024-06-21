import * as THREE from "three";
import { IconDefinition, faCamera, faCube, faPerson } from "@fortawesome/pro-solid-svg-icons";
import Scene from "./scene";
import { MouseControls } from "./keybinds_controls";
import { ClipGroup } from "~/enums";

export type SceneObject = {
    id: string;
    icon: IconDefinition;
    name: string;
    type: string;
    visible: boolean;
    locked: boolean;
};

export interface SceneManagerAPI {
    create(media_token: string, name: string, position: THREE.Vector3): void;
    retrieve(object_uuid: string): void;
    delete(object_uuid: string): void;
    update(): void;
    selected(): void;
    render_outliner(timeline_characters: { [key: string]: ClipGroup }): void;
    onMouseMove(event: MouseEvent): void;
    onMouseClick(): void;
    onKeyDown(event: KeyboardEvent): void;
    onMouseDown(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    select_object(id: string): void;
}

export class SceneManager implements SceneManagerAPI {
    scene: Scene;
    mouse_controls: MouseControls;
    version: number;
    selected_objects: THREE.Object3D[] | undefined;

    constructor(version: number, mouse_controls: MouseControls, scene: Scene, devMode: boolean = false) {
        this.mouse_controls = mouse_controls;
        this.scene = scene;
        this.version = version

        if (devMode) {
            window.addEventListener(
                "mousemove",
                this.onMouseMove.bind(this),
                false,
            );
            window.addEventListener(
                "click",
                this.onMouseClick.bind(this),
                false,
            );
            window.addEventListener(
                "keydown",
                this.onKeyDown.bind(this),
                false,
            );
            window.addEventListener(
                "mousedown",
                this.onMouseDown.bind(this),
                false,
            );
            window.addEventListener(
                "mouseup",
                this.onMouseUp.bind(this),
                false,
            );
        }
    }

    public async create(media_token: string, name: string, position: THREE.Vector3) {
        await this.scene.loadObject(media_token, name, true, position, this.version);
    }

    /* NEVER CALL THIS INTERNALLY */
    public render_outliner(timeline_characters: { [key: string]: ClipGroup }) { // needs timeline_characters to render favicons.
        console.log("Render Outliner.")
        // Not permanent just in place until we have multi object select ability.
        let selected_item = this.selected();
        let signal_items: SceneObject[] = [];
        this.scene.scene.children.forEach(child => {
            const converted = this.convert_object(child, timeline_characters)
            if(converted.name !== ""){
                signal_items.push(converted)
            }
        });
        const outlinerState = {
            selectedItem: selected_item,
            items: signal_items
        }
        return outlinerState;
    }

    public async retrieve(object_uuid: string) {
        return this.scene.get_object_by_uuid(object_uuid);
    }

    public async update() {
        // We dont use parents so we will see what this will do.
    }

    public async delete(object_uuid: string) {
        // Deletes an object.
        this.mouse_controls.deleteObject(object_uuid);
    }

    public async double_click(object_uuid: string) {
        this.mouse_controls.focus();
    }

    public async hideObject(object_uuid: string) {
        let object = await this.retrieve(object_uuid);
        if(object?.visible !== undefined){
            object.visible = !object.visible;
            object.userData["visible"] = object.visible;
        }
    }

    public selected() {
        let selected_item = null;
        if(this.selected_objects && this.selected_objects.length > 0){
            selected_item = this.selected_objects[0];
        }
        if(selected_item) {
            return this.convert_object(selected_item, {});
        }
        return null;
    }

    public select_object(id: string) {
        let object = this.scene.get_object_by_uuid(id);
        if(object){
            this.mouse_controls.selected = [object];
            this.mouse_controls.selectObject(object);
        }
    }

    // Converts a 3d object to signal item format.
    private convert_object(object: THREE.Object3D, timeline_characters: { [key: string]: ClipGroup }) {
        let faicon = faCube;
        let name = object.name;
        if (object.name == "::CAM::") {
            faicon = faCamera;
            name = "Camera";
        }
        else if (object.uuid in timeline_characters) {
            faicon = faPerson;
        }
        let locked = object.userData["locked"];
        if(locked == undefined) { locked = false }
        return {
            id: object.uuid,
            icon: faicon,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            type: object.type,
            visible: object.visible,
            locked: object.userData["locked"],
        }
    }

    public onMouseMove(event: MouseEvent) {
        this.mouse_controls.onMouseMove(event);
    }

    public onMouseClick() {
        this.mouse_controls.onMouseClick();
    }

    public onKeyDown(event: KeyboardEvent) {
        this.mouse_controls.onkeydown(event);
    }

    public onMouseDown(event: MouseEvent) {
        this.mouse_controls.onMouseDown(event);
    }

    public onMouseUp(event: MouseEvent) {
        this.mouse_controls.onMouseUp(event);
    }
}
