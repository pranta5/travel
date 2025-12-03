"use client";
import React, { useMemo, useState } from "react";

export type OverviewEntry = { view?: string } | { highlighted?: string[] };

export type OverviewProp =
  | string
  | { view?: string; highlighted?: string[] }
  | OverviewEntry[];

type Props = {
  overview?: OverviewProp;
  compact?: boolean; // optional smaller spacing
};

const HighlightIcon = () => (
  <svg
    className="w-5 h-5 text-cyan-600 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <path
      d="M12 2l3 6 6 .5-4.5 4 1 6L12 16l-5.5 3.5 1-6L3 8.5 9 8 12 2z"
      stroke="currentColor"
      strokeWidth="0.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function normalizeOverview(overview?: OverviewProp) {
  let viewText = "";
  const highlights: string[] = [];

  if (!overview) return { viewText, highlights };

  // string case
  if (typeof overview === "string") {
    viewText = overview;
    return { viewText, highlights };
  }

  // object with view/highlighted
  if (!Array.isArray(overview) && typeof overview === "object") {
    viewText = overview.view ?? "";
    if (Array.isArray(overview.highlighted))
      highlights.push(...overview.highlighted);
    return { viewText, highlights };
  }

  // array of entries [{ view }, { highlighted: [...] }]
  if (Array.isArray(overview)) {
    overview.forEach((entry) => {
      if (!entry) return;
      if ("view" in entry && typeof entry.view === "string") {
        // concatenate multiple view entries with double newline
        viewText = viewText ? viewText + "\n\n" + entry.view : entry.view;
      }
      if ("highlighted" in entry && Array.isArray(entry.highlighted)) {
        highlights.push(...entry.highlighted);
      }
    });
  }

  return { viewText, highlights };
}

/** Auto-capitalize small labels for nicer display */
function prettyLabel(s?: string) {
  if (!s) return "";
  return s
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export default function OverviewSection({ overview, compact = false }: Props) {
  const { viewText, highlights } = useMemo(
    () => normalizeOverview(overview),
    [overview]
  );
  const [expanded, setExpanded] = useState(false);

  const previewLimit = 320;
  const needsTruncate = viewText && viewText.length > previewLimit;
  const previewText =
    needsTruncate && !expanded
      ? viewText.slice(0, previewLimit).trim() + "..."
      : viewText;

  return (
    <div>
      <div
        className={`bg-white p-6 rounded-lg shadow-sm ${compact ? "p-4" : ""}`}
      >
        {/* Overview paragraph */}
        <div className="space-y-4">
          <div>
            {viewText ? (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {previewText}
                {needsTruncate && (
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="ml-1 text-cyan-600 font-medium hover:underline"
                    aria-expanded={expanded}
                  >
                    {expanded ? " Read less" : " Read more"}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Overview isn't provided yet.
              </p>
            )}
          </div>

          {/* Trip highlights */}
          {highlights && highlights.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Trip Highlights
              </h3>
              <ul className="space-y-3">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className="w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center">
                        <HighlightIcon />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-800 font-medium">
                        {prettyLabel(h)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
