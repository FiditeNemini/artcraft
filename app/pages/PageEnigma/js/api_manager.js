class MediaUploadManager {
  constructor(sessionToken) {
    this.baseUrl = "https://api.fakeyou.com";
    this.sessionToken = sessionToken;
  }

  async uploadMedia(blob, fileName) {
    const url = `${this.baseUrl}/v1/media_uploads/upload`;

    let uuid = crypto.randomUUID();

    const formData = new FormData();
    formData.append('uuid_idempotency_token', uuid);
    formData.append('file', blob, fileName);
    formData.append('source', 'file');
    const response = await fetch(url, {
      method: 'POST',
      mode: "cors",
      credentials: "include",
      headers: {
        "accept": "application/json",
        "content-type": "multipart/form-data"
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
