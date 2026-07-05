import { FormField, FormTextarea } from "@/components/ui/form-field";
import { Tag } from "@/components/ui/tag";
import type { TagData } from "@/components/dashboard/up-next-card";

type EventFormProps = {
  /** Selectable category tags (the colourful pills). */
  tags: TagData[];
};

/**
 * Left-hand event form: title, description, the date/time/location/capacity
 * grid, and the category tag picker.
 */
export function EventForm({ tags }: EventFormProps) {
  return (
    <div className="flex min-w-px flex-1 flex-col gap-[18px] rounded-[16px] border border-border-soft bg-white p-[31px]">
      <FormField label="Event title" height={46} placeholder="e.g. Fall Kickoff" />

      <FormTextarea label="Description" />

      <div className="grid grid-cols-1 gap-x-[28px] gap-y-[20px] sm:grid-cols-2">
        <FormField label="Date" placeholder="mm / dd / yyyy" />
        <FormField label="Time" placeholder="7:00 PM" />
        <FormField label="Location" placeholder="ECSW 1.315" />
        <FormField label="Capacity" placeholder="150" inputMode="numeric" />
      </div>

      <div className="flex w-full flex-col gap-[7px]">
        <span className="font-body text-[14px] font-bold leading-[20.3px] text-ink-muted">
          Tags
        </span>
        <div className="flex flex-wrap gap-[8px]">
          {tags.map((t) => (
            <Tag
              key={t.label}
              label={t.label}
              bg={t.bg}
              color={t.color}
              border={t.border}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
