"use client";

import { useEffect, useState } from "react";

export function AISummary({ projectId }: { projectId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [risk, setRisk] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${projectId}/summarize`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
        } else {
          setSummary(data.summary);
          setRisk(data.risk);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return <p className="ai-summary ai-summary-loading">Generating AI summary...</p>;
  }

  if (error) {
    return null;
  }

  const showRisk = risk && risk.toLowerCase().indexOf("no significant risks") === -1;

  return (
    <div className="ai-summary">
      <p className="ai-summary-label">AI summary</p>
      <p>{summary}</p>
      {showRisk && <p className="ai-summary-risk">Watch out: {risk}</p>}
    </div>
  );
}
