"use client";

import React, { useEffect, useState } from "react";
import { useSecurityMonitoring } from "@/hooks/use-security-monitoring";
import {
  IncidentResponse,
  IncidentSeverity,
  IncidentStatus,
} from "@/types/security.types";
import { PlusCircle, CheckCircle, XCircle, Clock } from "lucide-react";

const severityOptions: IncidentSeverity[] = [
  IncidentSeverity.LOW,
  IncidentSeverity.MEDIUM,
  IncidentSeverity.HIGH,
  IncidentSeverity.CRITICAL,
];

const statusOptions: IncidentStatus[] = [
  IncidentStatus.OPEN,
  IncidentStatus.INVESTIGATING,
  IncidentStatus.IN_PROGRESS,
  IncidentStatus.RESOLVED,
  IncidentStatus.CLOSED,
];

const IncidentResponsePanel: React.FC = () => {
  const { incidents, loadIncidents, createIncident, updateIncident } =
    useSecurityMonitoring();

  const [selectedIncident, setSelectedIncident] =
    useState<IncidentResponse | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: IncidentSeverity.MEDIUM,
    assignedTo: "",
    tags: "",
  });

  const [timelineNote, setTimelineNote] = useState("");

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  const submitCreate = async () => {
    try {
      const newIncident = await createIncident({
        title: form.title,
        description: form.description,
        severity: form.severity,
        status: IncidentStatus.OPEN,
        assignedTo: form.assignedTo || undefined,
        affectedUsers: [],
        actions: [],
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      });

      setSelectedIncident(newIncident);
      setForm({
        title: "",
        description: "",
        severity: IncidentSeverity.MEDIUM,
        assignedTo: "",
        tags: "",
      });
      closeCreate();
    } catch (err) {
      console.error("Failed to create incident", err);
    }
  };

  const changeStatus = async (status: IncidentStatus) => {
    if (!selectedIncident) return;
    try {
      const updated = await updateIncident(selectedIncident.id, { status });
      setSelectedIncident(updated);
    } catch (err) {
      console.error("Failed to change status", err);
    }
  };

  const addTimelineNote = async () => {
    if (!selectedIncident || !timelineNote) return;
    const event = {
      id: `evt-${Date.now()}`,
      timestamp: new Date(),
      action: "note",
      description: timelineNote,
      performedBy: "system",
    };

    try {
      const updated = await updateIncident(selectedIncident.id, {
        timeline: [...(selectedIncident.timeline || []), event],
      });
      setSelectedIncident(updated);
      setTimelineNote("");
    } catch (err) {
      console.error("Failed to add timeline note", err);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Incident Response
          </h2>
          <p className="text-gray-600 mt-1">
            Manage incidents, workflows and response actions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={openCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Incident
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Incidents
          </h3>
          <div className="space-y-3">
            {incidents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No incidents found.
              </div>
            )}

            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-3 rounded-md cursor-pointer border ${
                  selectedIncident?.id === inc.id
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{inc.title}</div>
                    <div className="text-sm text-gray-600">
                      {inc.assignedTo || "Unassigned"}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    {new Date(inc.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {inc.severity}
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {inc.status}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {inc.tags?.slice(0, 3).join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
          {selectedIncident ? (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedIncident.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedIncident.description}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedIncident.status}
                    onChange={(e) =>
                      changeStatus(e.target.value as IncidentStatus)
                    }
                    className="border rounded-md p-2"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => changeStatus(IncidentStatus.RESOLVED)}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Timeline
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-auto">
                    {selectedIncident.timeline &&
                    selectedIncident.timeline.length > 0 ? (
                      selectedIncident.timeline
                        .slice()
                        .reverse()
                        .map((t) => (
                          <div key={t.id} className="p-3 border rounded-md">
                            <div className="flex items-center justify-between text-sm text-gray-700">
                              <div className="font-medium">{t.action}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(t.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {t.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              By: {t.performedBy}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-sm text-gray-500">
                        No timeline events yet.
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <textarea
                      value={timelineNote}
                      onChange={(e) => setTimelineNote(e.target.value)}
                      rows={3}
                      className="w-full border rounded-md p-2"
                      placeholder="Add a timeline note..."
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={addTimelineNote}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Details & Actions
                  </h4>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-700">
                      Severity: <strong>{selectedIncident.severity}</strong>
                    </div>
                    <div className="text-sm text-gray-700">
                      Status: <strong>{selectedIncident.status}</strong>
                    </div>
                    <div className="text-sm text-gray-700">
                      Assigned To:{" "}
                      <strong>{selectedIncident.assignedTo || "-"}</strong>
                    </div>
                    <div className="text-sm text-gray-700">
                      Affected Users:{" "}
                      <strong>
                        {selectedIncident.affectedUsers?.length || 0}
                      </strong>
                    </div>
                    <div className="text-sm text-gray-700">
                      Tags:{" "}
                      <strong>
                        {selectedIncident.tags?.join(", ") || "-"}
                      </strong>
                    </div>

                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() =>
                          changeStatus(IncidentStatus.INVESTIGATING)
                        }
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Mark Investigating
                      </button>

                      <button
                        onClick={() => changeStatus(IncidentStatus.IN_PROGRESS)}
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Start Work
                      </button>

                      <button
                        onClick={() => changeStatus(IncidentStatus.CLOSED)}
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Close Incident
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <div className="text-lg">Select an incident to view details</div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create Incident
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm((s) => ({ ...s, title: e.target.value }))
                }
                className="border rounded-md p-2"
              />

              <textarea
                placeholder="Description"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                className="border rounded-md p-2"
              />

              <div className="flex gap-2">
                <select
                  value={form.severity}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      severity: e.target.value as IncidentSeverity,
                    }))
                  }
                  className="border rounded-md p-2"
                >
                  {severityOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Assign to (user id or email)"
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, assignedTo: e.target.value }))
                  }
                  className="border rounded-md p-2 flex-1"
                />
              </div>

              <input
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={(e) =>
                  setForm((s) => ({ ...s, tags: e.target.value }))
                }
                className="border rounded-md p-2"
              />

              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={closeCreate}
                  className="px-4 py-2 rounded-md border"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCreate}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentResponsePanel;
