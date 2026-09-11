"use client";

import { toPng } from "html-to-image";

/**
 * Capture un nœud DOM et déclenche le téléchargement du PNG.
 * Utilisé pour les rapports financiers et les convocations.
 */
export async function downloadNodeAsPng(
  node: HTMLElement,
  fileName: string,
): Promise<void> {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const link = document.createElement("a");
  link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}