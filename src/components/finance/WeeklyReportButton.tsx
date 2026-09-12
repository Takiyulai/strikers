"use client";

import { useRef, useState } from "react";
import { Download, Eye } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { WeeklyReportCard } from "@/components/finance/WeeklyReportCard";
import { downloadNodeAsPng, openNodePngInNewTab } from "@/lib/png";

import type { WeeklyRosterRow } from "@/types";

export function WeeklyReportButton({
  weekLabel,
  rows,
  paidCount,
  unpaidCount,
}: {
  weekLabel: string;
  rows: WeeklyRosterRow[];
  paidCount: number;
  unpaidCount: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const collected = paidCount * 100;

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await downloadNodeAsPng(
        cardRef.current,
        `striker-fc-cotisations-${weekLabel}`,
      );
    } finally {
      setDownloading(false);
    }
  }

  async function handlePreview() {
    if (!cardRef.current) return;
    setPreviewing(true);
    try {
      await openNodePngInNewTab(cardRef.current);
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          loading={downloading}
        >
          <Download className="h-4 w-4" />
          Rapport PNG
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePreview}
          loading={previewing}
        >
          <Eye className="h-4 w-4" />
          Aperçu
        </Button>
      </div>

      <div className="pointer-events-none fixed -left-[9999px] top-0">
        <WeeklyReportCard
          ref={cardRef}
          weekLabel={weekLabel}
          paidCount={paidCount}
          unpaidCount={unpaidCount}
          collected={collected}
          rows={rows}
        />
      </div>
    </>
  );
}