import AppBar from "@/components/layout/app-bar";
import { LogsDisplay } from "@/components/logs/logs-display";
import { LiasonsTable } from "@/components/studio/liaisons-table";
import { SidebarNav } from "@/components/studio/sidebar-nav";

export default function Home() {
  return (
    <div>
      <AppBar />
      <div className="flex mt-12 overflow-hidden">
        <SidebarNav />

        <div className="flex flex-col m-4 w-full">
          <LiasonsTable />
          <LogsDisplay />
        </div>
      </div>
    </div>
  );
}
