"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const MEMBER_EXPORT_FIELDS = [
  // User Account Info
  { id: "user.id", label: "User ID" },
  { id: "user.email", label: "Email" },
  { id: "user.role", label: "Role" },
  { id: "user.team", label: "Team" },
  { id: "user.ticketToken", label: "Ticket Token" },
  { id: "user.verifiedAt", label: "Verified At" },
  { id: "user.lastLoginAt", label: "Last Login At" },
  { id: "user.createdAt", label: "Account Created At" },
  // Personal Info
  { id: "profile.firstName", label: "First Name" },
  { id: "profile.lastName", label: "Last Name" },
  { id: "profile.middleName", label: "Middle Name" },
  { id: "profile.prefName", label: "Preferred Name" },
  // Contact
  { id: "profile.personalEmail", label: "Personal Email" },
  { id: "profile.utdEmail", label: "UTD Email" },
  { id: "profile.utdNetId", label: "UTD NetID" },
  { id: "profile.phoneNumber", label: "Phone Number" },
  // Academic & Links
  { id: "profile.degree", label: "Degree" },
  { id: "profile.major", label: "Major" },
  { id: "profile.year", label: "Year" },
  { id: "profile.githubUrl", label: "GitHub URL" },
  { id: "profile.linkedinUrl", label: "LinkedIn URL" },
  { id: "profile.portfolioUrl", label: "Portfolio URL" },
  { id: "profile.profileCompletionStatus", label: "Profile Status" },
  // Events, Applications & Activity
  { id: "memberships", label: "Memberships" },
  { id: "rsvps", label: "RSVP'd Events" },
  { id: "attendances", label: "Attended Events & Workshops" },
  { id: "submissions", label: "Submitted Applications" },
  { id: "drafts", label: "Application Drafts" },
  { id: "quizAttempts", label: "Quiz Attempts" },
  { id: "videoProgress", label: "Workshop Video Progress" },
];

const DEFAULT_FIELDS = [
  "profile.firstName",
  "profile.lastName",
  "user.email",
  "profile.utdNetId",
  "user.role",
  "user.team",
  "memberships",
  "rsvps",
  "attendances",
  "submissions",
];

const FIELD_GROUPS = [
  {
    label: "Account Details",
    fieldIds: [
      "user.id",
      "user.email",
      "user.role",
      "user.team",
      "user.ticketToken",
      "user.verifiedAt",
      "user.lastLoginAt",
      "user.createdAt",
    ],
  },
  {
    label: "Personal Info",
    fieldIds: [
      "profile.firstName",
      "profile.lastName",
      "profile.middleName",
      "profile.prefName",
    ],
  },
  {
    label: "Contact",
    fieldIds: [
      "profile.personalEmail",
      "profile.utdEmail",
      "profile.utdNetId",
      "profile.phoneNumber",
    ],
  },
  {
    label: "Academic & Links",
    fieldIds: [
      "profile.degree",
      "profile.major",
      "profile.year",
      "profile.githubUrl",
      "profile.linkedinUrl",
      "profile.portfolioUrl",
      "profile.profileCompletionStatus",
    ],
  },
  {
    label: "Activity, RSVPs & Applications",
    fieldIds: [
      "memberships",
      "rsvps",
      "attendances",
      "submissions",
      "drafts",
      "quizAttempts",
      "videoProgress",
    ],
  },
];

export function MemberExportButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
        ↓ Export CSV
      </Button>

      {showModal && <MemberExportModal onClose={() => setShowModal(false)} />}
    </>
  );
}

function MemberExportModal({ onClose }: { onClose: () => void }) {
  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_FIELDS);

  const toggleAll = () => {
    if (selectedFields.length === MEMBER_EXPORT_FIELDS.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(MEMBER_EXPORT_FIELDS.map((f) => f.id));
    }
  };

  const toggleField = (fieldId: string, checked: boolean) => {
    setSelectedFields((prev) =>
      checked ? [...prev, fieldId] : prev.filter((id) => id !== fieldId)
    );
  };

  const handleDownload = () => {
    if (selectedFields.length === 0) {
      alert("Please select at least one field to export.");
      return;
    }
    const fieldsParam = encodeURIComponent(JSON.stringify(selectedFields));
    window.open(`/api/admin/members/export?fields=${fieldsParam}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-ink">Export Comprehensive Member CSV</h3>
            <p className="style-caption text-ink-faint mt-0.5">
              Select all profile, event history, and application data fields to export.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-medium text-blue-600 hover:underline shrink-0 mt-0.5"
          >
            {selectedFields.length === MEMBER_EXPORT_FIELDS.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {/* Field groups */}
        <div className="max-h-80 overflow-y-auto border border-border-soft rounded-xl divide-y divide-border-soft/50">
          {FIELD_GROUPS.map((group) => (
            <div key={group.label} className="px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.fieldIds.map((fieldId) => {
                  const field = MEMBER_EXPORT_FIELDS.find((f) => f.id === fieldId);
                  if (!field) return null;
                  return (
                    <label
                      key={field.id}
                      className="flex items-center gap-2 text-xs py-1 cursor-pointer rounded hover:bg-row-soft px-1 -mx-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.id)}
                        onChange={(e) => toggleField(field.id, e.target.checked)}
                        className="accent-brand"
                      />
                      <span className="truncate text-ink">{field.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border-soft">
          <span className="style-caption text-ink-faint">
            {selectedFields.length} field{selectedFields.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleDownload}>
              Download CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}