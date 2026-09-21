"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

interface DeleteEventButtonProps {
  eventId: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  /** Shown in the button and confirmation prompt. */
  noun?: string;
}

export function DeleteEventButton({
  eventId,
  deleteAction,
  noun = "event",
}: DeleteEventButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${noun}? All associated RSVPs and data will be permanently removed.`)) {
      const formData = new FormData();
      formData.append("id", eventId);
      
      startTransition(async () => {
        try {
          await deleteAction(formData);
        } catch {
          alert(`Failed to delete ${noun}. Please try again.`);
        }
      });
    }
  };

  return (
    <Button 
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      variant="ghost" 
      size="md" 
      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      {isPending ? "Deleting..." : `Delete ${noun.charAt(0).toUpperCase()}${noun.slice(1)}`}
    </Button>
  );
}
