# Workflow: Finance, Investment and Economics Research Report

Purpose: the user gives a finance, investment or economics topic. Claude clarifies the brief, researches, organizes the findings, and produces a clean, structured summary and report.

Template: `resources/report-template.md`
Output: `output/YYYY-MM-DD-topic-slug.md`

## Steps

1. **Intake**
   - The user gives a topic.

2. **Clarify (mandatory, before any search)**
   - Ask short, grouped questions and wait for the answers. Do not search before they are answered.
   - Scope: the exact question, geography, asset class or sector, time horizon, what is in and out of scope.
   - Audience: who reads it (self, client, executive) and their expertise level.
   - Context: the decision it supports, existing views or documents, deadline.
   - Format: depth (short summary or full report), language, preferred or excluded sources.

3. **Plan**
   - Show a short research plan: questions to answer, source types, report outline.
   - Wait for the user's approval before researching.

4. **Research**
   - Use web search.
   - Prefer primary sources (central banks, regulators, company filings, statistics offices, IMF, OECD, World Bank) over commentary.
   - Log every source with title, publisher, date, and link.

5. **Organize**
   - Group findings by theme.
   - Separate facts, estimates, and opinion.
   - Note conflicting sources and gaps.

6. **Write**
   - Fill in `resources/report-template.md`.
   - Bullets over paragraphs. Cite every claim. Date all data.
   - Always end with the "Key takeaways and recommended next steps" section, in both the short summary and the full report.

7. **Quality check**
   - All clarified questions are answered.
   - Every claim has a source.
   - Numbers are dated and consistent.
   - Uncertainties and stale data are flagged.
   - Length matches the requested depth.
   - The closing section with key takeaways and recommended next steps is present.

8. **Save and publish**
   - Save to `output/YYYY-MM-DD-topic-slug.md` and state the full path.
   - Commit and push to the session branch.

## Guardrails

- Never start searching before the user answers the clarifying questions.
- Flag uncertainty. Do not present estimates as facts.
- No personalized investment advice. Keep the disclaimer in the report footer.
- No confidential client data in outputs or examples.
