"use client";

import { toPng } from "html-to-image";

/**
 * Nom de fichier sûr pour tous les appareils : sans accents ni caractères
 * spéciaux (le « · » de « Semaine 38 · 2026 » empêche certains téléphones
 * de reconnaître le fichier comme une image).
 */
export function sanitizeFileName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function nodeToPngBlob(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  // Un Blob est plus fiable qu'une data URL volumineuse, que certains
  // navigateurs tronquent — d'où des fichiers illisibles après téléchargement.
  const response = await fetch(dataUrl);
  return response.blob();
}

/** Télécharge le nœud en PNG avec un nom de fichier propre. */
export async function downloadNodeAsPng(
  node: HTMLElement,
  fileName: string,
): Promise<void> {
  const blob = await nodeToPngBlob(node);
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFileName(fileName)}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Lecture de l'image impossible."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Ouvre le PNG dans un nouvel onglet, dans une page responsive : l'image
 * s'adapte à la largeur de l'écran et reste partageable d'un appui long.
 */
export async function openNodePngInNewTab(
  node: HTMLElement,
): Promise<void> {
  const blob = await nodeToPngBlob(node);
  const dataUrl = await blobToDataUrl(blob);

  const html = [
    "<!doctype html>",
    '<html lang="fr"><head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>Striker FC — Visuel</title>",
    "<style>",
    "body{margin:0;background:#0f1a2e;display:flex;justify-content:center;padding:12px;box-sizing:border-box;min-height:100vh}",
    "img{max-width:100%;height:auto;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.4)}",
    "</style></head>",
    '<body><img src="' + dataUrl + '" alt="Visuel Striker FC"></body></html>',
  ].join("");

  const htmlBlob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(htmlBlob);

  window.open(url, "_blank", "noopener");

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
