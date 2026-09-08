import * as React from "react";
import { cn } from "@/lib/utils";

export type FormFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Input height — title field defaults slightly taller (46px) than standard (42px). */
  height?: number;
  error?: string;
  helperText?: string;
};

/**
 * Bold-label + filled input matching the Figma design system.
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, height = 42, id, className, error, helperText, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? `field-${generatedId}`;

    return (
      <div className="flex w-full flex-col gap-[6px]">
        <div className="flex justify-between items-center">
          <label
            htmlFor={inputId}
            className="style-label-text text-ink-muted font-medium select-none"
          >
            {label}
          </label>
          {error && (
            <span className="text-xs font-medium text-red-500">{error}</span>
          )}
        </div>

        <input
          ref={ref}
          id={inputId}
          style={{ height }}
          className={cn(
            "w-full rounded-[8px] bg-search-field px-[14px] style-input-text text-slate-900 border border-transparent",
            "placeholder:text-search-ink/60 transition-all duration-150 ease-in-out",
            "hover:bg-search-field/80",
            "focus:outline-none focus:bg-white focus:border-brand focus:ring-3 focus:ring-brand/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/80 bg-red-50/20 focus:border-red-500 focus:ring-red-500/15",
            className
          )}
          {...props}
        />

        {helperText && !error && (
          <p className="text-xs text-ink-muted/60">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

/**
 * Bold-label + bordered textarea matching the Figma design system.
 */
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, id, className, error, helperText, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? `textarea-${generatedId}`;

    return (
      <div className="flex w-full flex-col gap-[6px]">
        <div className="flex justify-between items-center">
          <label
            htmlFor={inputId}
            className="style-label-text text-ink-muted font-medium select-none"
          >
            {label}
          </label>
          {error && (
            <span className="text-xs font-medium text-red-500">{error}</span>
          )}
        </div>

        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-[96px] w-full resize-none rounded-[8px] border border-border-soft bg-white px-[14px] py-[10px]",
            "style-input-text text-slate-900 placeholder:text-search-ink/60",
            "transition-all duration-150 ease-in-out hover:border-border-soft/80",
            "focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/80 bg-red-50/20 focus:border-red-500 focus:ring-red-500/15",
            className
          )}
          {...props}
        />

        {helperText && !error && (
          <p className="text-xs text-ink-muted/60">{helperText}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";