"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function AddAppModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [path, setPath] = useState("");
  const [command, setCommand] = useState("npm run dev");
  const [port, setPort] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setName("");
    setTagline("");
    setPath("");
    setCommand("npm run dev");
    setPort("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tagline, path, command, port: Number(port) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not add app");
      }
      reset();
      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add app");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add an app"
      width="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Name" required>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Reading Cabin"
            required
          />
        </Field>
        <Field label="Tagline" hint="Shown under the name on its card.">
          <TextInput
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A quiet place to work through your textbooks."
          />
        </Field>
        <Field label="Project path" required hint="Absolute path to the app's directory.">
          <TextInput
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/Users/you/Code/TypeScript/reading-cabin"
            required
          />
        </Field>
        <Field
          label="Start command"
          required
          hint="Runs inside the project path. $PORT is set to the port below."
        >
          <TextInput
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="npm run dev"
            required
          />
        </Field>
        <Field label="Port" required>
          <TextInput
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="3000"
            required
          />
        </Field>

        {error && <p className="text-sm text-clay-500">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Adding…" : "Add app"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
