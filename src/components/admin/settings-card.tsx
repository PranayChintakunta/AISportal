"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";

export type SettingRow =
  | {
      label: string;
      type: "toggle";
      name?: string; // Form input name (e.g. "isRsvpOpen")
      on?: boolean; // Controlled state
      defaultOn?: boolean; // Initial state for uncontrolled use
      onChange?: (checked: boolean) => void;
    }
  | { label: string; type: "badge"; badge: string };

/**
 * Single Toggle Row with hidden form input support for native FormData submission.
 */
function SettingToggleRow({ item }: { item: Extract<SettingRow, { type: "toggle" }> }) {
  const [isOn, setIsOn] = useState<boolean>(item.on ?? item.defaultOn ?? true);

  // Keep state in sync if parent passes controlled `on` prop
  const currentOn = item.on !== undefined ? item.on : isOn;

  const handleToggle = () => {
    const nextOn = !currentOn;
    if (item.on === undefined) {
      setIsOn(nextOn);
    }
    item.onChange?.(nextOn);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="style-body-text leading-[20.3px] text-ink-muted">
        {item.label}
      </span>
      <div className="flex items-center gap-2">
        {/* Hidden input ensures value is passed in FormData when submitting parent <form> */}
        {item.name && (
          <input
            type="hidden"
            name={item.name}
            value={currentOn ? "true" : "false"}
          />
        )}
        <div onClick={handleToggle} className="cursor-pointer">
          <Toggle on={currentOn} label={item.label} />
        </div>
      </div>
    </div>
  );
}

/**
 * Event settings panel: a stack of label + control rows separated by hairlines.
 */
export function SettingsCard({ items }: { items: SettingRow[] }) {
  return (
    <div className="flex w-full flex-col gap-[14px] rounded-[16px] border border-border-soft bg-white px-[25px] pb-[25px] pt-[24px]">
      <h3 className="style-section-header leading-[21.25px] text-ink [font-variation-settings:'wdth'_100]">
        Settings
      </h3>

      {items.map((item, i) => (
        <div key={item.label} className="flex w-full flex-col gap-[14px]">
          {i > 0 && <div className="h-px w-full bg-border-soft" />}

          {item.type === "toggle" ? (
            <SettingToggleRow item={item} />
          ) : (
            <div className="flex items-center justify-between">
              <span className="style-body-text leading-[20.3px] text-ink-muted">
                {item.label}
              </span>
              <Badge label={item.badge} variant="outline" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}