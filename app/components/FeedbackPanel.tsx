"use client";

import { useId, useState } from "react";
import {
  saveFeedbackReport,
  type FeedbackReason,
} from "../lib/storage";
import {
  READINESS_CATEGORIES,
  READINESS_CATEGORY_LABELS,
} from "../lib/readiness/types";

const DEFAULT_CATEGORIES = READINESS_CATEGORIES.map(
  (category) => READINESS_CATEGORY_LABELS[category],
);

const FEEDBACK_REASONS: readonly {
  id: FeedbackReason;
  label: string;
}[] = [
  { id: "incorrect-status", label: "Incorrect status" },
  { id: "missing-data", label: "Missing data" },
  { id: "source-link-problem", label: "Source link problem" },
  { id: "missing-readiness-check", label: "Missing readiness check" },
  { id: "other", label: "Other" },
];

const EXPECTED_STATUSES = [
  "Complete",
  "Blocker",
  "Review Required",
  "Pending",
  "Day-of Action",
  "Not Applicable",
  "Unable to Verify",
] as const;

type FeedbackPanelProps = {
  defaultCategory?: string;
  categories?: readonly string[];
  className?: string;
};

export function FeedbackPanel({
  defaultCategory,
  categories = DEFAULT_CATEGORIES,
  className = "",
}: FeedbackPanelProps) {
  const generatedId = useId().replace(/:/g, "");
  const panelId = `prototype-feedback-${generatedId}`;
  const commentErrorId = `${panelId}-comment-error`;
  const availableCategories =
    categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<FeedbackReason>("incorrect-status");
  const [relatedCategory, setRelatedCategory] = useState(
    defaultCategory && availableCategories.includes(defaultCategory)
      ? defaultCategory
      : availableCategories[0],
  );
  const [comment, setComment] = useState("");
  const [expectedStatus, setExpectedStatus] = useState("");
  const [commentError, setCommentError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      setCommentError("Describe what appears incorrect or missing.");
      setSaveError("");
      setConfirmation("");
      return;
    }

    const savedReport = saveFeedbackReport({
      reason,
      relatedCategory,
      comment: trimmedComment,
      expectedStatus: expectedStatus || undefined,
    });

    if (!savedReport) {
      setSaveError(
        "Feedback could not be saved in this browser. Check browser storage settings and try again.",
      );
      setCommentError("");
      setConfirmation("");
      return;
    }

    setComment("");
    setExpectedStatus("");
    setCommentError("");
    setSaveError("");
    setConfirmation(
      "Feedback saved in this browser for the prototype session.",
    );
  }

  return (
    <section
      className={`rounded-lg border border-slate-300 bg-white shadow-sm ${className}`}
      aria-labelledby={`${panelId}-heading`}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="flex min-h-12 w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left text-sm font-bold text-blue-800 outline-none transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        onClick={() => {
          setIsOpen((current) => !current);
          setCommentError("");
          setSaveError("");
          setConfirmation("");
        }}
        type="button"
      >
        <span id={`${panelId}-heading`}>
          Report Incorrect or Missing Information
        </span>
        <span aria-hidden="true" className="text-lg">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <div className="border-t border-slate-200 p-4 sm:p-5" hidden={!isOpen} id={panelId}>
        <p className="mb-5 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-950">
          Prototype feedback — not submitted to a production work-management
          system.
        </p>

        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-sm font-bold text-slate-800"
                htmlFor={`${panelId}-reason`}
              >
                Feedback type
              </label>
              <select
                className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                id={`${panelId}-reason`}
                onChange={(event) =>
                  setReason(event.target.value as FeedbackReason)
                }
                value={reason}
              >
                {FEEDBACK_REASONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-bold text-slate-800"
                htmlFor={`${panelId}-category`}
              >
                Related readiness category
              </label>
              <select
                className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                id={`${panelId}-category`}
                onChange={(event) => setRelatedCategory(event.target.value)}
                value={relatedCategory}
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-bold text-slate-800"
              htmlFor={`${panelId}-comment`}
            >
              Comment <span className="text-red-700">(required)</span>
            </label>
            <textarea
              aria-describedby={commentError ? commentErrorId : undefined}
              aria-invalid={Boolean(commentError)}
              className="min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              id={`${panelId}-comment`}
              onChange={(event) => {
                setComment(event.target.value);
                if (commentError) setCommentError("");
              }}
              placeholder="Describe the information that should be checked. Do not enter sensitive or real plant information."
              value={comment}
            />
            {commentError ? (
              <p className="mt-1.5 text-sm font-semibold text-red-700" id={commentErrorId} role="alert">
                {commentError}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-bold text-slate-800"
              htmlFor={`${panelId}-expected-status`}
            >
              Expected status <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <select
              className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:max-w-sm"
              id={`${panelId}-expected-status`}
              onChange={(event) => setExpectedStatus(event.target.value)}
              value={expectedStatus}
            >
              <option value="">Not specified</option>
              {EXPECTED_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="min-h-11 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-bold text-white outline-none transition hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              type="submit"
            >
              Save Prototype Feedback
            </button>
            <button
              className="min-h-11 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Close
            </button>
          </div>

          <p
            aria-live="polite"
            className="text-sm font-semibold text-green-800"
            role="status"
          >
            {confirmation}
          </p>
          {saveError ? (
            <p className="text-sm font-semibold text-red-700" role="alert">
              {saveError}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
