#!/usr/bin/env bash
set -euo pipefail

npm run build
aws s3 sync dist/ s3://weather.astute.click --delete --profile personal
aws cloudfront create-invalidation --distribution-id EQ6IV2I4SAXV8 --paths "/*" --profile personal
