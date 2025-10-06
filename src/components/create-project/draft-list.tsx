import React, { useState } from "react";
import { DraftMeta } from "@/types/draft.types";

interface DraftListProps {
  drafts: DraftMeta[];
  onLoadDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  onPreviewDraft: (id: string) => void;
}

const DraftList: React.FC<DraftListProps> = ({ drafts, onLoadDraft, onDeleteDraft, onPreviewDraft }) => {
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = drafts.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="draft-list border rounded p-2 bg-gray-50 mt-2">
      <div className="flex items-center mb-2">
        <input
          className="input input-bordered w-full"
          placeholder="Search drafts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ul className="divide-y">
        {filtered.length === 0 && <li className="text-gray-400">No drafts found.</li>}
        {filtered.map((draft) => (
          <li key={draft.id} className="flex items-center justify-between py-2">
            <div>
              <span className="font-medium">{draft.name}</span>
              <span className="ml-2 text-xs text-gray-400">v{draft.version}</span>
              <span className="ml-2 text-xs text-gray-400">{new Date(draft.updatedAt).toLocaleString()}</span>
              {draft.autoSaved && <span className="ml-2 text-xs text-blue-400">(Auto)</span>}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-xs btn-outline" onClick={() => onLoadDraft(draft.id)}>Load</button>
              <button className="btn btn-xs btn-outline" onClick={() => onPreviewDraft(draft.id)}>Preview</button>
              <button
                className="btn btn-xs btn-error"
                onClick={() => setConfirmDelete(draft.id)}
              >
                Delete
              </button>
            </div>
            {confirmDelete === draft.id && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                <div className="bg-white p-4 rounded shadow">
                  <div className="mb-2">Delete draft "{draft.name}"?</div>
                  <div className="flex gap-2">
                    <button className="btn btn-error" onClick={() => { onDeleteDraft(draft.id); setConfirmDelete(null); }}>Confirm</button>
                    <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DraftList;
