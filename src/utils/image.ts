import Compressor from 'compressorjs';

export async function compressImage(file: File, quality = 0.7, maxWidth = 2560, maxHeight = 2560): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  return new Promise((resolve, reject) => {
     
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight,
      convertSize: 500 * 1024, // convert to jpeg if larger than 500KB
      success(result) {
        const compressed = new File([result as BlobPart], file.name, { type: (result as File).type || file.type, lastModified: Date.now() });
        resolve(compressed);
      },
      error(err) {
        resolve(file);
      },
    });
  });
}

export async function generateImageThumbnail(file: File, maxSize = 320): Promise<string | undefined> {
  if (!file.type.startsWith('image/')) return undefined;
  const imgDataUrl = await blobToDataURL(file);
  const img = await loadImage(imgDataUrl);
  const { width, height } = constrain(img.width, img.height, maxSize);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.7);
}

function constrain(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = Math.min(max / w, max / h);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function blobToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}


