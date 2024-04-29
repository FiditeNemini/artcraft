import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/addons/loaders/GLTFLoader.js";
import {
  StoryTellerProxy3DObject,
  ObjectJSON,
} from "./storyteller_proxy_3d_object";
import Scene from "../js/scene";

interface LookUpDictionary {
  [key: string]: StoryTellerProxy3DObject;
}

export class StoryTellerProxyScene {
  sceneItemProxy: StoryTellerProxy3DObject[];
  scene: Scene;
  glbLoader: GLTFLoader;

  lookUpDictionary: LookUpDictionary;
  version: number;

  constructor(version: number, scene: Scene) {
    this.version = version;
    this.scene = scene;
    this.glbLoader = new GLTFLoader();
    this.lookUpDictionary = {};
    this.sceneItemProxy = [];
  }

  public async saveToScene(): Promise<any> {
    const results: ObjectJSON[] = [];
    if (this.scene.scene != null) {
      for (const child of this.scene.scene.children) {
        if (child.userData["media_id"] != undefined) {
          if (this.lookUpDictionary[child.uuid] == null) {
            this.lookUpDictionary[child.uuid] = new StoryTellerProxy3DObject(
              this.version,
              child.userData["media_id"],
            );
          }
          const proxyObject3D: StoryTellerProxy3DObject =
            this.lookUpDictionary[child.uuid];
          proxyObject3D.position.copy(child.position);
          proxyObject3D.rotation.copy(child.rotation);
          proxyObject3D.scale.copy(child.scale);
          proxyObject3D.object_user_data_name = child.userData.name;
          proxyObject3D.object_name = child.name;
          proxyObject3D.object_uuid = child.uuid;
          proxyObject3D.color = child.userData["color"];
          proxyObject3D.metalness = child.userData["metalness"];
          proxyObject3D.shininess = child.userData["shininess"];
          proxyObject3D.specular = child.userData["specular"];
          const json_data = await proxyObject3D.toJSON();
          results.push(json_data);
        }
      }
    } else {
      console.log("Scene doesn't exist needs to be assigned");
    }
    return results;
  }

  public async loadFromSceneJson(scene_json: ObjectJSON[]) {
    if (scene_json != null && this.scene != null) {
      while (this.scene.scene.children.length > 0) {
        this.scene.scene.remove(this.scene.scene.children[0]);
      }
      for (const json_object of scene_json) {
        const token: string = json_object.media_file_token;
        let obj;
        switch (token) {
          case "Parim":
            let prim_uuid = this.scene.instantiate(json_object.object_name).uuid;
            obj = this.scene.get_object_by_uuid(prim_uuid);
            break;
          case "DirectionalLight":
            obj = this.scene._create_base_lighting();
            break;
          default:
            if (token.includes("m_")) {
              obj = await this.scene.loadGlbWithPlaceholder(token, json_object.object_name);
            } else if (token.includes("Point::")) {
              let keyframe_uuid = token.replace("Point::", "");
              obj = this.scene.createPoint(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 0),
                keyframe_uuid,
              );
            }
            break;
        }
        if (obj) {
          obj.position.copy(json_object.position);
          obj.rotation.copy(
            new THREE.Euler(
              json_object.rotation.x,
              json_object.rotation.y,
              json_object.rotation.z,
            ),
          );
          obj.scale.copy(json_object.scale);
          obj.name = json_object.object_name;
          obj.userData.name = json_object.object_user_data_name;
          obj.uuid = json_object.object_uuid;
          obj.userData["media_id"] = json_object.media_file_token;
        }
      }
      this.scene._createGrid();
    }
  }
}
