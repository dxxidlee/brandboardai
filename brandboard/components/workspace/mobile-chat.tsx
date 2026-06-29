"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  WorkspaceChatPanel,
  type ChatMessageItem,
} from "@/components/workspace/chat-panel";

type MobileChatProps = {
  projectId: string;
  prompt: string;
  title: string;
  summary: string;
  confidenceLabel?: string | null;
  initialMessages?: ChatMessageItem[];
};

/** Opens the AI chat panel in a sheet on small screens. */
export function MobileChat(props: MobileChatProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 lg:hidden">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Chat</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm p-4">
        <SheetTitle className="sr-only">AI chat</SheetTitle>
        <div className="h-full pt-6">
          <WorkspaceChatPanel {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
