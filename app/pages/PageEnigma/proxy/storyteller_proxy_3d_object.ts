import * as THREE from "three";

export class StoryTellerProxy3DObject {
  version: number;

  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;

  object_uuid: string;
  object_name: string;
  object_user_data_name: string; // changable name
  media_file_token: string;

  constructor(
    version: number,
    media_file_token: string,
  ) {
    this.version = version;
    this.media_file_token = media_file_token;

    this.position = new THREE.Vector3(0.0, 0.0, 0.0);
    this.rotation = new THREE.Euler(0.0, 0.0, 0.0);
    this.scale = new THREE.Vector3(1.0, 1.0, 1.0); 

    this.object_name = "";
    this.object_user_data_name = "";
    this.object_uuid = "";
  }

  public async initialize(object: THREE.Object3D) {
    this.position = object.position;
    this.rotation = object.rotation;
    this.scale = object.scale;

    this.object_name = object.name;
    this.object_user_data_name = object.userData.name;
    this.object_uuid = object.uuid;
  }

  public async toJSON(): Promise<string> {
    const json = {
      version: this.version,
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z,
      },
      rotation: {
        x: this.rotation.x,
        y: this.rotation.y,
        z: this.rotation.z,
      },
      scale: {
        x: this.scale.x,
        y: this.scale.y,
        z: this.scale.z,
      },
      object_name: this.object_name,
      object_uuid: this.object_uuid,
      object_user_data_name: this.object_user_data_name,
      media_file_token: this.media_file_token,
    };
    const json_string = JSON.stringify(json);
    return json_string;
  }
}