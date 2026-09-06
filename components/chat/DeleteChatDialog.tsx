"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";

interface DeleteChatDialogProps {
  open: boolean;
  chatTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}

export function DeleteChatDialog({
  open,
  chatTitle,
  onCancel,
  onConfirm,
  busy = false,
}: DeleteChatDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-chat-title"
        aria-describedby="delete-chat-desc"
        className={cn(
          "relative w-full max-w-[400px] rounded-2xl border border-border/70",
          "bg-surface-elevated shadow-2xl p-5",
        )}
      >
        <h2
          id="delete-chat-title"
          className="text-[17px] font-semibold text-foreground"
        >
          Delete chat?
        </h2>
        <p id="delete-chat-desc" className="mt-2 text-sm text-muted leading-relaxed">
          This will delete{" "}
          <span className="font-medium text-foreground">
            {chatTitle || "Untitled"}
          </span>
          .
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full h-9 px-4"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="rounded-full h-9 px-4 bg-red-600 text-white border-red-600 hover:bg-red-500"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
