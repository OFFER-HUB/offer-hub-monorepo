import React, { useState } from "react";
import { useProjectDrafts } from "@/hooks/use-project-drafts";
import { DraftMeta, DraftData } from "@/types/draft.types";
import DraftList from "./draft-list";
import DraftPreview from "./draft-preview";

interface DraftManagerProps {
  projectId: string;
  userId?: string;
  initialData: DraftData;
}

const DraftManager: React.FC<DraftManagerProps> = ({ projectId, userId, initialData }) => {
  const {
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
  } = useProjectDrafts(projectId, userId);

  const [showList, setShowList] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDraftId, setPreviewDraftId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // UI Handlers
  const handleManualSave = () => saveDraft(initialData);
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const ok = importNewDraft(reader.result);
        setImportError(ok ? null : "Import failed: Invalid draft file");
      }
    };
    reader.readAsText(file);
  };
  const handleExport = () => {
    const data = exportCurrentDraft();
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `draft-${projectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="draft-manager border rounded p-4 bg-white shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-lg">Draft Management</span>
        <div className="flex gap-2">
          <button onClick={handleManualSave} className="btn btn-primary">Save Draft</button>
          <button onClick={() => setShowList((v) => !v)} className="btn btn-secondary">{showList ? "Hide" : "Show"} Drafts</button>
          <button onClick={handleExport} className="btn btn-secondary">Export</button>
          <label className="btn btn-secondary cursor-pointer">
            Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-2">
        {saveIndicator && <span className="text-green-600">Draft saved!</span>}
        {saving && <span className="text-gray-500">Saving...</span>}
        {lastSaved && (
          <span className="text-xs text-gray-400">Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
        )}
        {importError && <span className="text-red-500">{importError}</span>}
      </div>
      {showList && (
        <DraftList
          drafts={drafts}
          onLoadDraft={loadDraft}
          onDeleteDraft={deleteDraft}
          onPreviewDraft={(id) => {
            setPreviewDraftId(id);
            setShowPreview(true);
          }}
        />
      )}
      {showPreview && previewDraftId && (
        <DraftPreview
          draftId={previewDraftId}
          onClose={() => setShowPreview(false)}
          compareWith={currentDraft?.meta.id}
        />
      )}
    </div>
  );
};

export default DraftManager;
