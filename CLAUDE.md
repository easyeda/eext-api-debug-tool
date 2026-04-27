# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EDA extension for 嘉立创EDA (EasyEDA Pro) providing an API debug tool and code editor. The extension opens an iframe-based editor with Ace Editor, EDA SDK autocomplete, and AI chat integration.

**Extension ID**: `7ca98ae04b7142599ab107e34acc8e5e`

## Development Commands

```bash
# Development workflow
npm run dev              # Pre-build API completions + full build
npm run compile          # TypeScript → JavaScript via esbuild only
npm run build            # Compile + package for distribution

# Code quality
npm run fix              # Run prettier + eslint with auto-fix
npm run prettier:all     # Format all files
npm run eslint:all       # Lint with fixes
```

**Important**: Always run `npm run dev` (not just `compile`) when EDA API types change, as it regenerates `iframe/script/eda_coder/EDA_Codes.js` from `@jlceda/pro-api-types`.

## Architecture

### Two-Layer Design

1. **Host Extension** (`src/index.ts`)
   - TypeScript compiled to `dist/index.js` (IIFE format)
   - Exports `activate()` and `openScriptTool()` functions
   - Uses EDA API (`eda.sys_*`) to open iframe at 1200×700px
   - Registered in `extension.json` across all EDA contexts (home, sch, pcb, symbol, footprint, panel, blank, pcbview)

2. **Iframe Editor** (`iframe/main/index.html`)
   - Static HTML + vanilla JavaScript (no bundler)
   - Embeds Ace Editor with custom configuration
   - Communicates with host via injected `eda` global object
   - Persists state in IndexedDB (projects/files) and EDA extension storage (config)

### Communication Pattern

- **Host → Iframe**: Opens iframe via `eda.sys_IFrame.openIFrame()` with dimensions and options
- **Iframe → Host**: Calls `eda.sys_*` APIs (Storage, Dialog, Message, I18n)
- **Iframe → Preview**: Injects EDA bridge script to expose parent `eda` object to HTML preview content

### Key Modules (`iframe/script/User_config/`)

- `ACE_Config.js` — Editor initialization, theme switching (Monokai/GitHub), font size control
- `Project_Manager.js` — IndexedDB project/file CRUD operations
- `FileTree_UI.js` — File tree rendering and navigation
- `Code_Config.js` — Code execution (eval), import/export (JSZip), save/load
- `HTML_Renderer.js` — HTML preview rendering with EDA bridge injection
- `Project_Completer.js` — File-based code completion
- `Ai_Chat.js` — AI chat assistant integration
- `Left_Nav_Panel.js` — Navigation panel (All Projects, Project Design, Common Code)
- `Keyboard_Config.js` — Keyboard shortcuts
- `Menu_Config.js` — Right-click context menus
- `Completer_Store.js` — Custom completion storage

## Build Pipeline

### API Completion Generation (`build.cjs`)

**Critical pre-build step** that generates `iframe/script/eda_coder/EDA_Codes.js`:

1. Reads `node_modules/@jlceda/pro-api-types/index.d.ts`
2. Parses TypeScript declarations (classes, enums, methods, JSDoc)
3. Generates completion entries with:
   - Method paths (e.g., `eda.dmt_Board.getBoard`)
   - Descriptions, parameters, returns, remarks
   - Enum members with type info
   - Suffix detection (原理图 for `sch_*`, PCB for `pcb_*`)
4. Incrementally merges with existing entries
5. Outputs as `edcode = [...]` global variable (782KB)

**When to regenerate**: After updating `@jlceda/pro-api-types` or modifying `build.cjs` parsing logic.

### esbuild Configuration

- **Common** (`config/esbuild.common.ts`): IIFE format, browser platform, tree-shaking, single entry (`src/index`)
- **Production** (`config/esbuild.prod.ts`): Wraps common config, supports `--watch` flag
- **Output**: `dist/index.js` (single bundle, no code splitting)

## State Persistence

### IndexedDB (Projects/Files)

- Database: `EDA_Projects`
- Managed by `Project_Manager.js`
- Stores nested project/file structure
- Auto-save on editor change (1s debounce)

### EDA Extension Storage (Config)

- API: `eda.sys_Storage.getExtensionUserConfig()` / `setExtensionUserConfig()`
- Stores: theme, editor content, font size, AI chat history
- Persists across sessions

## Theme System

- Two CSS files: `iframe/style/body-dark.css` / `body-light.css`
- Toggled via `disabled` attribute on `<link>` tags
- Ace editor theme: `ace/theme/monokai` (dark) or `ace/theme/github` (light)
- Stored in `eda.sys_Storage.getExtensionUserConfig('theme')`

## Code Execution

- Uses `eval()` for JavaScript execution (trusted environment only)
- HTML preview via iframe with injected EDA bridge script
- Bridge exposes parent `eda` object to preview content for API access

## i18n

- Uses `eda.sys_I18n.text()` API for translations
- Supports Chinese (zh-CN) and English
- No separate i18n files; translations managed by EDA platform

## Important Constraints

### CSP (Content Security Policy)

- Ace Editor workers disabled (`useWorker: false`) to comply with EDA CSP
- No inline scripts in iframe HTML
- All scripts loaded via `<script src="..."></script>`

### EDA Platform Integration

- Extension must export `activate()` function
- Menu actions reference exported functions (e.g., `openScriptTool`)
- All UI interactions via `eda.sys_*` APIs (no direct DOM manipulation of host)

### File Structure

- **Do not move** `iframe/script/eda_coder/EDA_Codes.js` — referenced by absolute path in `index.html`
- **Do not rename** `iframe/main/index.html` — entry point for iframe
- **Do not modify** `extension.json` UUID — breaks extension identity

## Testing

No automated tests currently. Manual testing workflow:

1. Run `npm run dev` to build
2. Load extension in EDA via "Extensions → Load Local Extension"
3. Open tool via menu: "Tools → EasyEDA Debug Tool"
4. Test editor, file tree, code execution, HTML preview, AI chat

## Common Tasks

### Adding New EDA API Completions

1. Update `@jlceda/pro-api-types` dependency
2. Run `npm run dev` (not just `compile`)
3. Verify `iframe/script/eda_coder/EDA_Codes.js` updated

### Modifying Editor Behavior

- Edit `iframe/script/User_config/ACE_Config.js` for editor settings
- Edit `iframe/script/User_config/Keyboard_Config.js` for shortcuts
- Edit `iframe/script/User_config/Menu_Config.js` for context menus

### Adding New UI Modules

1. Create new `.js` file in `iframe/script/User_config/`
2. Add `<script src="..."></script>` to `iframe/main/index.html`
3. Expose API via global object or module pattern

### Debugging

- Use browser DevTools on iframe (right-click iframe → Inspect)
- Check `eda.sys_Message.error()` calls for error reporting
- Verify IndexedDB state in DevTools → Application → IndexedDB → EDA_Projects
