"use client";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
//import { Sparkles } from "lucide-react";
import AccountMenu from "@/components/account/account-menu";
import Link from "next/link";
import Image from "next/image";

export default function AppBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 p-1.5   bg-white border-b border-gray-400">
      <Menubar className="rounded-none border-none px-2 lg:px-4">
        <MenubarMenu>
          <div className=" lg:hidden"></div>
          <MenubarTrigger>
            <Link href="/">Liaison Agents</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <div className="grow" />
        <div className="flex">
          <AccountMenu />
        </div>
      </Menubar>
    </div>
  );
}
