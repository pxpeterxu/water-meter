#!/bin/sh

NODE_VERSION=20
PROCESSOR_ARCHITECTURE=$(uname --machine)

if [ "$PROCESSOR_ARCHITECTURE" = 'armv6l' ]; then
  # This means we're on a Raspberry Pi Zero. Unfortunately, official Node.js
  # builds no longer exist on ARMv6, which is used by Pi Zeros, so we follow
  # the instructions here to download it from unofficial-builds
  # https://hassancorrigan.com/blog/install-nodejs-on-a-raspberry-pi-zero/
  command -v jq &> /dev/null || apt-get install -y jq
  LATEST_VERSION=$(curl --silent 'https://unofficial-builds.nodejs.org/download/release/index.json' | jq -r '.[] | select(.version | startswith("v'"$NODE_VERSION"'.")) | .version' | head -n 1)

  INSTALLED_VERSION=$(command -v node &> /dev/null && node --version)

  if [[ "$INSTALLED_VERSION" =~ ^v$NODE_VERSION ]]; then
    echo 'Latest version of Node.js installed; skipping install'
  else
    echo 'Downloading and installing Node.js'
    wget "https://unofficial-builds.nodejs.org/download/release/$LATEST_VERSION/node-$LATEST_VERSION-linux-armv6l.tar.xz"
    tar -xf node-*.tar.xz
    cp -R node-*/* /usr/local
    rm -rf node-*
  fi
else
  # Install Node from nodesource based on https://github.com/nodesource/distributions/tree/69a4558#installation-instructions
  apt-get install -y ca-certificates curl gnupg
  mkdir -p /etc/apt/keyrings
  GPG_FILE_PATH="/etc/apt/keyrings/nodesource.gpg"
  if [ ! -f "$GPG_FILE_PATH" ]; then
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o "$GPG_FILE_PATH"
  fi

  NODE_SOURCE_PATH=/etc/apt/sources.list.d/nodesource.list

  NODE_SOURCE_CONTENTS="deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION.x nodistro main"
  if [ ! -f "$NODE_SOURCE_PATH" ] || ! grep -qF "$NODE_SOURCE_CONTENTS" "$NODE_SOURCE_PATH"; then
    echo "$NODE_SOURCE_CONTENTS" | tee "$NODE_SOURCE_PATH"
    apt-get update
  fi

  # build-essential is needed to build binary packages
  # rsync is used for development
  # pigpio is depended on by raspi-io > raspi-gpio > pigpio
  apt-get install -y nodejs build-essential rsync pigpio
fi

command -v yarn &> /dev/null || npm install --global yarn
command -v pm2 &> /dev/null || yarn global add pm2
