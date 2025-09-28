Reviewer: automated assistant
Date: 2025-09-27

Context:
The error handler in a fetch promise was setting state even when the component was unmounted. That triggers "state update on unmounted component" warnings. The guard is inverted and should bail early when not mounted.

Suggested change (flip the guard):

```diff
 .catch((err) => {
   if (err.name === 'AbortError') return;
   if (!mounted) return;
   setRequests([]);
 })
```

Explanation:
- When the component has unmounted, `mounted` is false. We should _not_ attempt any state updates in that case; we should return early from the error handler. The original code attempted to call `setRequests([])` when `mounted` was false which will lead to React warning about updating state on an unmounted component.
- The fixed order returns early when `mounted` is false and only calls `setRequests` if the component is still mounted.

Optional extra:
- If you want to be even safer, check `err?.name` in a safe way (e.g., `if ((err as any)?.name === 'AbortError') return;`) and consider logging unexpected errors before swallowing them.

Acceptance criteria for this comment:
- The code in the source should be updated to the suggested diff to eliminate the warning.