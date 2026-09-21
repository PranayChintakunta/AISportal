"use client";

import { useState } from "react";
import { FormField, FormTextarea } from "@/components/ui/form-field";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import type { TagData } from "@/components/dashboard/up-next-card";

type WorkshopItemInput = {
  name: string;
  type: "MEAL" | "DRINK" | "MERCH" | "OTHER";
};

type WorkshopFormProps = {
  /** Selectable category tags (the colorful pills). */
  tags: TagData[];
  defaultValues?: {
    title?: string;
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    capacity?: string;
    status?: string;
    //tags?: string[];
    //items?: WorkshopItemInput[];
    summary?: string;
    quizDueAt?: string;
  };
};

/**
 * Workshop details form. Mirrors the event form, minus the "counts toward"
 * picker — every workshop counts toward AI Academy by definition, so the
 * server sets that rather than offering it as a choice.
 */
export function WorkshopForm({ tags, defaultValues }: WorkshopFormProps) {
  //const [selectedTags, setSelectedTags] = useState<string[]>(defaultValues?.tags ?? []);
  //const [items, setItems] = useState<WorkshopItemInput[]>(defaultValues?.items ?? []);

  // const toggleTag = (tag: string) => {
  //   setSelectedTags((current) =>
  //     current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
  //   );
  // };

  // const addItem = () => {
  //   setItems((current) => [...current, { name: "", type: "MEAL" }]);
  // };

  // const removeItem = (index: number) => {
  //   setItems((current) => current.filter((_, i) => i !== index));
  // };

  // const updateItem = (index: number, field: keyof WorkshopItemInput, value: string) => {
  //   setItems((current) => {
  //     const updated = [...current];
  //     updated[index] = { ...updated[index], [field]: value };
  //     return updated;
  //   });
  // };

  return (
    <div className="flex min-w-px flex-1 flex-col gap-[24px] rounded-[16px] border border-border-soft bg-white p-[31px]">
      {/* <input type="hidden" name="tags" value={selectedTags.join(",")} /> */}
      <input type="hidden" name="status" value={defaultValues?.status ?? "UPCOMING"} />
      {/* <input type="hidden" name="eventItems" value={JSON.stringify(items)} /> */}

      <FormField
        label="Workshop title"
        height={46}
        placeholder="e.g. Neural Networks Workshop"
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

      {/* Workshop Items / Perks Section */}
      {/* <div className="flex flex-col gap-3 border-t border-border-soft pt-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="style-body-text leading-[20.3px] text-ink">
              Workshop Items / Perks (Meals, Drinks, Merch)
            </span>
            <p className="style-caption text-xs text-ink-faint">
              Configure items that can be scanned/claimed during the workshop.
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            + Add Item
          </Button>
        </div>

        {items.length > 0 && (
          <div className="mt-2 flex flex-col gap-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-border-soft bg-background p-3"
              >
                <input
                  type="text"
                  placeholder="Item Name (e.g. Pizza Slice, T-Shirt)"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  className="flex-1 rounded-lg border border-border-soft bg-white px-3 py-2 style-caption text-sm text-ink outline-none focus:border-brand"
                  required
                />
                <select
                  value={item.type}
                  onChange={(e) =>
                    updateItem(index, "type", e.target.value as WorkshopItemInput["type"])
                  }
                  className="rounded-lg border border-border-soft bg-white px-3 py-2 style-caption text-sm text-ink outline-none focus:border-brand"
                >
                  <option value="MEAL">MEAL</option>
                  <option value="DRINK">DRINK</option>
                  <option value="MERCH">MERCH</option>
                  <option value="OTHER">OTHER</option>
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div> */}

      {/* Tags Section */}
      {/* <div className="flex w-full flex-col gap-[7px] border-t border-border-soft pt-5">
        <span className="style-body-text leading-[20.3px] text-ink-muted">Tags</span>
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
      </div> */}
    </div>
  );
}
