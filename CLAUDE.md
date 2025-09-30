# Claude Assistant Instructions for JIRA MCP Server

This document provides specific instructions for Claude when working with the JIRA MCP Server codebase. It supplements the main documentation by focusing on development workflows and best practices.

## 📚 Essential Documentation

Before making any changes, familiarize yourself with:

- **[README.md](./README.md)** - Complete project overview, features, installation, and usage
- **[docs/MCP_TOOL_DOCUMENTATION.md](./docs/MCP_TOOL_DOCUMENTATION.md)** - Detailed tool specifications with examples
- **[docs/INSPECTOR_GUIDE.md](./docs/INSPECTOR_GUIDE.md)** - Testing with MCP Inspector
- **[docs/SCRIPTS_REFERENCE.md](./docs/SCRIPTS_REFERENCE.md)** - NPM scripts quick reference
- **[docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)** - Technical implementation details

## 🎯 Core Responsibilities

### 1. Documentation Sync

When making changes, **ALWAYS** update the relevant documentation:

- **README.md** - Update when:
  - Adding/modifying features or tools
  - Changing configuration or environment variables
  - Modifying installation or setup procedures

- **docs/MCP_TOOL_DOCUMENTATION.md** - Update when:
  - Tool parameters change
  - Response formats are modified
  - New error cases are added

- **docs/** folder - Update specialized docs when their areas change

### 2. Testing Workflow

After any code changes:

```bash
# 1. Run tests to capture responses
npm run test:direct

# 2. Generate updated documentation
npm run test:generate-docs

# 3. Verify all tests pass
npm test

# 4. Check code quality
npm run lint
npm run format

# 5. Build to ensure compilation
npm run build
```

### 3. Project Architecture

Refer to [README.md#architecture](./README.md#architecture) for the complete project structure.

Key locations:
- **Tools**: `src/tools/*.ts` - Tool implementations
- **Client**: `src/client/JiraClient.ts` - JIRA API wrapper
- **Types**: `src/client/types.ts` - TypeScript interfaces
- **Tests**: `src/__tests__/*.ts` - Test files

## 🚀 Development Workflows

### Adding a New Tool

1. Implement in `src/tools/[category].ts`
2. Add types to `src/client/types.ts`
3. Register in `src/server.ts`
4. Add tests to `src/__tests__/tools-direct.test.ts`
5. Update documentation:
   - README.md (Features and Available Tools sections)
   - docs/MCP_TOOL_DOCUMENTATION.md (full specifications)

### Modifying Existing Tools

1. Update the implementation
2. Update or add tests
3. Run `npm run test:direct` to capture new responses
4. Update affected documentation
5. Verify TypeScript types match responses

### Adding Configuration

1. Add to `.env.example` with description
2. Update README.md Configuration section
3. Implement in code with validation
4. Document default values

## ✅ Code Standards

### Consistent Response Format

Success:
```typescript
{
  success: true,
  data: { /* tool-specific data */ }
}
```

Error:
```typescript
{
  success: false,
  error: "Clear error message"
}
```

### API Compatibility

- Use JIRA API v2 endpoints (`/rest/api/2/`)
- Bearer token authentication for Server/Data Center
- See [README.md#configuration](./README.md#configuration) for auth details

## 🔍 Quick Reference

### Essential Commands

```bash
npm run dev          # Development mode
npm run inspect      # MCP Inspector
npm test            # Run all tests
npm run lint        # Check code style
npm run build       # Compile TypeScript
```

See [docs/SCRIPTS_REFERENCE.md](./docs/SCRIPTS_REFERENCE.md) for complete list.

### Documentation Locations

| Topic | Location |
|-------|----------|
| Project Overview | [README.md](./README.md) |
| Tool Specifications | [docs/MCP_TOOL_DOCUMENTATION.md](./docs/MCP_TOOL_DOCUMENTATION.md) |
| Testing Guide | [docs/INSPECTOR_GUIDE.md](./docs/INSPECTOR_GUIDE.md) |
| NPM Scripts | [docs/SCRIPTS_REFERENCE.md](./docs/SCRIPTS_REFERENCE.md) |
| Technical Details | [docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) |
| Test Results | `__tool_response_logs__/` |

## 📝 Commit Guidelines

1. Test all changes thoroughly
2. Update all affected documentation
3. Ensure `npm run build` passes
4. Verify `npm run lint` passes
5. Write clear commit messages describing:
   - What changed
   - Why it changed
   - Any breaking changes

## ⚠️ Important Reminders

- Never remove existing tools without checking dependencies
- Maintain backward compatibility when possible
- Document breaking changes prominently
- Test with actual JIRA instance before releases
- Keep TypeScript types synchronized with API responses

## 🔗 External Resources

- [JIRA REST API v2 Docs](https://developer.atlassian.com/cloud/jira/platform/rest/v2/)
- [MCP SDK Documentation](https://modelcontextprotocol.io/docs)
- [Project Issues](https://github.com/jl-0/JIRA-API-MCP/issues)

---

**Remember:** This document focuses on development workflows. For feature documentation, API details, and usage instructions, always refer to the main [README.md](./README.md) and docs folder.