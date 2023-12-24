class BucketConfig {
  isLocalDev: boolean;

  constructor() {
    this.isLocalDev =
      document.location.host.includes("localhost") ||
      document.location.host.includes("jungle.horse") ||
      document.location.host.startsWith("dev.");
  }

  // TODO: Prevent callers with undefined/null paths
  getGcsUrl(bucketRelativePath: string | undefined | null): string {
    let bucket = this.getBucket();
    let path = bucketRelativePath;
    if (path !== undefined && path !== null && !path.startsWith("/")) {
      path = "/" + path;
    }
    return `https://storage.googleapis.com/${bucket}${path}`;
  }

  private getBucket(): string {
    return this.isLocalDev ? "dev-vocodes-public" : "vocodes-public";
  }

  getCdnUrl(
    bucketRelativePath: string,
    width?: number,
    height?: number
  ): string {
    const basePath = this.isLocalDev
      ? "https://dev-cdn.fakeyou.com"
      : "https://cdn.fakeyou.com";
    let path = bucketRelativePath.startsWith("/")
      ? bucketRelativePath
      : "/" + bucketRelativePath;
    let resizeParams = "";
    if (width || height) {
      resizeParams = "cdn-cgi/image/";
      if (width) {
        resizeParams += `width=${width},`;
      }
      if (height) {
        resizeParams += `height=${height},`;
      }
      resizeParams = resizeParams.slice(0, -1);
    }
    if (resizeParams) {
      return `${basePath}/${resizeParams}${path}`;
    } else {
      return `${basePath}${path}`;
    }
  }
}

export { BucketConfig };
