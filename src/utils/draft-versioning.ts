import { ProjectDraft, DraftVersion, DraftChange, DraftData } from "../types/draft.types";

// Create a new version for a draft
export function createDraftVersion(data: DraftData, prevData: DraftData, version: number): DraftVersion {
  return {
    version,
    timestamp: Date.now(),
    changes: diffDrafts(prevData, data),
    data: { ...data },
  };
}

// Compare two draft data objects and return the changes
export function diffDrafts(oldData: DraftData, newData: DraftData): DraftChange[] {
  const changes: DraftChange[] = [];
  const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  keys.forEach((key) => {
    if (oldData[key] !== newData[key]) {
      changes.push({
        field: key,
        oldValue: oldData[key],
        newValue: newData[key],
      });
    }
  });
  return changes;
}

// Get a summary of changes between two versions
export function summarizeVersionChanges(version: DraftVersion): string[] {
  return version.changes.map(
    (c) => `Field '${c.field}' changed from '${c.oldValue}' to '${c.newValue}'`
  );
}

// Compare two versions for UI diff
export function compareDraftVersions(a: DraftVersion, b: DraftVersion): DraftChange[] {
  return diffDrafts(a.data, b.data);
}
