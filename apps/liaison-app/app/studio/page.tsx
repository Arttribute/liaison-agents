"use client";
import AppBar from "@/components/layout/app-bar";
import { LiasonsTable } from "@/components/studio/liaisons-table";
import { SidebarNav } from "@/components/studio/sidebar-nav";
import { useAuth } from "@/context/auth-context";

export default function Studio() {
  const { authState } = useAuth();
  const { walletAddress } = authState;
  const userAddress = walletAddress?.toLowerCase();
  return (
    <div>
      <AppBar />
      <div className="flex mt-12 overflow-hidden">
        <SidebarNav />

        <div className="flex flex-col m-4 w-full">
          <LiasonsTable userAddress={userAddress} />
        </div>
      </div>
    </div>
  );
}
