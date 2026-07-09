import { useMemo, useState } from 'react';
import type { CRIntake } from '../types';
import { detectMissingInfo } from '../utils/draft';

type FieldErrors = Partial<Record<keyof CRIntake, string>>;

export function useCRValidation(values: CRIntake) {
  const [touched, setTouched] = useState<Partial<Record<keyof CRIntake, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const missingInfo = useMemo(() => detectMissingInfo(values), [values]);

  const fieldErrors = useMemo<FieldErrors>(() => {
    const errors: FieldErrors = {};
    if (!values.crNumber.trim()) errors.crNumber = 'CR number is required.';
    if (!values.assetNumber.trim()) errors.assetNumber = 'Asset number is required.';
    if (!values.componentDescription.trim()) errors.componentDescription = 'Component description is required.';
    if (!values.location.trim()) errors.location = 'Location is required.';
    if (!values.problemStatement.trim() || values.problemStatement.trim().length < 12) {
      errors.problemStatement = 'Problem statement needs a clearer description.';
    }
    if (!values.requestedAction.trim() || values.requestedAction.trim().length < 8) {
      errors.requestedAction = 'Requested action needs a clearer planner action.';
    }
    return errors;
  }, [values]);

  const visibleErrors = useMemo(() => {
    const next: FieldErrors = {};
    for (const [key, value] of Object.entries(fieldErrors) as Array<[keyof CRIntake, string]>) {
      if (submitted || touched[key]) next[key] = value;
    }
    return next;
  }, [fieldErrors, submitted, touched]);

  return {
    touched,
    setTouched,
    submitted,
    setSubmitted,
    fieldErrors,
    visibleErrors,
    missingInfo,
    isValid: Object.keys(fieldErrors).length === 0,
  };
}
