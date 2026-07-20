"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { FormStepper } from "@/components/apply/form-stepper";
import { FormField, FormTextarea } from "@/components/ui/form-field";
import {
  applicationFormStepFields,
  applicationSteps,
  personalFields,
} from "@/lib/data";

type ProfileResponse = {
  profile: {
    firstName: string;
    lastName: string;
    middleName: string;
    prefName: string;
    year: string;
    degree: string;
    major: string;
    utdEmail: string | null;
    utdNetId: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    resumeFile: {
      id: string;
      fileName: string;
    } | null;
  } | null;
};

type DraftResponse = {
  draft: {
    formPayloadJson: unknown;
    stepIndex: number;
    isSubmitted: boolean;
  } | null;
};

type FieldValues = Record<string, string>;
type FieldErrors = Record<string, string>;

const stepFieldGroups: string[][] = applicationFormStepFields;
const allFieldLabels = stepFieldGroups.flat();

const DEFAULT_FIELD_VALUES: FieldValues = allFieldLabels.reduce(
  (acc, field) => {
    acc[field] = "";
    return acc;
  },
  {} as FieldValues
);

function toFieldValues(values: Partial<FieldValues>) {
  return allFieldLabels.reduce((acc, field) => {
    acc[field] = values[field] ?? "";
    return acc;
  }, { ...DEFAULT_FIELD_VALUES });
}

function extractStringValues(payload: unknown): Partial<FieldValues> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const record = payload as Record<string, unknown>;
  const values: Partial<FieldValues> = {};

  for (const field of allFieldLabels) {
    const value = record[field];
    if (typeof value === "string") {
      values[field] = value;
    }
  }

  return values;
}

function profileToFieldValues(profile: ProfileResponse["profile"]): Partial<FieldValues> {
  if (!profile) {
    return {};
  }

  return {
    "First Name": profile.firstName || "",
    "Last Name": profile.lastName || "",
    "NetID": profile.utdNetId ?? "",
    "UTD Email *": profile.utdEmail ?? "",
    "LinkedIn *": profile.linkedinUrl ?? "",
    "Resume *": profile.resumeFile?.fileName ?? "",
  };
}

function isRequiredField(label: string) {
  return label.trim().endsWith("*");
}

function validateStep(values: FieldValues, fields: string[]) {
  const nextErrors: FieldErrors = {};

  for (const field of fields) {
    if (!isRequiredField(field)) {
      continue;
    }

    if (!values[field]?.trim()) {
      nextErrors[field] = "This field is required.";
    }
  }

  return nextErrors;
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-[24px]">
      <div className="h-[34px] w-[460px] max-w-full rounded-full bg-[#f4f1ea]" />
      <div className="h-[48px] w-full rounded-[11px] border border-border-soft bg-white" />
      <div className="h-[20px] w-[320px] rounded-full bg-[#f4f1ea]" />
      <div className="grid grid-cols-1 gap-x-[28px] gap-y-[20px] sm:grid-cols-2">
        {personalFields.map((label) => (
          <div key={label} className="flex flex-col gap-[7px]">
            <div className="h-[14px] w-[120px] rounded-full bg-[#f4f1ea]" />
            <div className="h-[42px] rounded-[8px] bg-[#f4f1ea]" />
          </div>
        ))}
      </div>
      <div className="flex w-full justify-between">
        <div className="h-[44px] w-[88px] rounded-[11px] bg-[#f4f1ea]" />
        <div className="h-[44px] w-[88px] rounded-[11px] bg-[#f4f1ea]" />
      </div>
    </div>
  );
}

function NotFoundState({ message }: { message: string }) {
  return (
    <div className="rounded-[18px] border border-border-soft bg-white p-[35px] font-body text-[14px] leading-[20.3px] text-ink-muted">
      {message}
    </div>
  );
}

export default function ApplyFormPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const [fieldValues, setFieldValues] = useState<FieldValues>(DEFAULT_FIELD_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const fieldValuesRef = useRef<FieldValues>(DEFAULT_FIELD_VALUES);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      if (!applicationId) {
        setError("No application selected.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [profileResponse, draftResponse] = await Promise.all([
          fetch("/api/profile", { signal: controller.signal }),
          fetch(`/api/applications/${applicationId}/draft`, {
            signal: controller.signal,
          }),
        ]);

        const profilePayload = profileResponse.ok
          ? ((await profileResponse.json()) as ProfileResponse)
          : { profile: null };
        const draftPayload = draftResponse.ok
          ? ((await draftResponse.json()) as DraftResponse)
          : { draft: null };

        const mergedValues = {
          ...profileToFieldValues(profilePayload.profile),
          ...extractStringValues(draftPayload.draft?.formPayloadJson),
        };

        const nextValues = toFieldValues(mergedValues);
        setFieldValues(nextValues);
        fieldValuesRef.current = nextValues;
        setActiveStep(
          draftPayload.draft
            ? Math.min(Math.max(draftPayload.draft.stepIndex, 0), applicationSteps.length - 1)
            : 0
        );

        if (!draftResponse.ok && draftResponse.status === 404) {
          setError("Application draft not found.");
        }
      } catch (caught) {
        if ((caught as Error).name !== "AbortError") {
          setError("Unable to load this application form right now.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [applicationId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fieldValuesRef.current = fieldValues;
  }, [fieldValues]);

  function scheduleDraftSave(nextValues: FieldValues, nextStepIndex: number) {
    if (!applicationId) {
      return;
    }

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      void fetch(`/api/applications/${applicationId}/draft`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formPayloadJson: nextValues,
          stepIndex: nextStepIndex,
        }),
      });
    }, 500);
  }

  function handleNextStep() {
    const currentFields = stepFieldGroups[activeStep] ?? [];
    const nextErrors = validateStep(fieldValuesRef.current, currentFields);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const nextStepIndex = Math.min(activeStep + 1, applicationSteps.length - 1);
    setFieldErrors({});

    if (nextStepIndex !== activeStep) {
      setActiveStep(nextStepIndex);
      scheduleDraftSave(fieldValuesRef.current, nextStepIndex);
    }
  }

  function handleBackStep() {
    const nextStepIndex = Math.max(activeStep - 1, 0);
    setFieldErrors({});

    if (nextStepIndex !== activeStep) {
      setActiveStep(nextStepIndex);
      scheduleDraftSave(fieldValuesRef.current, nextStepIndex);
    }
  }

  function renderField(label: string) {
    const value = fieldValues[label] ?? "";
    const errorMessage = fieldErrors[label];
    const commonProps = {
      label,
      value,
      "aria-invalid": Boolean(errorMessage),
      className: errorMessage ? "ring-1 ring-[#9a3b36]/35" : undefined,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const nextValues = {
          ...fieldValuesRef.current,
          [label]: event.target.value,
        };
        fieldValuesRef.current = nextValues;
        setFieldValues(nextValues);

        if (fieldErrors[label]) {
          setFieldErrors((current) => {
            const nextErrors = { ...current };
            delete nextErrors[label];
            return nextErrors;
          });
        }
      },
      onBlur: () => {
        scheduleDraftSave(fieldValuesRef.current, activeStep);
      },
    };

    return (
      <div key={label} className="flex flex-col gap-[6px]">
        {activeStep === 0 ? (
          <FormField {...commonProps} />
        ) : (
          <FormTextarea {...commonProps} />
        )}
        {errorMessage ? (
          <p className="font-body text-[12px] leading-[17px] text-[#9a3b36]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <Navbar active="Apply" />

      <div className="flex w-full flex-col items-center px-[47px] pt-[34px] pb-[120px]">
        {/* Application card */}
        <div className="w-full max-w-[1346px] rounded-[18px] border border-border-soft bg-white p-[35px] [filter:drop-shadow(0px_8px_11px_rgba(0,0,0,0.04))]">
          <div className="flex flex-col gap-[24px]">
            <h1 className="font-display text-[32px] font-bold leading-[34.56px] tracking-[-0.4px] text-ink [font-variation-settings:'wdth'_100]">
              AIM Mentor Application Â· Fall 2026
            </h1>

            <FormStepper steps={applicationSteps} active={activeStep} />

            <p className="font-body text-[14px] font-bold leading-[20.3px] text-ink">
              * Please verify that the following information is correct
            </p>

            {loading ? (
              <LoadingState />
            ) : error ? (
              <NotFoundState message={error} />
            ) : (
              <>
                {/* Field grid */}
                <div className="grid grid-cols-1 gap-x-[28px] gap-y-[20px] sm:grid-cols-2">
                  {(stepFieldGroups[activeStep] ?? []).map((label) => renderField(label))}
                </div>

                {/* Navigation */}
                <div className="flex w-full justify-between">
                  <button
                    type="button"
                    className="flex h-[44px] items-center justify-center rounded-[11px] border border-border-soft bg-white px-[18px] font-body text-[14px] font-semibold leading-none text-ink-muted disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleBackStep}
                    disabled={activeStep === 0}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    aria-label="Next step"
                    className="flex h-[44px] min-w-[96px] items-center justify-center rounded-[11px] bg-brand px-[18px] text-[14px] font-bold leading-none text-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleNextStep}
                    disabled={activeStep >= applicationSteps.length - 1}
                    onBlur={() => {
                      scheduleDraftSave(fieldValuesRef.current, activeStep);
                    }}
                  >
                    {activeStep >= applicationSteps.length - 1 ? "Done" : "Next"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
