#!/usr/bin/env bash
set -euo pipefail

npm run build
aws s3 sync dist/ s3://weather.astute.click --delete --profile personal

# sw.js and index.html must not be cached — browsers need the latest SW
# and HTML to pick up new hashed asset filenames after deploys
aws s3 cp s3://weather.astute.click/sw.js s3://weather.astute.click/sw.js \
  --metadata-directive REPLACE \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/javascript" \
  --profile personal
aws s3 cp s3://weather.astute.click/index.html s3://weather.astute.click/index.html \
  --metadata-directive REPLACE \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html" \
  --profile personal

aws cloudfront create-invalidation --distribution-id EQ6IV2I4SAXV8 --paths "/*" --profile personal
