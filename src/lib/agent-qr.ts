import QRCode from "qrcode";

export async function agentQrDataUrl(link: string): Promise<string> {
  return QRCode.toDataURL(link, {
    width: 280,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0c0a08", light: "#ffffff" },
  });
}

export async function agentQrPoster(link: string, name: string): Promise<string> {
  const qr = await QRCode.toDataURL(link, {
    width: 720,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0c0a08", light: "#ffffff" },
  });
  const width = 840;
  const height = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return qr;
  ctx.fillStyle = "#0c0a08";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#c9a66b";
  ctx.font = "600 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GOLDEN SATYA FAIR", width / 2, 72);
  const img = await loadImage(qr);
  const size = 640;
  const x = (width - size) / 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 16, 110, size + 32, size + 32);
  ctx.drawImage(img, x, 126, size, size);
  ctx.fillStyle = "#c9a66b";
  ctx.font = "700 42px serif";
  ctx.fillText(name, width / 2, 830);
  ctx.fillStyle = "#b8b1a6";
  ctx.font = "500 22px sans-serif";
  ctx.fillText("Scan untuk beli tiket", width / 2, 880);
  ctx.font = "500 18px monospace";
  ctx.fillText(link.replace(/^https?:\/\//, ""), width / 2, 980);
  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal memuat QR"));
    img.src = src;
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    el.remove();
  }
}
