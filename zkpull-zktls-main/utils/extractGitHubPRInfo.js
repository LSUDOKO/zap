export function extractGitHubPRInfo(url) {
  const withoutPrefix = url.replace("https://github.com/", "");

  const parts = withoutPrefix.split("/");

  return {
    owner: parts[0],
    repo: parts[1],
    pull_number: parts[3],
  };
}
