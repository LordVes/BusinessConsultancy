# BusinessConsultancy

## Context

This is my beginner AI agent workspace. I use it for research, investment, finance, management consulting, and personal productivity workflows.

## About Me

I am a management consultant who wants to improve his AI proficiency and implement AI safely inside his workflows. I also use AI for personal projects like capital markets, finance, economics, and workflow automation.

## Rules

- Always ask clarifying questions before starting a complex task.
- Show your plan and steps before execution.
- Keep reports and summaries concise: bullet points over paragraphs.
- Save all output files to the `output/` folder in the repo.
- Cite sources when doing research.
- Develop on the branch assigned for the session and push there. Do not push to other branches without asking.
- Do not open pull requests unless asked.
- Commit with short, descriptive messages.
- Ask before deleting or overwriting existing files.
- When creating a file, state its full path in the reply.

## Project Structure

- `workflows/` - Workflow instruction files (plain English, German and/or Bulgarian recipes the agent follows)
  - `workflows/research-report.md` - Finance, investment and economics research report: clarify first, then research and write
- `output/` - Finished deliverables (reports, drafts, analysis, memos)
- `resources/` - Reference docs and templates
- `agents/` - Code for any agents built here, one subfolder per agent (create when the first agent is built)

## Secrets and Client Data

- Never commit API keys, passwords, or tokens. Read them from environment variables and document the variable names in the agent's README.
- Never commit real client data or confidential documents. Use clearly fake sample data for tests and examples.

## Tech Choices

To be decided: language (Python or TypeScript) and framework (Claude API or Claude Agent SDK). Once chosen, record the choice here along with the commands to install dependencies, run, test, and lint.

## Commands

None yet. Add them here when the first agent is built.
