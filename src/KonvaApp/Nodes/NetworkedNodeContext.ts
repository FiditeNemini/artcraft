// This class takes a url and then loads it async not blocking
// This also handles the UI

export class NetworkedNodeContext {
  constructor() {}

  async startLoading(): Promise<void> {}
  async endLoading(): Promise<void> {}
  async progressiveLoading(currentAmount: number): Promise<void> {}
  async updateCanvasElement() {}

  // Debug outputs
  async blobToFile(blob: Blob) {
    try {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "canvas-output.jpg";
      // Trigger the download
      link.click();
      // Clean up the URL object
      URL.revokeObjectURL(link.href);
      console.log("Downloaded Sample");
    } catch (error) {
      console.log(error);
    }
  }
}
