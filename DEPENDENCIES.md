# Dependency Contract

This repository implements `standard-production` of the DenchCo Knowledge Base Wiki Standard at `b781907eea212c4ddcbd64183997d0982d4caf40`.

| Class | Required for | Exact dependency or boundary |
|---|---|---|
| Universal | Reading and editing | UTF-8 Markdown, YAML frontmatter, Git-compatible files |
| Validation | Declared conformance | Node 24.22.3, npm 11.19.1, Python 3.12.16 and uv 0.13.8, with exact locked packages |
| Human Wiki | Rendering | Zensical 0.1.1 |
| Graph | Relationship views | graphifyy 0.9.106, Mermaid 11.17.2, vis-network 10.1.2 and 3d-force-graph 1.80.0 |
| Browser proof | Rendered verification | Playwright 1.63.0 with matching Chromium and WebKit browsers |
| Provenance | Maintenance workspace | Git and a colocated Jujutsu working copy for local provenance; a distribution checkout uses Git evidence |
| Managed local preview | Persistent canonical Wiki URL | macos-launchd, a user-scoped shared register, and `service-identity-v1` marker health |
| Deployment | Public wiki | GitHub Pages through GitHub Actions, publishing the main branch of the public source repository |
| Verification artifacts | Complete profile evaluation | `output/verification/receipt.json` conforming to verification-receipt v1 and paired `output/verification/conformance-report.json` |
| Standard proposals | Optional reusable-change handoff | Existing Node, schema validator, and YAML dependencies for the thin local CLI; browser/network access only for an explicitly requested governed-form open or upstream registry comparison |

The public site build renders a separate copy under the GitHub project URL and includes the software licence notices. Its website review references the publisher’s pages. The maintenance workspace serves the original captures on its registered loopback endpoint. See the [public wiki](https://ajdench.github.io/soil-acoustics-wiki/) and [deployment workflow](https://github.com/ajdench/soil-acoustics-wiki/actions).

Commit exact lock files for every selected implementation dependency. Record optional and deployment dependencies separately from portable knowledge requirements.

When Graphify indexing is selected, adapt the pinned guarded indexing wrapper, its input-boundary fixtures and package commands with the exact lock. Preserve its rejection of unsupported preprocessed Fortran input and corpus symlinks and its runtime preprocessing guard. Direct indexing commands bypass that qualification; a dependency pin alone does not establish safe extraction of arbitrary untrusted input.

When Node supports the selected implementation, adapt the release's exact `.node-version`, exact `package.json` engine, npm `engine-strict` policy, and exact CI version together. A minimum range such as `>=24` does not prove that a later short-lived release remains supported or qualified.

For a Standard Production maintenance workspace, adapt a repository-local end-of-development-turn command from the pinned Standard release. It must run complete applicable verification, inspect Git and Jujutsu state, record every file-changing turn in a JJ commit before the final response, disclose failed or unrun required checks, and create no empty commit for a no-change turn. The boundary must not depend on whether an agent considers the work “substantive.”

The complete verification command must emit the schema-valid receipt and build its paired schema-valid conformance report. A project-only verification summary may be useful, but it must use another path and must not occupy either reserved artifact path.

When proposal integration is selected, adapt the pinned record and registry schemas, versioned governed form, proposal core/CLI, fixtures, and tests as one dependency closure. The thin package wrapper is `standard:proposal`, and `npm run check` invokes `standard:proposal -- check --all` to validate every tracked `standard-proposals/` record offline. `prepare` may write only disposable `output/standard-proposals/` previews, and `open` performs fail-closed GET checks plus a browser open. No command submits an issue, uploads a file, records a Standard decision, publishes a release, changes the consumer pin, or claims adoption automatically. The Standard-maintained registry is read-only consumer input and is never instantiated as consumer authority.

When `DKBWS-LINK-002` applies, adapt the pinned source-link checker, its fixtures, visible citation styling, and a built-output browser journey from a configured reader page to the manifest-mapped source-register row. Keep any rewrite command explicit and optional; routine checks and upgrade plans remain read-only. Citation-free and subject-empty targets record the conditional requirement as not applicable instead of creating evidence.

When `DKBWS-HUMAN-004` applies, map one canonical governing-question source and a bounded reader-source set in the manifest. Adapt the pinned source checker and fixtures so every exact reader-facing repetition uses the governed `DKBWS-HUMAN-002` callout, then capture every discovered repetition route at desktop and mobile widths. Preserve paraphrases, ordinary quotations, and historical/source records outside the bounded reader set as neutral content. Subject-empty targets omit the mapping and record the conditional requirement as not applicable instead of inventing a question.

When a persistent local preview is selected, adapt the pinned managed-service wrapper and fixtures. Reserve a project-unique service ID and conflict-free loopback endpoint in one serialized transaction that reloads the shared register, checks a live exclusive bind, and atomically replaces the complete register. Publish the exact static identity marker, record its health path, and require registry ownership, adapter installation, adapter load, and marker identity for status. A temporary alternate-port server may prove baseline HTTP rendering, but it does not prove the managed service or authorize killing another listener. Browser handoff uses the registered canonical URL.

Standard-maintainer documentation synchronization (`sync:documentation:*` and `verify:workspace`) is not part of a normal consumer dependency closure. Do not copy those commands or their sibling-repository contract unless this consumer separately declares, implements, and verifies its own documentation-synchronization capability.

The `DKBWS-DESIGN-002` reference header requires both Chromium and WebKit binaries matched to the exact Playwright lock. Install both engines locally and their operating-system libraries in CI. Include the header source/negative fixtures and `check:header-browser` in the complete verification command. A single-engine pass cannot establish the complete header requirement.
