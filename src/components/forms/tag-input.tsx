"use client";

import { KeyboardEvent, useState } from "react";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  label: string;
  placeholder?: string;
  values: string[];
  onChange: (next: string[]) => void;
};

export function TagInput({ label, placeholder, values, onChange }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(value: string) {
    const clean = value.trim();
    if (!clean || values.includes(clean)) return;
    onChange([...values, clean]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    }
  }

  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">{label}</span>
      <Input
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => addTag(draft)}
        onKeyDown={handleKeyDown}
      />
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((tag) => (
            <button
              key={tag}
              type="button"
              className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--accent-strong)]"
              onClick={() => onChange(values.filter((value) => value !== tag))}
              title="点击移除"
            >
              {tag} ×
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}
