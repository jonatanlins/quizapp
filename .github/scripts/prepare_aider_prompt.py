#!/usr/bin/env python3
import os

pr_num = os.environ.get("PR_NUM", "")
pr_title = os.environ.get("PR_TITLE", "")
pr_body = os.environ.get("PR_BODY", "")
comment_body = os.environ.get("COMMENT_BODY", "")
input_instructions = os.environ.get("INPUT_INSTRUCTIONS", "")
event_name = os.environ.get("EVENT_NAME", "")

if input_instructions and input_instructions.strip():
    prompt = f"""Task instructions:
{input_instructions}

Reference Pull Request #{pr_num}: {pr_title}
Description:
{pr_body}

Please inspect the codebase, implement the requested features or fixes, verify that tests and typechecks pass, and write clean, maintainable code."""

elif (event_name in ("issue_comment", "pull_request_review_comment")) and comment_body and comment_body.strip():
    prompt = f"""A reviewer left the following feedback on PR #{pr_num}:
{comment_body}

Pull Request #{pr_num} Title: {pr_title}
Description:
{pr_body}

Please address the reviewer feedback, modify the codebase accordingly, and ensure that all tests pass."""

else:
    prompt = f"""Solve and implement Pull Request #{pr_num}:
Title: {pr_title}

Description:
{pr_body}

Please inspect the repository, implement all requested changes and requirements, ensure that 'npm run typecheck && npm test' passes, and produce clean, well-tested code."""

with open("/tmp/aider_prompt.txt", "w", encoding="utf-8") as f:
    f.write(prompt)
