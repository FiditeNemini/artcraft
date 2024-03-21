class MediaUploadManager {
  constructor(sessionToken) {
    this.baseUrl = "https://api.fakeyou.com";
    this.sessionToken = sessionToken;
  }

  async uploadMedia(blob, fileName) {
    const url = `${this.baseUrl}/v1/media_uploads/upload`;

    const formData = new FormData();
    formData.append('file', blob, fileName);
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`, // Assuming the session token is a Bearer token
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': true
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
