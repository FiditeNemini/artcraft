import { v4 as uuidv4 } from 'uuid';

class MediaUploadManager {
  constructor(sessionToken) {
    this.baseUrl = "https://api.fakeyou.com";
    this.sessionToken = sessionToken;
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
        "accept": "application/json",
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
