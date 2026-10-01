"""Small, read-only adapter for GitHub change intelligence."""

import json
import os
import re
import ssl
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

import certifi


REPOSITORY_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")


class GitHubAdapterError(Exception):
    """A user-safe error returned by the GitHub integration."""


def latest_commits(repository: str, limit: int = 5) -> dict:
    """Return a compact, read-only commit feed for one repository."""
    if not REPOSITORY_PATTERN.fullmatch(repository or ""):
        raise GitHubAdapterError("Use a repository in the format owner/repository.")

    safe_repository = quote(repository, safe="/")
    url = f"https://api.github.com/repos/{safe_repository}/commits?per_page={min(max(limit, 1), 10)}"
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "devops-copilot-live-adapter"
    }
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        with urlopen(
            Request(url, headers=headers),
            timeout=8,
            context=ssl.create_default_context(cafile=certifi.where())
        ) as response:
            payload = json.loads(response.read().decode("utf-8"))
            remaining = response.headers.get("X-RateLimit-Remaining")
    except HTTPError as error:
        if error.code == 404:
            raise GitHubAdapterError("Repository not found, or a token is required for this private repository.") from error
        if error.code in {403, 429}:
            raise GitHubAdapterError("GitHub rate limit reached. Add GITHUB_TOKEN to the backend and try again.") from error
        raise GitHubAdapterError(f"GitHub returned an unexpected response ({error.code}).") from error
    except URLError as error:
        raise GitHubAdapterError("GitHub could not be reached. Check the backend network connection and try again.") from error

    commits = []
    for item in payload:
        commit = item.get("commit", {})
        author = commit.get("author") or {}
        commits.append({
            "sha": item.get("sha", "")[:7],
            "message": (commit.get("message") or "No commit message").split("\n", 1)[0],
            "author": author.get("name") or item.get("author", {}).get("login") or "Unknown author",
            "committed_at": author.get("date"),
            "url": item.get("html_url")
        })

    return {
        "repository": repository,
        "commits": commits,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "source": "GitHub REST API",
        "authenticated": bool(token),
        "rate_limit_remaining": int(remaining) if remaining and remaining.isdigit() else None
    }
