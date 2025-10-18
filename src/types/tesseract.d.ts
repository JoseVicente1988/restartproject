// src/types/tesseract.d.ts
declare module "tesseract.js" {
  // Tipado mínimo para lo que usamos
  export function recognize(
    image: string | Blob | ArrayBufferView,
    lang?: string,
    options?: Record<string, any>
  ): Promise<{
    data: {
      text: string;
      confidence?: number;
    };
  }>;
}
