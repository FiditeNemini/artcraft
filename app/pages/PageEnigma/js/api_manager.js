import { v4 as uuidv4 } from 'uuid';

class MediaUploadManager {
  constructor() {
    //this.baseUrl = "https://api.fakeyou.com";
    this.baseUrl = "http://localhost:12345"
  }

  async uploadMedia(blob, fileName) {
    const url = `${this.baseUrl}/v1/media_uploads/upload`;

    let uuid = uuidv4();

    const formData = new FormData();
    formData.append('uuid_idempotency_token', uuid);
    formData.append('file', blob, fileName);
    formData.append('source', 'file');
    formData.append('type', 'video');
    formData.append('source', 'file');
    const response = await fetch(url, {
      method: 'POST',
      credentials: "include",
      headers: {
        "Accept": "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to Send Data');
    }

    return response.json(); // or handle the response as appropriate
  }

  async uploadGLB(blob) {
    const url = `${this.baseUrl}/v1/media_files/upload/engine_asset`;

    let uuid = uuidv4();

    const formData = new FormData();
    formData.append('uuid_idempotency_token', uuid);
    formData.append('file', blob);
    formData.append('source','file');
    formData.append('media_file_subtype', 'scene_import');
    formData.append('media_file_class', 'scene');
    const response = await fetch(url, {
      method: 'POST',
      credentials: "include",
      headers: {
        "Accept": "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to Send Data');
    }

    return response.json(); // or handle the response as appropriate
  }
}

export default MediaUploadManager;
