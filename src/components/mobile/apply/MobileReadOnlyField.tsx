import { isRequiredField, type QuestionConfig } from "@/lib/application-form";

type MobileReadOnlyFieldProps = {
  label: string;
  value: string;
  config?: QuestionConfig;
  multiline?: boolean;
};

/** Extracts and cleans filename from Cloudflare / Storage URLs */
function extractCleanFileName(urlOrPath: string): string {
  try {
    const parsed = new URL(urlOrPath);
    const rawName = parsed.pathname.split("/").pop() || "Uploaded File";
    const decoded = decodeURIComponent(rawName);
    return decoded.replace(/^[a-f0-9-]{36}_?/i, "").replace(/^\d+_\s*/, "");
  } catch {
    return decodeURIComponent(urlOrPath.split("/").pop() || "Uploaded File")
      .replace(/^[a-f0-9-]{36}_?/i, "")
      .replace(/^\d+_\s*/, "");
  }
}

export function MobileReadOnlyField({
  label,
  value,
  config,
  multiline = false,
}: MobileReadOnlyFieldProps) {
  const required = isRequiredField(label, config ? { [label]: config } : undefined);
  const displayLabel = required && !label.includes("*") ? `${label} *` : label;
  const rawType = String(config?.type || "").toUpperCase().trim();
  const cleanLabel = label.replace(/\s*\*$/, "");

  const isUrl =
    typeof value === "string" &&
    (value.startsWith("http://") || value.startsWith("https://"));

  const isCloudflareStorage =
    isUrl &&
    (value.includes("cloudflare") ||
      value.includes("r2.dev") ||
      value.includes("storage"));

  // Check if value is a JSON string payload from a file upload
  let isJsonFilePayload = false;
  try {
    if (value && typeof value === "string" && value.trim().startsWith("{")) {
      const parsed = JSON.parse(value);
      if (parsed.fileName || parsed.name || parsed.url || parsed.key) {
        isJsonFilePayload = true;
      }
    }
  } catch {
    isJsonFilePayload = false;
  }

  let displayFileName = "";
  let fileUrl = "";
  const isFileField =
    rawType === "FILE" ||
    cleanLabel === "Resume" ||
    isCloudflareStorage ||
    isJsonFilePayload;

  if (isFileField && value) {
    try {
      const parsed = JSON.parse(value);
      fileUrl = parsed.url || (isUrl ? value : "");
      displayFileName =
        parsed.fileName ||
        parsed.name ||
        (fileUrl ? extractCleanFileName(fileUrl) : extractCleanFileName(value));
    } catch {
      if (isUrl) {
        fileUrl = value;
        displayFileName = extractCleanFileName(value);
      } else {
        displayFileName = extractCleanFileName(value);
      }
    }
  }

  // Handle fallback resume route when fileUrl isn't embedded directly in JSON/string
  if (cleanLabel === "Resume" && !fileUrl) {
    fileUrl = "/api/profile/resume/download";
  }

  // Expanded check for short answers / long text / paragraphs
  const isLongText =
    multiline ||
    rawType === "LONG_TEXT" ||
    rawType === "LONGTEXT" ||
    rawType === "TEXTAREA" ||
    rawType === "PARAGRAPH" ||
    rawType === "ESSAY" ||
    (typeof value === "string" && (value.length > 60 || value.includes("\n")));

  const formattedValue = !value || value.trim() === "" ? "Not specified" : value;
  const isUnspecified = !value || value.trim() === "";

  // 1. FILE FIELD DISPLAY
  if (isFileField) {
    return (
      <div className="flex w-full flex-col gap-1.5">
        <label className="style-label-text font-medium text-ink-muted">{displayLabel}</label>
        <div className="flex h-11 w-full items-center justify-between rounded-xl border border-border-soft/60 bg-[#f5f4f0] px-3.5 text-sm">
          <div className="flex items-center gap-2 truncate">
            <svg className="h-4 w-4 shrink-0 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={`truncate ${isUnspecified ? "italic text-ink-faint" : "font-medium text-ink"}`}>
              {displayFileName || "No file uploaded"}
            </span>
          </div>
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 shrink-0 text-xs font-semibold text-brand underline underline-offset-2 hover:opacity-80"
            >
              View File
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  // 2. MULTI-LINE / LONG TEXT REVIEW FIELD (Handles paragraphs and longer text answers gracefully)
  if (isLongText) {
    return (
      <div className="flex w-full flex-col gap-1.5">
        <label className="style-label-text font-medium text-ink-muted">{displayLabel}</label>
        <div className={`style-body-text min-h-[90px] w-full whitespace-pre-wrap rounded-xl border border-border-soft/60 bg-[#f5f4f0] p-3.5 leading-relaxed ${isUnspecified ? "italic text-ink-faint" : "text-ink"}`}>
          {formattedValue}
        </div>
      </div>
    );
  }

  // 3. STANDARD SINGLE-LINE REVIEW FIELD (For short inputs like Name, Major, Short Answer)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="style-label-text font-medium text-ink-muted">{displayLabel}</label>
      <div className={`style-body-text flex h-11 w-full items-center rounded-xl border border-border-soft/60 bg-[#f5f4f0] px-3.5 ${isUnspecified ? "italic text-ink-faint" : "text-ink"}`}>
        <span className="truncate">{formattedValue}</span>
      </div>
    </div>
  );
}