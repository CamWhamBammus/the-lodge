import { listApps } from "@/lib/apps";
import { getStatus, appUrl } from "@/lib/launcher";
import { AppGrid } from "@/components/AppGrid";
import { WatchtowerPanel } from "@/components/watchtower/WatchtowerPanel";
import { TreeLine } from "@/components/TreeLine";
import type { AppWithStatus } from "@/types";

export default async function HomePage() {
  const apps = listApps();
  const withStatus: AppWithStatus[] = await Promise.all(
    apps.map(async (app) => ({
      ...app,
      status: await getStatus(app),
      url: appUrl(app),
    }))
  );

  return (
    <main className="paper-grain mx-auto min-h-screen max-w-5xl px-6 py-12">
      <TreeLine />
      <WatchtowerPanel />
      <AppGrid initialApps={withStatus} />
      <p className="mt-16 text-center text-xs text-charcoal-600/40 italic">
        Every app comes home to the lodge.
      </p>
    </main>
  );
}
