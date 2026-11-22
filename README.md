# Soil Acoustics research wiki

Read the [published wiki](https://ajdench.github.io/soil-acoustics-wiki/) or open the [comparison of six monitoring systems](https://ajdench.github.io/soil-acoustics-wiki/monitoring-systems/). The wiki reviews the Soil Acoustic Meter, its manufacturer’s website and field guide, and research on what underground sound can reveal about soil life.

## Content and publication

The reader articles are in `docs/`. Their evidence and the underlying concepts are in `knowledge/`. Start a maintenance session with [AGENTS.md](AGENTS.md). The public review links to the publisher’s original pages. Five screenshots supporting the review are retained in the local research archive.

GitHub Actions builds the published site from the main branch of the [public repository](https://github.com/ajdench/soil-acoustics-wiki). The public history starts with a source snapshot. The research text and third-party components have different reuse terms. See [the licensing record](LICENSING.md).

## Local service

The Standard Production manifest records the maintenance workspace’s canonical [local wiki](http://127.0.0.1:8036/). The qualified toolchain on that workstation is installed in the user cache. In a new shell, select it before running its managed-service commands.

```sh
export PATH="$HOME/Library/Caches/soil-acoustics-wiki/toolchain/bin:$PATH"
```

From this directory use `npm run service:status` to check the registered service and `npm run service:start` to start it. The per-user macOS LaunchAgent serves the built `site/` with `npm run serve:preview`. Rebuild after changing reader content. Use `npm run dev` for a live-reload Zensical session on a separate development port. `npm run service:preview` verifies the managed service before the local handoff.

## Build and verification

Install the versions in `.node-version`, `.python-version` and [DEPENDENCIES.md](DEPENDENCIES.md). Use `npm ci` and `uv sync --frozen` for the locked dependencies, then `npm run browser:install` for the qualified browsers. Use `npm run build` for a local render. Use `npm run verify` in the maintenance workspace or `DKBWS_PROVENANCE_MODE=distribution npm run verify` in a public Git checkout. See [DESIGN.md](DESIGN.md) for the visual contract.

To reproduce the published artifact, run the following command. Its output is in `output/pages/`.

```sh
PAGES_BASE_URL=https://ajdench.github.io/soil-acoustics-wiki/ npm run build:pages
```

From the local archive, `node scripts/export-public-source.mjs NEW_DIRECTORY [REVISION]` exports the tracked tree of one commit to a new directory, replaces the screenshot embeds with publisher links and omits Git metadata.
