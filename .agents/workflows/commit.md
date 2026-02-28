---
description: Summarize the current chat and commit the changes to git
---

1. Review the recent chat history and summarize the key tasks and changes that have been implemented during the current session.
2. Ensure that the change log (e.g., `docs/change-logs/<date>.md`) and any task lists are updated with the latest progress.
3. Formulate a comprehensive, descriptive commit message summarizing these changes. The commit message should follow the Conventional Commits specification (e.g., `feat: ...`, `fix: ...`, `refactor: ...`). 

// turbo-all
4. Run `git status` to verify what has been modified.
5. Run `git add .` to stage all the modified files.
6. Run `git commit -m "<your_generated_commit_message>"` to create the commit.
7. Run `git push` to push the changes to the remote repository branch.
