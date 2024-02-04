#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

KEY_FILE="$1"
GOOGLE_SHEETS_ID="$2"

if [ -z "$KEY_FILE" ] || [ -z "$GOOGLE_SHEETS_ID" ]; then
  cat <<'END'
Usage:   bash sysadmin/install.sh GOOGLE-CLOUD-KEY-FILE GOOGLE-SHEETS-ID
Example: bash sysadmin/install.sh ../some-project-1b3aac.json 1KViVywHr-VgBb7X2jAeSxuk7AbjgH07P2RPE_2mUxPE

See README.md for more details

END
  exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
  echo "The first argument, the Google Cloud key file $KEY_FILE does not exist."
  exit 1
fi

set -eux

bash "$DIR/install-prerequisites.sh"
cd "$DIR/.."

CONFIG_DIR="$DIR/../src/config"
CONFIG_FILE="$CONFIG_DIR/index.js"
rm -rf "$CONFIG_DIR"
mkdir -p "$CONFIG_DIR"

cp "$KEY_FILE" "$CONFIG_DIR/google-cloud-key.json"

# Suppress error warning us that expressions (`blah`) don't expand in
# single-quotes: this is intentional
#
# shellcheck disable=SC2016
echo 'module.exports = { googleCloudKeyFile: `${__dirname}/google-cloud-key.json`, googleSpreadsheetId: '"'$GOOGLE_SHEETS_ID'"' };' > "$CONFIG_FILE"

yarn install
yarn build
pm2 delete all || true
pm2 start dist/run.js

# Run every time on startup
pm2 save
pm2 startup
