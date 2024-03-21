class MediaUploadManager {
  constructor(baseUrl, sessionToken) {
    const baseUrl = "https://api.fakeyou.com"
    this.baseUrl = baseUrl;
    const sessionToken = null;//
    this.sessionToken = sessionToken;
  }

  async uploadMedia(blob, fileName) {
    const url = `${this.baseUrl}/v1/media_uploads/upload`;

    const formData = new FormData();
    formData.append('file', blob, fileName);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`, // Assuming the session token is a Bearer token
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to Send Data');
    }

    return response.json(); // or handle the response as appropriate
  }
}

const manager = MediaUploadManager();
await uploadMedia("haha","FileName!!!")




