"use client";

import { useState } from "react";
import { FormField, FormTextarea } from "@/components/ui/form-field";
import { Tag } from "@/components/ui/tag";
import type { TagData } from "@/components/dashboard/up-next-card";

type EventFormProps = {
  /** Selectable category tags (the colourful pills). */
  tags: TagData[];
  defaultValues?: {
    title?: string;
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    capacity?: string;
    visibility?: string;
    status?: string;
    tags?: string[];
  };
};

export function EventForm({ tags, defaultValues }: EventFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultValues?.tags ?? []);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  return (
    <div className="flex min-w-px flex-1 flex-col gap-[18px] rounded-[16px] border border-border-soft bg-white p-[31px]">
      <input type="hidden" name="tags" value={selectedTags.join(",")} />
      <input type="hidden" name="status" value={defaultValues?.status ?? "UPCOMING"} />
      <input type="hidden" name="visibility" value={defaultValues?.visibility ?? "public"} />

      <FormField
        label="Event title"
        height={46}
        placeholder="e.g. Fall Kickoff"
        name="title"
        defaultValue={defaultValues?.title ?? ""}
        required
      />

      <FormTextarea
        label="Description"
        name="description"
        defaultValue={defaultValues?.description ?? ""}
        required
      />

      <div className="grid grid-cols-1 gap-x-[28px] gap-y-[20px] sm:grid-cols-2">
        <FormField
          label="Start time"
          placeholder="2026-09-10T19:00"
          type="datetime-local"
          name="startTime"
          defaultValue={defaultValues?.startTime ?? ""}
          required
        />
        <FormField
          label="End time"
          placeholder="2026-09-10T20:30"
          type="datetime-local"
          name="endTime"
          defaultValue={defaultValues?.endTime ?? ""}
          required
        />
        <FormField
          label="Location"
          placeholder="ECSW 1.315"
          name="location"
          defaultValue={defaultValues?.location ?? ""}
          required
        />
        <FormField
          label="Capacity"
          placeholder="150"
          inputMode="numeric"
          name="capacity"
          type="number"
          min="1"
          defaultValue={defaultValues?.capacity ?? ""}
        />
      </div>

      <div className="flex w-full flex-col gap-[7px]">
        <span className="font-body text-[14px] font-bold leading-[20.3px] text-ink-muted">
          Tags
        </span>
        <div className="flex flex-wrap gap-[8px]">
          {tags.map((t) => {
            const isActive = selectedTags.includes(t.label.toUpperCase());
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => toggleTag(t.label.toUpperCase())}
                className="rounded-full"
              >
                <Tag
                  label={t.label}
                  bg={t.bg}
                  color={t.color}
                  border={t.border}
                  className={isActive ? "ring-2 ring-brand/50" : ""}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
