import * as THREE from "three";

export class EmotionClip  {
  version: number;
  media_id: string;
  type: "emotion" = "emotion";
  emotion_json: any;
  faces: THREE.Mesh[];

  constructor(version: number, media_id: string) {
    this.version = version;
    this.media_id = media_id;
    this.type = "emotion";
    this.faces = [];
    this.download_json().then(data => {
      this.emotion_json = data;
    });
  }

  async get_media_url() {
    //This is for prod when we have the proper info on the url.
    let api_base_url = "https://api.fakeyou.com";
    let url = `${api_base_url}/v1/media_files/file/${this.media_id}`
    let responce = await fetch(url);
    let json = await JSON.parse(await responce.text());
    let bucketPath = json["media_file"]["public_bucket_path"];
    let media_base_url = "https://storage.googleapis.com/vocodes-public"
    let media_url = `${media_base_url}${bucketPath}`
    return media_url;
  }

  async download_json() {
    let url = await this.get_media_url();
    const response = await fetch(url);
    return await response.json();
  }

  async _detect_face(object: THREE.Object3D): Promise<THREE.Mesh> {
    this.faces = [];
    return new Promise((resolve) => {
      object.traverse((c: THREE.Object3D) => {
        if (c instanceof THREE.Mesh) {
          if (c.morphTargetInfluences && c.morphTargetDictionary) {
            const blendShapeIndexE = c.morphTargetDictionary["E"];
            if (blendShapeIndexE != null) {
              this.faces.push(c);
              resolve(c);
            }
          }
        }
      });
    });
  }

  setBlends(shapes: { [key: string]: number }) {
    this.faces.forEach((element: THREE.Mesh) => {
      if (element.morphTargetInfluences && shapes) {
        Object.keys(shapes).forEach(key => {
          const index = element.morphTargetDictionary?.[key];
          if (typeof index === 'number' && element.morphTargetInfluences !== undefined) {
            element.morphTargetInfluences[index] = shapes[key];
          }
        });
      }
    });
  }
  

  async step(frame: number, object: THREE.Object3D) {
    await this._detect_face(object);
    // setBlends()
  }

  toJSON(): any {
    return {
      version: this.version,
      media_id: this.media_id,
      type: this.type,
    };
  }
}
