# Docker Performance & Size Audit Report

This audit identifies the key bottlenecks in your current Docker setup that contribute to large image sizes and slow build times.

---

## 1. Container Size Issues

| Service | Current Size | Target Size | Primary Bloat Cause |
| :--- | :--- | :--- | :--- |
| `backend` | **1.41 GB** | ~350 MB | Full `node_modules` including `devDependencies` |
| `frontend` | **916 MB** | ~250 MB | Full `node_modules` including `devDependencies` |

### Critical Findings:
*   **`devDependencies` Leakage**: Tools like `typescript`, `eslint`, and `tailwindcss` are present in the production images. 
*   **Dockerfile Logic Conflict**: The Dockerfiles use Next.js "standalone" mode (which is good) but then manually restore the full `node_modules` folder (1GB+), completely negating the size benefits of the standalone build. This was likely done to fix broken pnpm symlinks.

---

## 2. Build Time Bottlenecks

### Issue A: Cache Invalidation on Source Changes
*   **The Problem**: Every time you change a single line of code, the Docker build re-runs:
    1.  `pnpm run generate` (~3-5 seconds)
    2.  `pnpm run build` (~60-90 seconds)
*   **The Cause**: The `COPY . .` command occurs before these steps, meaning any file change in the entire repository invalidates the cache for all subsequent steps.

### Issue B: Inefficient Dependency Management
*   **Persistent Downloads**: The builds do not use Docker BuildKit's cache mounts. If you change a dependency in `package.json`, pnpm may have to re-download or re-link everything from scratch rather than leveraging a local store cache.
*   **Monorepo Overhead**: The `deps` stage copies package files for all services, creating a large layer that is frequently invalidated.

### Issue C: Redundant Asset Generation
*   **Asset Syncing**: The `generate` script (brand assets, etc.) is run globally. Changes to a frontend component currently trigger a backend asset regeneration, which is unnecessary.

---

## 3. Summary of Issues

| Category | Issue | Impact |
| :--- | :--- | :--- |
| **Size** | `devDependencies` in production | Massive images, slow deployments, high storage costs. |
| **Time** | Lack of incremental builds | 2-3 minutes wait for even the smallest code changes. |
| **Caching** | Poorly ordered `COPY` commands | Cache is invalidated too early in the build process. |

---

## Recommendations for Future Improvement
1.  **Fix the Symlink Issue properly**: Use `pnpm deploy` or prune `node_modules` instead of copying the full development folder.
2.  **Layered Source Copying**: Copy only the necessary package and source files for each stage to maximize cache hits.
3.  **Implement BuildKit Cache Mounts**: Persist the `pnpm` store across builds to speed up dependency installation.
