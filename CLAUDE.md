# BusinessConsultancy

A project for building AI agents that support a business consultancy.

## Status

Early stage. The repo was empty when this file was created. Update this file as the project takes shape.

## Project layout

- Keep each agent in its own folder (for example `agents/<agent-name>/`) with its code, prompts, and a README.
- Put shared helpers in a separate folder (for example `shared/`).
- Put client-facing documents and templates in `docs/`.

## Working rules

- Develop on the branch assigned for the session and push there. Do not push to other branches without asking.
- Do not open pull requests unless asked.
- Commit with short, descriptive messages.
- Ask before deleting or overwriting existing files.
- When creating a file, state its full path in the reply.

## Secrets and client data

- Never commit API keys, passwords, or tokens. Read them from environment variables and document the variable names in the agent's README.
- Never commit real client data or confidential documents. Use clearly fake sample data for tests and examples.

## Tech choices

To be decided: language (Python or TypeScript) and framework (Claude API or Claude Agent SDK). Once chosen, record the choice here along with the commands to install dependencies, run, test, and lint.

## Commands

None yet. Add them here when the first agent is built.
