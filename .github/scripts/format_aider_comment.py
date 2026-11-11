#!/usr/bin/env python3
import os
import sys

status = sys.argv[1] if len(sys.argv) > 1 else "success"
pr_num = os.environ.get("PR_NUM", "")
selected_model = os.environ.get("SELECTED_MODEL", "")
commits_list = os.environ.get("COMMITS_LIST", "")

if status == "success":
    content = f"""### 🤖 Aider Solved PR #{pr_num}

Aider has implemented the requested changes for this PR.

**Model:** `{selected_model}`
**Verification:** `npm run typecheck && npm test` passed ✅

<details>
<summary><b>Commits applied:</b></summary>

```text
{commits_list}
```

</details>

Please review the updated code!"""

elif status == "no_changes":
    content = f"""### 🤖 Aider Notice for PR #{pr_num}

Aider evaluated this PR using `{selected_model}`, but no file changes were needed (type checks and test suites are already passing and requirements are satisfied)."""

elif status == "error":
    content = f"""### ⚠️ Aider Execution Notice for PR #{pr_num}

Aider attempted to solve this PR using `{selected_model}`, but encountered an issue or tests could not be resolved automatically.

Please check the GitHub Actions workflow run logs for full details and test failure outputs."""

else:
    content = f"Aider processed PR #{pr_num}."

output_file = f"/tmp/pr_comment_{pr_num}.md"
with open(output_file, "w", encoding="utf-8") as f:
    f.write(content)
