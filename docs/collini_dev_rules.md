# Collini Industrial Suite - Agent Development Rules

This document outlines specific rules and preferences for AI agents working on this project.

## Testing Procedures
- **Browser Testing**: The USER performs all browser-based testing and validation.
- **Agent Role**: Do NOT automatically initiate browser subagent tasks for testing purposes. 
- **Exception**: The agent may only perform browser testing if it finds it absolutely necessary for debugging a complex issue, and MUST ask for the USER's permission before doing so.

## Code Standards
- Maintain premium industrial aesthetics (glassmorphism, dark mode).
- Ensure all new features are mobile-responsive and support touch-friendly interactions (e.g., drag-to-select).

## Command System
- **/save**: When the user types `/save`, the agent must update `docs/project_status.md` and `docs/collini_dev_rules.md` with the latest session changes, milestones, and context.
- **/load**: When the user types `/load`, the agent must read `docs/project_status.md` and `docs/collini_dev_rules.md` to immediately sync its context with the current project state and development rules.
