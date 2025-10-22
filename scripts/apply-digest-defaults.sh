#!/usr/bin/env bash
set -euo pipefail

# Apply Digest v1 defaults globally via API
# Usage:
#   TOKEN=your-token API_BASE=http://localhost:3000/api/v1/agent DIGEST_PROFILE_ID=fast-cheap-default ./scripts/apply-digest-defaults.sh

API_BASE="${API_BASE:-http://localhost:3000/api/v1/agent}"
TOKEN="${TOKEN:-}"
DIGEST_PROFILE_ID="${DIGEST_PROFILE_ID:-fast-cheap-default}"

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: TOKEN is required. Export TOKEN=..." >&2
  exit 1
fi

echo "Applying Digest v1 defaults to $API_BASE/settings/digest ..."

curl -s -X PUT "$API_BASE/settings/digest" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(cat <<JSON
{
  "digestEnabled": true,
  "digestProfileId": "${DIGEST_PROFILE_ID}",
  "autoDigestEnabled": true,
  "digestMaxLength": 150,
  "customDigestPrompt": "Create an ultra-compact summary in {maxLength} chars max. Focus on concrete actions/results. Message: {content}"
}
JSON
)" | jq .

echo
echo "Verifying digest settings ..."

curl -s -X GET "$API_BASE/settings/digest" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "Done."