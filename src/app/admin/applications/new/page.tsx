"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { chicagoInputToUtc } from "@/lib/timezone";
import {
  APPLICATION_TYPE_OPTIONS,
  QuestionBuilder,
  cleanQuestions,
  createEmptyQuestion,
  type BuilderQuestion,
  type BuilderQuestionType,
} from "@/components/admin/question-builder";

export type QuestionType = BuilderQuestionType;
export type Question = BuilderQuestion;

export type ProfileFieldRequirements = {
  requirePhoneNumber: boolean;
  requirePersonalEmail: boolean;
  requireResume: boolean;
  requireLinkedin: boolean;
  requireGithub: boolean;
  requirePortfolio: boolean;
};

export default function CreateApplicationPage({ embedded = true }: { embedded?: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const [profileRequirements, setProfileRequirements] = useState<ProfileFieldRequirements>({
    requireResume: true,
    requireLinkedin: false,
    requireGithub: false,
    requirePortfolio: false,
    requirePhoneNumber: false,
    requirePersonalEmail: true,
  });

  const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion("TEXT")]);

  const [rolesInput, setRolesInput] = useState("");
  const [eligibilityInput, setEligibilityInput] = useState("");
  const [linkInput, setLinkInput] = useState(""); 

  function handleFormSubmitIntent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPendingFormData(formData);
    setShowConfirmModal(true);
  }

  async function executePublish() {
    if (!pendingFormData) return;
    setSaving(true);
    setError(null);

    const cleanedQuestions = cleanQuestions(questions);

    const openAtRaw = pendingFormData.get("openAt") as string;
    const closeAtRaw = pendingFormData.get("closeAt") as string;
    const decisionDateRaw = pendingFormData.get("decisionDate") as string;
    const rawVisible = pendingFormData.get("visibleToUsers");
    const visibleToUsers = rawVisible === "true" || rawVisible === "on";

    // Split newline inputs into String Arrays to align with backend schema
    const roles = rolesInput
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const eligibility = eligibilityInput
      .split("\n")
      .map((e) => e.trim())
      .filter(Boolean);

    const link = linkInput
      .split("\n")
      .map((e) => e.trim())
      .filter(Boolean);

    const parseDate = (val: string) => {
      if (!val) return null;
      const utcDate = chicagoInputToUtc(val);
      return isNaN(utcDate.getTime()) ? null : utcDate.toISOString();
    };
    
    const payload = {
      title: pendingFormData.get("title") as string,
      programType: pendingFormData.get("programType") as string,
      description: pendingFormData.get("description") as string,
      roles,
      eligibility,
      link,
      openAt: parseDate(openAtRaw),
      closeAt: parseDate(closeAtRaw),
      decisionDate: parseDate(decisionDateRaw),
      visibleToUsers,
      requiredProfileFields: {
        requirePhoneNumber: profileRequirements.requirePhoneNumber,
        requirePersonalEmail: profileRequirements.requirePersonalEmail,
        requireResume: profileRequirements.requireResume,
        requireLinkedin: profileRequirements.requireLinkedin,
        requireGithub: profileRequirements.requireGithub,
        requirePortfolio: profileRequirements.requirePortfolio,
      },
      questions: cleanedQuestions,
    };

    try {
      const response = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Failed to create application.");
      }

      setShowConfirmModal(false);
      router.push("/admin/applications");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setShowConfirmModal(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={embedded ? "min-w-0 flex-1 p-6 lg:p-10" : "min-h-screen bg-cream p-5 md:p-10"}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border-soft pb-4">
          <div>
            <h1 className="style-section-header text-2xl font-bold text-ink">
              Create New Application Posting
            </h1>
            <p className="style-caption mt-1 text-ink-faint">
              Configure parameters, setup execution dates, and specify custom field responses.
            </p>
          </div>
          <Button variant="ghost" onClick={() => setShowCancelModal(true)}>
            Cancel
          </Button>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-danger-border bg-white p-4 text-danger-ink">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleFormSubmitIntent} className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
            <h2 className="style-body-text font-semibold text-ink text-lg">General Info</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-[6px]">
                <label htmlFor="title" className="style-caption font-medium text-ink-muted">
                  Application Title *
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. Fall 2026 AI Cohort"
                  className="h-[42px] rounded-lg border border-border-soft bg-white px-3.5 style-body-text text-ink outline-none transition-colors focus:border-brand"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label htmlFor="programType" className="style-caption font-medium text-ink-muted">
                  Program Type *
                </label>
                <select
                  id="programType"
                  name="programType"
                  defaultValue="AI_ACADEMY"
                  className="h-[42px] rounded-lg border border-border-soft bg-white px-3.5 style-body-text text-ink outline-none transition-colors focus:border-brand"
                >
                  <option value="AI_ACADEMY">AI Academy</option>
                  <option value="AI_INNOVATION">AI Innovation</option>
                  <option value="AI_MENTORSHIP_MENTOR">AIM Mentor</option>
                  <option value="AI_MENTORSHIP_MENTEE">AIM Mentee</option>
                  <option value="OFFICER">Officer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-[6px] md:col-span-2">
                <label htmlFor="description" className="style-caption font-medium text-ink-muted">
                  Description & Instructions *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  placeholder="Provide instructions and co-op details for prospective applicants..."
                  className="rounded-lg border border-border-soft bg-white p-3.5 style-body-text text-ink outline-none transition-colors focus:border-brand"
                />
              </div>

              {/* Roles Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="roles" className="text-sm font-medium">Available Roles (One per line)</label>
                <textarea
                  id="roles"
                  name="roles"
                  value={rolesInput}
                  onChange={(e) => setRolesInput(e.target.value)}
                  placeholder="e.g. Full Stack Developer&#10;UI/UX Designer&#10;ML Engineer"
                  rows={3}
                  className="border rounded-md p-2"
                />
              </div>

              {/* Eligibility Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="eligibility" className="text-sm font-medium">Eligibility Requirements (One per line)</label>
                <textarea
                  id="eligibility"
                  name="eligibility"
                  value={eligibilityInput}
                  onChange={(e) => setEligibilityInput(e.target.value)}
                  placeholder="e.g. Open to enrolled UTD students&#10;Must be able to commit 5 hrs/week"
                  rows={3}
                  className="border rounded-md p-2"
                />
              </div>

              {/* Links Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="link" className="text-sm font-medium">Reference Links on Application (One per line)</label>
                <textarea
                  id="link"
                  name="link"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="e.g. https://aim-project-descriptions.com"
                  rows={3}
                  className="border rounded-md p-2"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label htmlFor="openAt" className="style-caption font-medium text-ink-muted">
                  Open Date (CT) *
                </label>
                <input
                  id="openAt"
                  name="openAt"
                  type="datetime-local"
                  required
                  className="h-[42px] rounded-lg border border-border-soft bg-white px-3.5 style-body-text text-ink outline-none transition-colors focus:border-brand"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label htmlFor="closeAt" className="style-caption font-medium text-ink-muted">
                  Close Date (CT) *
                </label>
                <input
                  id="closeAt"
                  name="closeAt"
                  type="datetime-local"
                  required
                  className="h-[42px] rounded-lg border border-border-soft bg-white px-3.5 style-body-text text-ink outline-none transition-colors focus:border-brand"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label htmlFor="decisionDate" className="style-caption font-medium text-ink-muted">
                  Decision Date (CT)
                </label>
                <input
                  id="decisionDate"
                  name="decisionDate"
                  type="datetime-local"
                  className="h-[42px] rounded-lg border border-border-soft bg-white px-3.5 style-body-text text-ink outline-none transition-colors focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 md:col-span-2">
                <input
                  id="visibleToUsers"
                  name="visibleToUsers"
                  type="checkbox"
                  defaultChecked
                  value="true"
                  className="h-4 w-4 rounded accent-brand cursor-pointer"
                />
                <label htmlFor="visibleToUsers" className="style-body-text text-ink cursor-pointer select-none">
                  Make visible to applicants immediately upon publication
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
            <div>
              <h2 className="style-body-text font-semibold text-ink text-lg">
                Personal & Profile Field Requirements
              </h2>
              <p className="style-caption mt-0.5 text-ink-faint">
                Select which standard profile credentials applicants must submit for this specific application.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 pt-2">
              <label className="flex items-center gap-2.5 rounded-xl border border-border-soft p-3.5 cursor-pointer hover:bg-row-soft transition-colors">
                <input
                  type="checkbox"
                  checked={profileRequirements.requirePhoneNumber}
                  onChange={(e) =>
                    setProfileRequirements((prev) => ({ ...prev, requirePhoneNumber: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-brand cursor-pointer"
                />
                <span className="style-body-text text-ink font-medium">Phone Number</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-border-soft p-3.5 cursor-pointer hover:bg-row-soft transition-colors">
                <input
                  type="checkbox"
                  checked={profileRequirements.requirePersonalEmail}
                  onChange={(e) =>
                    setProfileRequirements((prev) => ({ ...prev, requirePersonalEmail: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-brand cursor-pointer"
                />
                <span className="style-body-text text-ink font-medium">Personal Email</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-border-soft p-3.5 cursor-pointer hover:bg-row-soft transition-colors">
                <input
                  type="checkbox"
                  checked={profileRequirements.requireResume}
                  onChange={(e) =>
                    setProfileRequirements((prev) => ({ ...prev, requireResume: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-brand cursor-pointer"
                />
                <span className="style-body-text text-ink font-medium">Resume PDF</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-border-soft p-3.5 cursor-pointer hover:bg-row-soft transition-colors">
                <input
                  type="checkbox"
                  checked={profileRequirements.requireLinkedin}
                  onChange={(e) =>
                    setProfileRequirements((prev) => ({ ...prev, requireLinkedin: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-brand cursor-pointer"
                />
                <span className="style-body-text text-ink font-medium">LinkedIn URL</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-border-soft p-3.5 cursor-pointer hover:bg-row-soft transition-colors">
                <input
                  type="checkbox"
                  checked={profileRequirements.requireGithub}
                  onChange={(e) =>
                    setProfileRequirements((prev) => ({ ...prev, requireGithub: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-brand cursor-pointer"
                />
                <span className="style-body-text text-ink font-medium">GitHub Profile</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-border-soft p-3.5 cursor-pointer hover:bg-row-soft transition-colors">
                <input
                  type="checkbox"
                  checked={profileRequirements.requirePortfolio}
                  onChange={(e) =>
                    setProfileRequirements((prev) => ({ ...prev, requirePortfolio: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-brand cursor-pointer"
                />
                <span className="style-body-text text-ink font-medium">Portfolio / Website</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="style-body-text font-semibold text-ink text-lg">Form Questions Schema</h2>
                <p className="style-caption mt-0.5 text-ink-faint">
                  Define questions, add supporting descriptions, adjust sequence order, and specify input rules.
                </p>
              </div>
            </div>

            <QuestionBuilder
              questions={questions}
              onChange={setQuestions}
              typeOptions={APPLICATION_TYPE_OPTIONS}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCancelModal(true)}
              className="h-[42px] px-5 style-body-text"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="h-[42px] px-6 style-body-text font-medium">
              Publish Application
            </Button>
          </div>
        </form>
      </div>

      {showConfirmModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-soft bg-white p-6 shadow-xl">
            <h3 className="style-section-header text-lg font-bold text-ink">
              Publish Application?
            </h3>
            <p className="mt-2 text-sm text-ink-muted">
              You are about to submit and register this application configuration. If set to visible, candidates will immediately be able to inspect and submit entries.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowConfirmModal(false)}>
                Back to Edit
              </Button>
              <Button variant="primary" size="sm" disabled={saving} onClick={executePublish}>
                {saving ? "Creating..." : "Confirm & Publish"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showCancelModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-soft bg-white p-6 shadow-xl">
            <h3 className="style-section-header text-lg font-bold text-ink">
              Discard Changes?
            </h3>
            <p className="mt-2 text-sm text-ink-muted">
              Are you sure you want to cancel? Any unsaved fields or form questions will be permanently cleared.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(false)}>
                Keep Editing
              </Button>
              <Button variant="danger" size="sm" onClick={() => router.back()}>
                Discard Posting
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}