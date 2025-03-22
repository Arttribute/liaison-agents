import AppBar from "@/components/layout/app-bar";
import { LiasonsTable } from "@/components/studio/liaisons-table";

export default function Home() {
  return (
    <div>
      <AppBar />
      <div className="mt-12">
        <div className="m-4">
          <LiasonsTable />
        </div>
      </div>
    </div>
  );
}
