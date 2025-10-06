import { useCallback, useEffect, useRef, useState } from "react";
import {
  ProjectDraft,
  DraftMeta,
  DraftData,
  DraftVersion,
  DraftSearchOptions,
} from "../types/draft.types";
import {
  saveDraftToStorage,
  getDraftFromStorage,
  deleteDraftFromStorage,
  listDraftsFromStorage,
  subscribeToDraftChanges,
  exportDraft,
  importDraft,
  cleanupOldDrafts,
  searchDrafts,
} from "../utils/draft-storage";
import {
  createDraftVersion,
  compareDraftVersions,
} from "../utils/draft-versioning";

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function useProjectDrafts(projectId: string, userId?: string) {
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [currentDraft, setCurrentDraft] = useState<ProjectDraft | null>(null);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load all drafts for this project/user
  const loadDrafts = useCallback(() => {
    setDrafts(
      searchDrafts({ projectId, userId })
        .sort((a, b) => b.updatedAt - a.updatedAt)
    );
  }, [projectId, userId]);

  // Load a specific draft
  const loadDraft = useCallback((id: string) => {
    const draft = getDraftFromStorage(id);
    setCurrentDraft(draft);
    setLastSaved(draft?.meta.lastSaved || null);
  }, []);

  // Save current draft (manual or auto)
  const saveDraft = useCallback((data: DraftData, name?: string, autoSaved = false) => {
    setSaving(true);
    let draft = currentDraft;
    const now = Date.now();
    if (!draft) {
      // New draft
      const id = `${projectId}-${now}`;
      const meta: DraftMeta = {
        id,
        name: name || "Untitled Draft",
        createdAt: now,
        updatedAt: now,
        lastSaved: now,
        version: 1,
        projectId,
        userId,
        autoSaved,
      };
      draft = {
        meta,
        data,
        history: [createDraftVersion(data, {}, 1)],
      };
    } else {
      // Update existing draft
      const prevData = draft.data;
      const newVersion = draft.meta.version + 1;
      draft = {
        ...draft,
        data,
        meta: {
          ...draft.meta,
          name: name || draft.meta.name,
          updatedAt: now,
          lastSaved: now,
          version: newVersion,
          autoSaved,
        },
        history: [
          ...draft.history,
          createDraftVersion(data, prevData, newVersion),
        ],
      };
    }
    saveDraftToStorage(draft);
    setCurrentDraft(draft);
    setLastSaved(now);
    setSaving(false);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1500);
    loadDrafts();
  }, [currentDraft, projectId, userId, loadDrafts]);

  // Delete a draft
  const deleteDraft = useCallback((id: string) => {
    deleteDraftFromStorage(id);
    if (currentDraft?.meta.id === id) setCurrentDraft(null);
    loadDrafts();
  }, [currentDraft, loadDrafts]);

  // Export a draft
  const exportCurrentDraft = useCallback(() => {
    if (!currentDraft) return null;
    return exportDraft(currentDraft.meta.id);
  }, [currentDraft]);

  // Import a draft
  const importNewDraft = useCallback((raw: string) => {
    const ok = importDraft(raw);
    loadDrafts();
    return ok;
  }, [loadDrafts]);

  // Cleanup old drafts
  const cleanupDrafts = useCallback((maxAgeMs: number) => {
    cleanupOldDrafts(maxAgeMs);
    loadDrafts();
  }, [loadDrafts]);

  // Search drafts
  const search = useCallback((options: DraftSearchOptions) => {
    setDrafts(searchDrafts({ ...options, projectId, userId }));
  }, [projectId, userId]);

  // Auto-save effect
  useEffect(() => {
    if (!currentDraft) return;
    autoSaveTimer.current && clearInterval(autoSaveTimer.current);
    autoSaveTimer.current = setInterval(() => {
      saveDraft(currentDraft.data, currentDraft.meta.name, true);
    }, AUTO_SAVE_INTERVAL);
    return () => {
      autoSaveTimer.current && clearInterval(autoSaveTimer.current);
    };
  }, [currentDraft, saveDraft]);

  // Cross-tab sync
  useEffect(() => {
    const unsub = subscribeToDraftChanges(loadDrafts);
    return () => unsub();
  }, [loadDrafts]);

  // Initial load
  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  return {
    drafts,
    currentDraft,
    lastSaved,
    saving,
    saveIndicator,
    loadDraft,
    saveDraft,
    deleteDraft,
    exportCurrentDraft,
    importNewDraft,
    cleanupDrafts,
    search,
    compareDraftVersions,
  };
}
