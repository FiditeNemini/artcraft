import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/addons/loaders/GLTFLoader.js";
import { StoryTellerProxy3DObject } from "./storyteller_proxy_3d_object"

interface LookUpDictionary {
    [key: string]: StoryTellerProxy3DObject;
}
  
export class StoryTellerProxyScene {
    sceneItemProxy: StoryTellerProxy3DObject[];
    scene: THREE.Scene;
    glbLoader: GLTFLoader;
    
    lookUpDictionary: LookUpDictionary;
    version: number;

    constructor(version:number,scene: THREE.Scene) {
      this.version = version
      this.scene = scene;
      this.glbLoader = new GLTFLoader();
      this.lookUpDictionary = {}
      this.sceneItemProxy = []
    }
    
    // TODO: refactor this and dependency inject api manager.
    private async get_media_url(media_file_token: string): Promise<string> {
      //This is for prod when we have the proper info on the url.
      let api_base_url = "https://api.fakeyou.com";
      let url = `${api_base_url}/v1/media_files/file/${media_file_token}`;
      let responce = await fetch(url);
      let json = await JSON.parse(await responce.text());
      let bucketPath = json["media_file"]["public_bucket_path"];
      let media_base_url = "https://storage.googleapis.com/vocodes-public";
      let media_url = `${media_base_url}${bucketPath}`;
      return media_url;
    }
  
    // TODO can you throw custom error from here?
    private async loadGLB(bucket_path: string): Promise<GLTF> {
      return new Promise((resolve, reject) => {
        this.glbLoader.load(bucket_path, (glb) => {
          if (glb != null) {
            resolve(glb);
          } else {
            reject(new Error("No GLB Data was Loaded."));
          }
        });
      });
    }
    
    /**
     * This is to load a scene from the json format from the server
     * @param proxyObjects3D 
     */
    public async load(proxyObjects3D: StoryTellerProxy3DObject[]) {
      // So first scene loading from scratch and everytime | create empty 3js scene
      proxyObjects3D.forEach(async (element) => {
        // construct the bucket path media_file_token
        try {
          const bucket_path = await this.get_media_url(element.media_file_token);
          const glb = await this.loadGLB(bucket_path);
          // extract children from scene any save glb and add it into the scene.
          glb.scene.children.forEach((child) => {
          // needs to be modified before adding to the scene.
            child.traverse((c: THREE.Object3D) => {
              if (c instanceof THREE.Mesh) {
                c.material.metalness = 0.0;
                c.material.specular = 0.5;
                c.castShadow = true;
                c.receiveShadow = true;
                c.material.transparent = false;
              }
            });
            child.parent = this.scene;
            this.scene.add(child);
            this.sceneItemProxy.push(element)
             // for easy lookup later
            this.lookUpDictionary[element.object_uuid] = element
          });
        } catch (error) {
          console.log(error)
          throw error
        }
      });
    }
  
    public async saveToScene():Promise<string> {
      // retrieve all elements in 3js scene update the proxy objects 3D and turn into json.
      let result:string[] = []
      if (this.scene != null) {
        this.scene.children.forEach(async (child) => {
  
          const proxyObject3D:StoryTellerProxy3DObject = this.lookUpDictionary[child.uuid]
          proxyObject3D.position = child.position
          proxyObject3D.rotation = child.rotation
          proxyObject3D.scale = child.scale
          proxyObject3D.object_user_data_name = child.userData.name;
          proxyObject3D.object_name = child.name
          proxyObject3D.object_uuid = child.uuid
  
          const json_data = await proxyObject3D.toJSON()
          
          result.push(json_data)
        });
      } else {
        console.log("Scene doesn't exist needs to be assigned")
      }
      const json_string = JSON.stringify(result)
      return json_string
    }
  
    /**
     * This will add to and load into scene StoryTellerProxy3DObject
     * @param media_file_token 
     */
    public async loadFromMediaFileToken(media_file_token: string) {
      // load it from the db
      // Everything you load is a scene | objects are a scene as well.
      try {
          const bucket_path = await this.get_media_url(media_file_token);
          const glb = await this.loadGLB(bucket_path);
          // extract children from scene any save glb and add it into the scene.
          glb.scene.children.forEach((child) => {
            // needs to be modified before adding to the scene.
            child.traverse((c: THREE.Object3D) => {
              if (c instanceof THREE.Mesh) {
                c.material.metalness = 0.0;
                c.material.specular = 0.5;
                c.castShadow = true;
                c.receiveShadow = true;
                c.material.transparent = false;
              }
            });
  
            child.parent = this.scene;
            if (this.scene != null) {
              this.scene.add(child);
              // now add the record
              const result = new StoryTellerProxy3DObject(this.version,media_file_token)
              result.initialize(child)
              this.sceneItemProxy.push(result)
              this.lookUpDictionary[child.uuid] = result
            } else {
              console.log("Scene doesn't exist needs to be assigned")
            }
          });
        } catch (error) {
          console.log(error)
        }
    }

    public async deleteWithUUID(uuid:String) {
        if (this.scene != null) {
          const object = this.scene.getObjectByProperty('uuid', uuid);
          if (object) {
            this.scene.remove(object);
            // Remove from sceneItemProxy and lookUpDictionary
            const index = this.sceneItemProxy.findIndex(item => uuid === uuid);
            if (index !== -1) {
              this.sceneItemProxy.splice(index, 1);
            }
            delete this.lookUpDictionary[uuid];
          } else {
            console.log(`Object with UUID ${uuid} not found in the scene`);
          }
        } else {
          console.log("Scene doesn't exist needs to be assigned");
        }
      }
  };
  