export interface JiraConfig {
  baseUrl: string;
  apiToken: string;
  maxResults?: number;
  timeout?: number;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  expand?: string;
  fields: JiraIssueFields;
  changelog?: JiraChangelog;
  transitions?: JiraTransition[];
  operations?: Record<string, any>;
  editmeta?: Record<string, any>;
  versionedRepresentations?: Record<string, any>;
  fieldsToInclude?: Record<string, any>;
}

export interface JiraIssueFields {
  summary: string;
  description?: string | null;
  status?: JiraStatus;
  priority?: JiraPriority;
  assignee?: JiraUser | null;
  reporter?: JiraUser;
  created?: string;
  updated?: string;
  resolved?: string | null;
  project?: JiraProject;
  issuetype?: JiraIssueType;
  labels?: string[];
  components?: JiraComponent[];
  fixVersions?: JiraVersion[];
  versions?: JiraVersion[];
  comment?: JiraCommentPage;
  [key: string]: any;
}

export interface JiraStatus {
  id: string;
  name: string;
  description?: string;
  statusCategory?: JiraStatusCategory;
  self: string;
}

export interface JiraStatusCategory {
  id: number;
  key: string;
  colorName: string;
  name: string;
}

export interface JiraPriority {
  id: string;
  name: string;
  iconUrl?: string;
  self: string;
}

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  active: boolean;
  avatarUrls?: JiraAvatarUrls;
  self: string;
  timeZone?: string;
  accountType?: string;
}

export interface JiraAvatarUrls {
  '16x16'?: string;
  '24x24'?: string;
  '32x32'?: string;
  '48x48'?: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey?: string;
  avatarUrls?: JiraAvatarUrls;
  self: string;
  simplified?: boolean;
  style?: string;
}

export interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  self: string;
  subtask?: boolean;
  hierarchyLevel?: number;
}

export interface JiraComponent {
  id: string;
  name: string;
  description?: string;
  self: string;
}

export interface JiraVersion {
  id: string;
  name: string;
  description?: string;
  archived?: boolean;
  released?: boolean;
  releaseDate?: string;
  self: string;
}

export interface JiraComment {
  id: string;
  author?: JiraUser;
  body?: string | JiraADFContent;
  created: string;
  updated: string;
  updateAuthor?: JiraUser;
  self: string;
  visibility?: {
    type: 'group' | 'role';
    value: string;
    identifier?: string;
  };
}

export interface JiraADFContent {
  type: string;
  version: number;
  content: any[];
}

export interface JiraCommentPage {
  startAt: number;
  maxResults: number;
  total: number;
  comments: JiraComment[];
}

export interface JiraTransition {
  id: string;
  name: string;
  to: JiraStatus;
  hasScreen?: boolean;
  isGlobal?: boolean;
  isInitial?: boolean;
  isAvailable?: boolean;
  isConditional?: boolean;
  isLooped?: boolean;
  fields?: Record<string, any>;
}

export interface JiraChangelog {
  startAt: number;
  maxResults: number;
  total: number;
  histories: JiraHistory[];
}

export interface JiraHistory {
  id: string;
  author: JiraUser;
  created: string;
  items: JiraHistoryItem[];
}

export interface JiraHistoryItem {
  field: string;
  fieldtype: string;
  from: string | null;
  fromString: string | null;
  to: string | null;
  toString: string | null;
}

export interface JiraSearchResults {
  expand?: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
  warningMessages?: string[];
  names?: Record<string, string>;
  schema?: Record<string, any>;
}


export interface JiraProjectPage {
  self?: string;
  nextPage?: string;
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: JiraProject[];
}

export interface JiraProjectDetails extends JiraProject {
  description?: string;
  lead?: JiraUser;
  components?: JiraComponent[];
  issueTypes?: JiraIssueType[];
  versions?: JiraVersion[];
  roles?: Record<string, string>;
  avatarUrls?: JiraAvatarUrls;
  projectCategory?: {
    id: string;
    name: string;
    description?: string;
    self: string;
  };
  insight?: any;
}

export interface JiraUserSearchResults {
  users?: JiraUser[];
  header?: string;
  total?: number;
}

export interface JiraErrorResponse {
  errorMessages?: string[];
  errors?: Record<string, string>;
  statusCode?: number;
}

// Field metadata types
export interface JiraField {
  id: string;
  key?: string;
  name: string;
  custom: boolean;
  orderable: boolean;
  navigable: boolean;
  searchable: boolean;
  clauseNames?: string[];
  schema?: JiraFieldSchema;
  untranslatedName?: string;
  scope?: {
    type: 'PROJECT' | 'TEMPLATE';
    project?: JiraProject;
  };
}

export interface JiraFieldSchema {
  type: string;
  items?: string;
  system?: string;
  custom?: string;
  customId?: number;
}

// Create metadata types
export interface CreateMetaIssueTypeBean {
  self: string;
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  avatarId?: number;
  subtask: boolean;
  expand?: string;
  fields?: Record<string, FieldMetaBean>;
}

export interface FieldMetaBean {
  required: boolean;
  schema: JiraFieldSchema;
  name: string;
  key: string;
  autoCompleteUrl?: string;
  hasDefaultValue?: boolean;
  operations?: string[];
  allowedValues?: any[];
  defaultValue?: any;
}

export interface CreateMetaIssueTypesResponse {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: CreateMetaIssueTypeBean[];
}

// Custom Fields Search types
export interface JiraCustomField {
  id: string;
  name: string;
  description?: string;
  type: string;
  searcherKey?: string;
}

export interface JiraCustomFieldsPage {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: JiraCustomField[];
}

export interface JiraEditMetaFieldSchema {
  type: string;
  items?: string;
  system?: string;
  custom?: string;
  customId?: number;
}

export interface JiraEditMetaField {
  required: boolean;
  schema: JiraEditMetaFieldSchema;
  name: string;
  fieldId: string;
  operations: string[];
  allowedValues?: any[];
  hasDefaultValue?: boolean;
  defaultValue?: any;
  autoCompleteUrl?: string;
}

export interface JiraIssueEditMeta {
  fields: Record<string, JiraEditMetaField>;
}