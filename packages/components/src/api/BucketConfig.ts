
class BucketConfig {
  
  isLocalDev: boolean;

  constructor() {
    if (document.location.host.includes("localhost") ||
        document.location.host.includes("jungle.horse")) {
      this.isLocalDev = true;
    } else {
      this.isLocalDev = false;
    }
    // TODO TEMP
    //this.isLocalDev = false;
  }

  // TODO: Prevent callers with undefined/null paths
  getGcsUrl(bucketRelativePath: string | undefined | null) : string {
    let bucket = this.getBucket();
    let path = bucketRelativePath;
    if (path !== undefined && path !== null && !path.startsWith('/')) {
      path = '/' + path;
    }
    return `https://storage.googleapis.com/${bucket}${path}`; 
  }

  private getBucket() : string {
    return this.isLocalDev? 'dev-vocodes-public' : 'vocodes-public';
  }
}

export { BucketConfig }
