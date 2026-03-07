declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: "jpeg" | "png" | "webp";
      quality?: number;
    };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
    pagebreak?: {
      mode?: Array<"css" | "legacy" | "avoid-all">;
    };
  }

  interface Html2PdfInstance {
    set: (options: Html2PdfOptions) => Html2PdfInstance;
    from: (source: HTMLElement | string) => Html2PdfInstance;
    save: () => Promise<void>;
  }

  export default function html2pdf(): Html2PdfInstance;
}
