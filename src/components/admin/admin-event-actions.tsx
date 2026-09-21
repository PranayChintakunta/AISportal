"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EventActionButtonsProps {
  isPublished: boolean;
  userRole?: string;
  /** Where Cancel returns to. Academy reuses this form on its own route. */
  cancelHref?: string;
  /** Noun used in the confirm prompts, e.g. "workshop". */
  noun?: string;
}

export function EventActionButtons({
  isPublished,
  userRole,
  cancelHref = "/admin/events",
  noun = "event",
}: EventActionButtonsProps) {
  const isExecutive = userRole === "EXECUTIVE" || userRole === "DIRECTOR";

  const handlePublishClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const confirmed = window.confirm(
      `Are you sure you want to publish this ${noun}? This will be visible to all users if so.`
    );
    if (!confirmed) {
      e.preventDefault();
    }
  };

  const handleUnpublishClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const confirmed = window.confirm(
      `Are you sure you want to unpublish this ${noun}? This will stop being visible to all users if so.`
    );
    if (!confirmed) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex gap-[10px]">
        <Button 
          type="submit" 
          name="action" 
          value="draft" 
          variant="ghost" 
          size="md" 
          className="flex-1"
        >
          Save changes
        </Button>

        {isExecutive && (
          isPublished ? (
            <Button 
              type="submit" 
              name="action" 
              value="unpublish" 
              variant="accent" 
              size="md"
              className="flex-1"
              onClick={handleUnpublishClick}
            >
              Unpublish
            </Button>
          ) : (
            <Button 
              type="submit" 
              name="action" 
              value="publish" 
              variant="primary" 
              size="md"
              className="flex-1"
              onClick={handlePublishClick}
            >
              Publish
            </Button>
          )
        )}
      </div>

      <Link href={cancelHref} className="w-full">
        <Button type="button" variant="ghost" size="md" className="w-full text-ink-faint">
          Cancel
        </Button>
      </Link>
    </div>
  );
}