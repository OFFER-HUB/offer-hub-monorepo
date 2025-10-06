import React, { useMemo } from "react";
import { getDraftFromStorage } from "@/utils/draft-storage";
import { compareDraftVersions } from "@/utils/draft-versioning";

interface DraftPreviewProps {
  draftId: string;
  compareWith?: string;
  onClose: () => void;
}

const DraftPreview: React.FC<DraftPreviewProps> = ({ draftId, compareWith, onClose }) => {
  const draft = useMemo(() => getDraftFromStorage(draftId), [draftId]);
  const compareDraft = useMemo(() => (compareWith ? getDraftFromStorage(compareWith) : null), [compareWith]);

  if (!draft) return <div className="p-4">Draft not found.</div>;

  const lastVersion = draft.history[draft.history.length - 1];
  const compareVersion = compareDraft ? compareDraft.history[compareDraft.history.length - 1] : null;
  const changes = compareVersion ? compareDraftVersions(compareVersion, lastVersion) : lastVersion.changes;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
        <button className="absolute top-2 right-2 btn btn-xs" onClick={onClose}>Close</button>
        <div className="mb-2 font-semibold text-lg">Draft Preview: {draft.meta.name}</div>
        <div className="mb-2 text-xs text-gray-400">Last updated: {new Date(draft.meta.updatedAt).toLocaleString()}</div>
        <div className="mb-4">
          <div className="font-medium mb-1">Draft Data:</div>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(draft.data, null, 2)}</pre>
        </div>
        <div className="mb-4">
          <div className="font-medium mb-1">Version History:</div>
          <ul className="text-xs">
            {draft.history.map((v) => (
              <li key={v.version} className="mb-1">
                v{v.version} - {new Date(v.timestamp).toLocaleString()} ({v.changes.length} changes)
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium mb-1">{compareVersion ? "Changes compared to selected draft:" : "Latest Changes:"}</div>
          <ul className="text-xs">
            {changes.length === 0 && <li>No changes.</li>}
            {changes.map((c, i) => (
              <li key={i}>
                <span className="font-mono">{c.field}</span>: <span className="text-red-500">{String(c.oldValue)}</span> → <span className="text-green-600">{String(c.newValue)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DraftPreview;
