"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { FormStepper } from "@/components/apply/form-stepper";
import { FormField } from "@/components/ui/form-field";
import { applicationSteps, personalFields } from "@/lib/data";

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

type FieldValues = Record<(typeof personalFields)[number], string>;

const DEFAULT_FIELD_VALUES: FieldValues = personalFields.reduce(
  (acc, field) => {
    acc[field] = "";
    return acc;
  },
  {} as FieldValues
);

function toFieldValues(values: Partial<FieldValues>) {
  return personalFields.reduce((acc, field) => {
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

  for (const field of personalFields) {
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
      <div className="flex w-full justify-end">
        <div className="h-[44px] w-[48px] rounded-[11px] bg-[#f4f1ea]" />
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

        setFieldValues(toFieldValues(mergedValues));
        setActiveStep(draftPayload.draft ? draftPayload.draft.stepIndex : 0);

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
                  {personalFields.map((label) => (
                    <FormField
                      key={label}
                      label={label}
                      value={fieldValues[label]}
                      onChange={(event) => {
                        const nextValues = {
                          ...fieldValues,
                          [label]: event.target.value,
                        };
                        fieldValuesRef.current = nextValues;
                        setFieldValues(nextValues);
                      }}
                      onBlur={() => {
                        scheduleDraftSave(fieldValuesRef.current, activeStep);
                      }}
                    />
                  ))}
                </div>

                {/* Next */}
                <div className="flex w-full justify-end">
                  <button
                    type="button"
                    aria-label="Next step"
                    className="flex h-[44px] w-[48px] items-center justify-center rounded-[11px] bg-brand text-[20px] font-bold leading-none text-white"
                    onBlur={() => {
                      scheduleDraftSave(fieldValuesRef.current, activeStep);
                    }}
                  >
                    â€º
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
