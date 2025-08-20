# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Jira Boost, a browser extension that enhances the Jira experience with features like standup mode, custom themes, dark mode, and card highlighting. Built using WXT framework (modern browser extension development framework) with React and TypeScript.

## Development Commands

### Core Development
- `pnpm dev` - Start development server for Chrome (default)
- `pnpm run dev:ff` - Start development server for Firefox
- `pnpm run dev:edge` - Start development server for Edge
- `pnpm build` - Build production bundle for Chrome (default)
- `pnpm run build:ff` - Build for Firefox
- `pnpm run build:edge` - Build for Edge
- `pnpm run clean` - Clean build directory

### Distribution
- `pnpm run zip:chrome` - Create Chrome extension zip
- `pnpm run zip:firefox` - Create Firefox extension zip

## Architecture

### Entry Points (WXT Framework)
- **Background Script**: `src/entrypoints/background/index.ts` - Handles omnibox integration and installation events
- **Popup**: `src/entrypoints/popup/` - Extension popup interface with React app
- **Options**: `src/entrypoints/options/` - Settings page with React app
- **Content Scripts**: `src/contents/` - Injected scripts for different Jira features

### Key Content Scripts
- `general.ts` - Custom background/theme injection for Jira pages
- `dark-mode.ts` - Dark mode implementation
- `card-highlighter.ts` - Card highlighting functionality
- `standup-btn.tsx` - Standup mode button integration

### Storage System
Central storage management via `src/storage/index.ts` using Plasmo Storage:
- **PersistLayer class** - Unified storage interface
- **StorageKey enum** - Type-safe storage keys
- **StorageValueRecord** - Type definitions for all stored values
- Supports watching for value changes across the extension

### Core Features
- **Custom Backgrounds**: Unsplash integration for Jira theming
- **Dark Mode**: Three modes (always/auto/disable)
- **Card Highlighting**: Visual enhancements for Jira cards
- **Standup Mode**: Enhanced view for daily standups
- **License Management**: LemonSqueezy integration for pro features

### Tech Stack
- **WXT**: Modern browser extension framework (replaces Plasmo)
- **React 18** with TypeScript
- **Tailwind CSS** with DaisyUI components
- **Plasmo Storage** for cross-extension state management
- **ahooks** for React utilities
- **cash-dom** for lightweight DOM manipulation

### Manifest Permissions
- Host permissions: `https://*.atlassian.net/jira*`
- Storage permission for cross-browser data persistence
- Omnibox keyword: "jira" for quick issue access

### Development Notes
- Uses pnpm as package manager
- Content scripts use `PageObserver` utility for dynamic page changes
- Extension auto-opens options page on first install
- Supports both Chrome and Firefox builds with different configurations