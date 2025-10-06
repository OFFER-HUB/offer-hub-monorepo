import { ProjectDraft, DraftMeta, DraftVersion, DraftExport, DraftSearchOptions } from "../types/draft.types";

// Key prefix for localStorage
const DRAFT_KEY_PREFIX = "project-draft-";
const DRAFT_LIST_KEY = "project-draft-list";

// --- Local Storage Utilities ---

export function saveDraftToStorage(draft: ProjectDraft) {
  localStorage.setItem(DRAFT_KEY_PREFIX + draft.meta.id, JSON.stringify(draft));
  updateDraftList(draft.meta);
}

export function getDraftFromStorage(id: string): ProjectDraft | null {
  const raw = localStorage.getItem(DRAFT_KEY_PREFIX + id);
  return raw ? JSON.parse(raw) : null;
}

export function deleteDraftFromStorage(id: string) {
  localStorage.removeItem(DRAFT_KEY_PREFIX + id);
  removeFromDraftList(id);
}

export function listDraftsFromStorage(): DraftMeta[] {
  const raw = localStorage.getItem(DRAFT_LIST_KEY);
  return raw ? JSON.parse(raw) : [];
}

function updateDraftList(meta: DraftMeta) {
  const list: DraftMeta[] = listDraftsFromStorage();
  const idx = list.findIndex((d) => d.id === meta.id);
  if (idx !== -1) {
    list[idx] = meta;
  } else {
    list.push(meta);
  }
  localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(list));
}

function removeFromDraftList(id: string) {
  const list: DraftMeta[] = listDraftsFromStorage();
  const filtered = list.filter((d) => d.id !== id);
  localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(filtered));
}

// --- Cross-tab Synchronization ---

export function subscribeToDraftChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

// --- Export/Import ---

export function exportDraft(id: string): string | null {
  const draft = getDraftFromStorage(id);
  return draft ? JSON.stringify(draft) : null;
}

export function importDraft(raw: string) {
  try {
    const draft: ProjectDraft = JSON.parse(raw);
    saveDraftToStorage(draft);
    return true;
  } catch {
    return false;
  }
}

// --- Cleanup ---

export function cleanupOldDrafts(maxAgeMs: number) {
  const now = Date.now();
  const list = listDraftsFromStorage();
  list.forEach((meta) => {
    if (now - meta.updatedAt > maxAgeMs) {
      deleteDraftFromStorage(meta.id);
    }
  });
}

// --- Search ---

export function searchDrafts(options: DraftSearchOptions): DraftMeta[] {
  let list = listDraftsFromStorage();
  if (options.query) {
    const q = options.query.toLowerCase();
    list = list.filter((d) => d.name.toLowerCase().includes(q));
  }
  if (options.projectId) {
    list = list.filter((d) => d.projectId === options.projectId);
  }
  if (options.userId) {
    list = list.filter((d) => d.userId === options.userId);
  }
  if (options.autoSaved !== undefined) {
    list = list.filter((d) => d.autoSaved === options.autoSaved);
  }
  return list;
}
