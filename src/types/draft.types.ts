// Types for the Intelligent Draft Management System

export interface DraftMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  lastSaved: number;
  version: number;
  projectId?: string;
  userId?: string;
  autoSaved?: boolean;
}

export interface DraftData {
  // The actual project data being drafted
  [key: string]: any;
}

export interface ProjectDraft {
  meta: DraftMeta;
  data: DraftData;
  history: DraftVersion[];
}

export interface DraftVersion {
  version: number;
  timestamp: number;
  changes: DraftChange[];
  data: DraftData;
}

export interface DraftChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface DraftSearchOptions {
  query?: string;
  projectId?: string;
  userId?: string;
  autoSaved?: boolean;
}

export interface DraftExport {
  meta: DraftMeta;
  data: DraftData;
  history: DraftVersion[];
}
