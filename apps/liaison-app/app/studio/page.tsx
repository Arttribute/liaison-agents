import AppBar from "@/components/layout/app-bar";
import { LiasonsTable } from "@/components/studio/liaisons-table";
import { SidebarNav } from "@/components/studio/sidebar-nav";

export default function Home() {
  return (
    <div>
      <AppBar />
      <div className="flex mt-12 overflow-hidden">
        <SidebarNav />

        <div className="m-4 w-full">
          <LiasonsTable />
        </div>
      </div>
    </div>
  );
}
