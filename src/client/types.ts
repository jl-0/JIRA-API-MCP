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

export interface JiraSearchAndReconcileResults {
  isLast: boolean;
  nextPageToken?: string;
  issues: JiraIssue[];
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