# JIRA MCP Server - Project Overview

## 🎯 Purpose

This project provides a Model Context Protocol (MCP) server that enables AI assistants (like Claude) to interact with JIRA instances through a standardized interface, providing read-only access to issues, projects, and user data.

## 📁 Key Files & Documentation

### Core Documentation
- **[README.md](./README.md)** - Main project documentation with usage, features, and architecture
- **[CLAUDE.md](./CLAUDE.md)** - Instructions for AI assistants maintaining this codebase
- **[MCP_TOOL_DOCUMENTATION.md](./MCP_TOOL_DOCUMENTATION.md)** - Complete API reference for all tools

### Development Guides
- **[INSPECTOR_GUIDE.md](./INSPECTOR_GUIDE.md)** - How to use MCP Inspector for interactive testing
- **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - Testing approach and coverage details
- **[SCRIPTS_REFERENCE.md](./SCRIPTS_REFERENCE.md)** - Quick reference for all NPM scripts

### Configuration
- **[.env.example](./.env.example)** - Environment variable template
- **[package.json](./package.json)** - Project configuration and dependencies
- **[tsconfig.json](./tsconfig.json)** - TypeScript compiler configuration
- **[jest.config.js](./jest.config.js)** - Jest testing configuration

## 🏗️ Architecture Summary

```
MCP Client (Claude)
    ↓
MCP Server (this project)
    ↓
Tool Handlers (issues.ts, projects.ts, users.ts)
    ↓
JIRA Client (JiraClient.ts)
    ↓
JIRA REST API
```

## 🚀 Quick Start

1. **Setup Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your JIRA credentials
   ```

2. **Install & Build:**
   ```bash
   npm install
   npm run build
   ```

3. **Test Interactively:**
   ```bash
   npm run inspect
   # Opens browser at http://localhost:6274
   ```

4. **Run Tests:**
   ```bash
   npm test
   ```

## 🛠️ Available Tools

### Issues
- `jira_search_issues` - Search with JQL
- `jira_get_issue` - Get issue details
- `jira_get_issue_comments` - Get comments
- `jira_get_issue_transitions` - Get workflow transitions

### Projects
- `jira_list_projects` - List all projects
- `jira_get_project` - Get project details
- `jira_search_projects` - Search projects

### Users
- `jira_get_current_user` - Get authenticated user
- `jira_search_users` - Search users

## 📊 Testing Strategy

1. **Unit Tests** - Test individual functions
2. **Integration Tests** - Test tool handlers with JIRA API
3. **Inspector Testing** - Manual interactive testing
4. **Response Logging** - Capture actual API responses for documentation

## 🔧 Development Workflow

1. **Make Changes** to source code
2. **Test with Inspector**: `npm run inspect`
3. **Run Tests**: `npm test`
4. **Update Documentation** per CLAUDE.md guidelines
5. **Lint & Format**: `npm run lint && npm run format`
6. **Build**: `npm run build`
7. **Commit** with clear message

## 📈 Project Status

### Implemented ✅
- All read-only JIRA operations
- Comprehensive test suite
- MCP Inspector integration
- Full TypeScript support
- Detailed documentation

### Future Enhancements 🚀
- Write operations (create/update issues)
- Webhook support
- Attachment handling
- Sprint/board operations
- Service desk integration

## 🤝 Contributing

See [Contributing section in README](./README.md#contributing) and follow guidelines in [CLAUDE.md](./CLAUDE.md).

## 📝 License

MIT - See [LICENSE](./LICENSE) file

## 🔗 Resources

- [JIRA REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v2/)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Project Repository](https://github.com/jl-0/JIRA-API-MCP)
- [NPM Package](https://www.npmjs.com/package/@jl-0/jira-mcp-server)

---

*This project demonstrates best practices for building MCP servers with comprehensive testing, documentation, and developer experience.*