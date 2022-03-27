#!/bin/sh

# Install pre-requisites: Node.js, Yarn
# Node.js 10 is the latest version in Nodesource that supports
# Debian Jessie, which is what the C.H.I.P. comes with

# Trying to install Node.js 12 or 14 gives us the below error:
# nodejs : Depends: libstdc++6 (>= 5.2) but 4.9.2-10+deb8u2 is to be installed
curl -fsSL https://deb.nodesource.com/setup_10.x | sudo -E bash -

# build-essential is needed to build binary packages
# rsync is used for development
apt-get install -y nodejs build-essential rsync --force-yes
npm install --global yarn
