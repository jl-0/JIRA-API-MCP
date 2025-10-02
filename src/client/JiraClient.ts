import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  JiraConfig,
  JiraIssue,
  JiraSearchResults,
  JiraCommentPage,
  JiraTransition,
  JiraProject,
  JiraProjectDetails,
  JiraProjectPage,
  JiraUser,
  JiraErrorResponse,
  JiraField,
  CreateMetaIssueTypeBean,
  CreateMetaIssueTypesResponse,
  JiraIssueEditMeta
} from './types.js';

export class JiraClient {
  private client: AxiosInstance;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;

    const baseURL = config.baseUrl.endsWith('/')
      ? config.baseUrl.slice(0, -1)
      : config.baseUrl;

    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiToken}`,
        'X-Atlassian-Token': 'no-check'
      }
    });

    this.client.interceptors.response.use(
      response => response,
      this.handleError
    );
  }

  private handleError = (error: AxiosError): Promise<never> => {
    if (error.response) {
      const errorData = error.response.data as JiraErrorResponse;
      const message = errorData.errorMessages?.join(', ') ||
                      Object.entries(errorData.errors || {})
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ') ||
                      `JIRA API Error: ${error.response.status}`;

      throw new Error(message);
    } else if (error.request) {
      throw new Error('No response from JIRA server');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  };

  // Issue Methods

  async searchIssues(jql: string, options?: {
    startAt?: number;
    maxResults?: number;
    fields?: string[];
    expand?: string[];
    properties?: string[];
    validateQuery?: boolean;
  }): Promise<JiraSearchResults> {
    // Default to common fields if none specified to reduce response size
    const defaultFields = [
      'summary', 'status', 'priority', 'assignee', 'reporter',
      'created', 'updated', 'issuetype', 'project', 'labels', 'components'
    ];

    const response = await this.client.get<JiraSearchResults>('/rest/api/2/search', {
      params: {
        jql,
        startAt: options?.startAt || 0,
        maxResults: options?.maxResults || this.config.maxResults || 50,
        fields: options?.fields?.join(',') || defaultFields.join(','),
        expand: options?.expand?.join(','),
        properties: options?.properties?.join(','),
        validateQuery: options?.validateQuery
      }
    });
    return response.data;
  }


  async getIssue(issueIdOrKey: string, options?: {
    fields?: string[];
    expand?: string[];
    properties?: string[];
    updateHistory?: boolean;
  }): Promise<JiraIssue> {
    // Default to common fields if none specified to reduce response size
    const defaultFields = [
      'summary', 'status', 'priority', 'assignee', 'reporter',
      'created', 'updated', 'description', 'issuetype', 'project',
      'resolution', 'resolutiondate', 'duedate', 'labels',
      'components', 'fixVersions', 'versions'
    ];

    const response = await this.client.get<JiraIssue>(`/rest/api/2/issue/${issueIdOrKey}`, {
      params: {
        fields: options?.fields?.join(',') || defaultFields.join(','),
        expand: options?.expand?.join(','),
        properties: options?.properties?.join(','),
        updateHistory: options?.updateHistory
      }
    });
    return response.data;
  }

  async getIssueComments(issueIdOrKey: string, options?: {
    startAt?: number;
    maxResults?: number;
    orderBy?: string;
    expand?: string;
  }): Promise<JiraCommentPage> {
    const response = await this.client.get<JiraCommentPage>(
      `/rest/api/2/issue/${issueIdOrKey}/comment`,
      {
        params: {
          startAt: options?.startAt || 0,
          maxResults: options?.maxResults || this.config.maxResults || 50,
          orderBy: options?.orderBy,
          expand: options?.expand
        }
      }
    );
    return response.data;
  }

  async getIssueTransitions(issueIdOrKey: string, options?: {
    transitionId?: string;
    skipRemoteOnlyCondition?: boolean;
    includeUnavailableTransitions?: boolean;
    expand?: string;
  }): Promise<{ transitions: JiraTransition[] }> {
    const response = await this.client.get<{ transitions: JiraTransition[] }>(
      `/rest/api/2/issue/${issueIdOrKey}/transitions`,
      {
        params: {
          transitionId: options?.transitionId,
          skipRemoteOnlyCondition: options?.skipRemoteOnlyCondition,
          includeUnavailableTransitions: options?.includeUnavailableTransitions,
          expand: options?.expand
        }
      }
    );
    return response.data;
  }

  // Project Methods

  async getAllProjects(options?: {
    expand?: string[];
    recent?: number;
  }): Promise<JiraProject[]> {
    const response = await this.client.get<JiraProject[]>('/rest/api/2/project', {
      params: {
        expand: options?.expand?.join(','),
        recent: options?.recent
      }
    });
    return response.data;
  }

  async getProject(projectIdOrKey: string, options?: {
    expand?: string[];
  }): Promise<JiraProjectDetails> {
    const response = await this.client.get<JiraProjectDetails>(
      `/rest/api/2/project/${projectIdOrKey}`,
      {
        params: {
          expand: options?.expand?.join(',')
        }
      }
    );
    return response.data;
  }

  async searchProjects(options?: {
    startAt?: number;
    maxResults?: number;
    orderBy?: string;
    query?: string;
    typeKey?: string;
    categoryId?: number;
    action?: 'view' | 'browse' | 'edit';
    expand?: string;
    status?: string[];
  }): Promise<JiraProjectPage> {
    const response = await this.client.get<JiraProjectPage>('/rest/api/2/project/search', {
      params: {
        startAt: options?.startAt || 0,
        maxResults: options?.maxResults || this.config.maxResults || 50,
        orderBy: options?.orderBy || 'key',
        query: options?.query,
        typeKey: options?.typeKey,
        categoryId: options?.categoryId,
        action: options?.action || 'browse',
        expand: options?.expand,
        status: options?.status?.join(',')
      }
    });
    return response.data;
  }

  // User Methods

  async getCurrentUser(options?: {
    expand?: string;
  }): Promise<JiraUser> {
    const response = await this.client.get<JiraUser>('/rest/api/2/myself', {
      params: {
        expand: options?.expand
      }
    });
    return response.data;
  }

  async searchUsers(options?: {
    query?: string;
    username?: string;
    accountId?: string;
    startAt?: number;
    maxResults?: number;
    property?: string;
  }): Promise<JiraUser[]> {
    const response = await this.client.get<JiraUser[]>('/rest/api/2/user/search', {
      params: {
        query: options?.query,
        username: options?.username,
        accountId: options?.accountId,
        startAt: options?.startAt || 0,
        maxResults: options?.maxResults || this.config.maxResults || 50,
        property: options?.property
      }
    });
    return response.data;
  }

  async getUser(accountId: string, options?: {
    expand?: string;
  }): Promise<JiraUser> {
    const response = await this.client.get<JiraUser>('/rest/api/2/user', {
      params: {
        accountId,
        expand: options?.expand
      }
    });
    return response.data;
  }

  // Field Methods

  async getAllFields(): Promise<JiraField[]> {
    const response = await this.client.get<JiraField[]>('/rest/api/2/field');
    return response.data;
  }

  async getIssueTypesForProject(projectIdOrKey: string, options?: {
    startAt?: number;
    maxResults?: number;
  }): Promise<CreateMetaIssueTypesResponse> {
    const response = await this.client.get<CreateMetaIssueTypesResponse>(
      `/rest/api/2/issue/createmeta/${projectIdOrKey}/issuetypes`,
      {
        params: {
          startAt: options?.startAt || 0,
          maxResults: options?.maxResults || this.config.maxResults || 50
        }
      }
    );
    return response.data;
  }

  async getIssueTypeFields(
    projectIdOrKey: string,
    issueTypeId: string,
    options?: {
      startAt?: number;
      maxResults?: number;
    }
  ): Promise<CreateMetaIssueTypeBean> {
    const response = await this.client.get<CreateMetaIssueTypeBean>(
      `/rest/api/2/issue/createmeta/${projectIdOrKey}/issuetypes/${issueTypeId}`,
      {
        params: {
          startAt: options?.startAt || 0,
          maxResults: options?.maxResults || this.config.maxResults || 50
        }
      }
    );
    return response.data;
  }

  async getIssueEditMeta(issueIdOrKey: string): Promise<JiraIssueEditMeta> {
    const response = await this.client.get<JiraIssueEditMeta>(
      `/rest/api/2/issue/${issueIdOrKey}/editmeta`
    );
    return response.data;
  }
}