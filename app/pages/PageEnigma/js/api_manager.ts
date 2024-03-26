import { v4 as uuidv4 } from 'uuid'
import { Scene } from '../datastructures/scene/scene_object'
import * as THREE from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { TimelineCurrentReactState } from './timeline'

// Basically the data will exist on the database 
class APIManager {
  baseUrl:String

  constructor() {
    this.baseUrl = "https://api.fakeyou.com"
    //this.baseUrl = "http://localhost:12345"
  }
  

  // Function to save or update the scene
  async saveSceneState(scene:THREE.Scene,
                      timeLine:TimelineCurrentReactState,
                      scene_id:string | null =null):Promise<string> { 
    if (scene_id == null) {
      // create new scene.
      let file = await this.gltfExport(scene)
      let response = await this.uploadGLB(file)
      console.log(response)
    } else {
      // update scene or overwrite glb scene.
    }
    return ""
  }

  async _saveSceneAndTimelineToJSONSpec() {
    
  }

  async loadScene(scene_token:[]):Promise<string> {
    
    return ""
  }

  async batchMedia(media_tokens:[]):Promise<string> {

    return ""
  }

  async gltfExport(scene:THREE.Scene) {
      let gltfExporter = new GLTFExporter()    
      let uuid = uuidv4()  
      // save the scene to keep ids positions etc
      let result = await gltfExporter.parseAsync(scene)
      const file = new File([JSON.stringify(result)], `${uuid}.glb`, {type: 'application/json'})
      return file
  }
  // two core functions to upload things to the server and get id's
  async uploadMedia(blob:any, fileName:string):Promise<string> {
    const url = `${this.baseUrl}/v1/media_uploads/upload`
    let uuid = uuidv4()
    const formData = new FormData()
    formData.append('uuid_idempotency_token', uuid)
    formData.append('file', blob, fileName)
    formData.append('source', 'file')
    formData.append('type', 'video')
    formData.append('source', 'file')
    const response = await fetch(url, {
      method: 'POST',
      credentials: "include",
      headers: {
        "Accept": "application/json",
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to Send Data')
    }

    return response.json() // or handle the response as appropriate
  }

  // to save to a file then upload the scene.
  async uploadGLB(file:File):Promise<string> {
    const url = `${this.baseUrl}/v1/media_files/upload/engine_asset`
    let uuid = uuidv4()
    const formData = new FormData()
    formData.append('uuid_idempotency_token', uuid)
    formData.append('file', file)
    formData.append('source','file')
    formData.append('media_file_subtype', 'scene_import')
    formData.append('media_file_class', 'scene')
    const response = await fetch(url, {
      method: 'POST',
      credentials: "include",
      headers: {
        "Accept": "application/json",
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to Send Data')
    }
    return response.json() // or handle the response as appropriate
  }
}

export default APIManager
