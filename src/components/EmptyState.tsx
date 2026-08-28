import { House, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 rounded-lg border border-dashed border-walnut-500/25 py-16 text-center">
      <House size={28} className="text-sage-400" strokeWidth={1.5} />
      <p className="font-serif text-lg text-canopy-900">No apps yet</p>
      <p className="max-w-xs text-sm text-charcoal-600">
        Add an app&rsquo;s project path, start command, and port — The Lodge will launch it on demand.
      </p>
      <Button onClick={onAdd} className="mt-2">
        <Plus size={16} />
        Add app
      </Button>
    </div>
  );
}
