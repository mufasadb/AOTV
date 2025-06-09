# CLAUDE.md - Claude Code Instructions for Project Loot & Craft

## Critical Development Guidelines 

⚠️ **IMPORTANT**: Before starting any task, Claude Code must:
1. **Review GDD.md** to understand the core game design, mechanics, and vision
2. **Review LOOT_SYSTEM_TODO.md** for current development priorities and detailed task requirements
3. **Review IMPLEMENTATION-NOTES.md** for technical details, architecture decisions, and codebase specifics
4. **Align all work** with the project's design principles
5. **Confirm request is complete before considering complete** unless explicitly asked to turn the server off, ensure the dev server is running, and that it returns a response on localhost:5173 and that it has an expected response before considering something "complete" 
6. **Stay on task** Resist implementing code that strays from the given task. Don't leave TODO's for behaviour to do with this feature to implement later, implement things to completion
7. **Use TDD** write tests to confirm behaviour both functional and actual user experience to confirm functionality works as intended. For each task, write a test to confirm its working, but also keep a list of required end to end testing to the main expected behaviour that's run before returning work to the user
8. **Update IMPLEMENTATION-NOTES.md** whenever you discover new technical patterns, make architectural decisions, or implement significant features that future development should be aware of

## Key Reference Documents

📚 **Required Reading Before Any Task:**
- **GDD.md**: Complete game design document outlining mechanics, systems, and vision
- **LOOT_SYSTEM_TODO.md**: Current development roadmap focusing on loot system enhancements (PP.md phases completed)
- **IMPLEMENTATION-NOTES.md**: Technical implementation details, architecture, and codebase structure

## Development Workflow

### Before Starting Work
1. Read the task requirements carefully
2. Review relevant sections of GDD.md and LOOT_SYSTEM_TODO.md
3. Check IMPLEMENTATION-NOTES.md for existing patterns and architecture
4. Plan your approach using TDD methodology

### During Development
1. Write tests first for new functionality
2. Implement features to completion - no partial implementations
3. Ensure all tests pass before considering work complete
4. Keep the dev server running and verify changes at localhost:5173
5. Update IMPLEMENTATION-NOTES.md with any new patterns or significant changes

### After Completing Work
1. Run all tests to ensure nothing is broken
2. Verify the feature works as expected in the browser
3. Update IMPLEMENTATION-NOTES.md if you've added new systems or patterns
4. Confirm the dev server is still running and responsive

## Testing Requirements

- **Write tests FIRST** before implementing features
- **Test both functionality AND user experience**
- **Maintain a checklist** of end-to-end tests for main behaviors
- **Run all tests** before declaring any task complete
- **Reference IMPLEMENTATION-NOTES.md** for testing patterns and strategies

## Important Reminders
- ALWAYS prefer editing an existing file to creating a new one
- ALWAYS check IMPLEMENTATION-NOTES.md before implementing new patterns or systems
- ALWAYS update IMPLEMENTATION-NOTES.md when adding significant new functionality