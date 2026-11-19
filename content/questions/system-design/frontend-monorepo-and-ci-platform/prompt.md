Your organisation has **30 front-end teams**, **12 deployable web apps**, about **150 internal packages** (design
system, data clients, utilities, feature libraries) and **400 engineers** contributing. Code lives in a mix of about 60
repositories; shared packages are published to a private registry and every upgrade is a cross-repo chore. Many apps
are two or three majors behind on the shared libraries.

Leadership has decided to consolidate into a **front-end monorepo**. You are asked to design the **repository, build,
test and CI/CD platform**:

- Workspace structure, package boundaries and dependency rules.
- Build orchestration, caching and "only build what changed".
- CI pipeline design with a target of **under 15 minutes p90** from push to green for a typical PR.
- Release and deployment of apps and of the few packages still published externally.
- Ownership, code review and governance at 400 contributors.
- The migration plan from 60 repositories.

Compare tooling options (Nx, Turborepo, Bazel, Rush, plain pnpm workspaces) and justify your choices.
