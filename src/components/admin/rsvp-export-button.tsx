"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const RSVP_EXPORT_FIELDS = [
  // Personal Info
  { id: "profile.firstName", label: "First Name" },
  { id: "profile.lastName", label: "Last Name" },
  { id: "profile.middleName", label: "Middle Name" },
  { id: "profile.prefName", label: "Preferred Name" },
  // Contact
  { id: "user.email", label: "Email" },
  { id: "profile.personalEmail", label: "Personal Email" },
  { id: "profile.utdNetId", label: "UTD NetID" },
  { id: "profile.phoneNumber", label: "Phone Number" },
  // Academic
  { id: "profile.degree", label: "Degree" },
  { id: "profile.major", label: "Major" },
  { id: "profile.year", label: "Year" },
  // Links
  { id: "profile.githubUrl", label: "GitHub URL" },
  { id: "profile.linkedinUrl", label: "LinkedIn URL" },
  { id: "profile.portfolioUrl", label: "Portfolio URL" },
  // RSVP info
  { id: "rsvp.status", label: "RSVP Status" },
  { id: "rsvp.createdAt", label: "RSVP Date" },
  { id: "rsvp.isWalkIn", label: "Walk-in" },
  // Attendance
  { id: "attendance.checkedIn", label: "Checked In" },
  { id: "attendance.checkedInAt", label: "Check-in Time" },
];

// Default pre-selected fields
const DEFAULT_FIELDS = [
  "profile.firstName",
  "profile.lastName",
  "user.email",
  "profile.personalEmail",
  "profile.utdNetId",
  "rsvp.status",
  "rsvp.createdAt",
  "attendance.checkedIn",
  "attendance.checkedInAt",
];

const FIELD_GROUPS = [
  {
    label: "Personal Info",
    fieldIds: ["profile.firstName", "profile.lastName", "profile.middleName", "profile.prefName"],
  },
  {
    label: "Contact",
    fieldIds: ["user.email", "profile.personalEmail", "profile.utdNetId", "profile.phoneNumber"],
  },
  {
    label: "Academic",
    fieldIds: ["profile.degree", "profile.major", "profile.year"],
  },
  {
    label: "Links",
    fieldIds: ["profile.githubUrl", "profile.linkedinUrl", "profile.portfolioUrl"],
  },
  {
    label: "RSVP",
    fieldIds: ["rsvp.status", "rsvp.createdAt", "rsvp.isWalkIn"],
  },
  {
    label: "Attendance",
    fieldIds: ["attendance.checkedIn", "attendance.checkedInAt"],
  },
];

export function RsvpExportButton({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
      >
        ↓ Export RSVPs CSV
      </Button>

      {showModal && (
        <RsvpExportModal
          eventId={eventId}
          eventTitle={eventTitle}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function RsvpExportModal({
  eventId,
  eventTitle,
  onClose,
}: {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}) {
  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_FIELDS);

  const toggleAll = () => {
    if (selectedFields.length === RSVP_EXPORT_FIELDS.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(RSVP_EXPORT_FIELDS.map((f) => f.id));
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
    window.open(
      `/api/admin/events/${eventId}/rsvps/export?fields=${fieldsParam}`,
      "_blank"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-ink">Export RSVP CSV</h3>
            <p className="style-caption text-ink-faint mt-0.5 truncate max-w-[280px]">
              {eventTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-medium text-blue-600 hover:underline shrink-0 mt-0.5"
          >
            {selectedFields.length === RSVP_EXPORT_FIELDS.length
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
                  const field = RSVP_EXPORT_FIELDS.find((f) => f.id === fieldId);
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