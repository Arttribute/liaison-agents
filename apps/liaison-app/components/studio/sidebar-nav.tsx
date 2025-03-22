"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft, BookOpen, PlusCircle, ListIcon } from "lucide-react";

export function SidebarNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "h-screen bg-background border-r border-border flex flex-col transition-all duration-300",
        isOpen ? "w-[220px] min-w-[220px]" : "w-[60px] min-w-[60px]"
      )}
    >
      <div className="px-3 pt-4 flex items-center justify-between">
        {isOpen ? (
          <button
            onClick={() => setIsOpen(false)}
            className="mx-2 text-muted-foreground hover:text-foreground"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="px-2">
            <button
              onClick={() => setIsOpen(true)}
              className=" items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="px-3 py-2">
        <Link href={`/worlds/create`}>
          <Button className="w-full flex items-center justify-center gap-2  rounded-md py-2 font-medium text-sm">
            {isOpen ? (
              <>
                <PlusCircle className="h-4 w-4" />
                New liaison agent
              </>
            ) : (
              <PlusCircle className="h-5 w-5" />
            )}
          </Button>
        </Link>
      </div>

      <nav className="mt-2 px-3">
        <ul className="space-y-1">
          <li>
            <Link
              href="/studio"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground py-2 px-2 rounded-md hover:bg-accent transition-colors"
            >
              <ListIcon className="h-5 w-5" />
              {isOpen && <span className="text-sm">All liaisons</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/studio"
              target="_blank"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground py-2 px-2 rounded-md hover:bg-accent transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              {isOpen && <span className="text-sm">How to</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
