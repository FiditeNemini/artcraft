export async function loadImage(img: HTMLImageElement) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export async function loadImageFromUrl(url: string) {
  const img = new Image();
  img.src = url;
  return loadImage(img);
}
