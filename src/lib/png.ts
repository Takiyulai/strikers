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

/**
 * Ouvre le PNG dans un nouvel onglet : l'image s'affiche immédiatement en
 * plein écran, prête à être partagée (appui long → WhatsApp sur mobile).
 */
export async function openNodePngInNewTab(
  node: HTMLElement,
): Promise<void> {
  const blob = await nodeToPngBlob(node);
  const url = URL.createObjectURL(blob);

  window.open(url, "_blank", "noopener");

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
