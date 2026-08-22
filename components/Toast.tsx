"use client";

import { useEffect } from "react";

export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0f3d2e",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        fontSize: "0.9rem",
        fontWeight: 600,
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
}
