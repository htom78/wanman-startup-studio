#!/bin/bash
set -e

echo "=== Harness Initialization ==="

echo "=== npm test ==="
npm test

echo "=== Verification Evidence ==="
echo "Record this command and result in progress.md before claiming done."

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Read feature_list.json to see current feature state"
echo "2. Pick one feature or stage-gate task"
echo "3. Keep wanman optional and validate through scripts"
echo "4. Re-run ./init.sh before claiming done"
