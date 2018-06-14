#!/usr/bin/env bash
set -ex

if [ -f ${NVM_DIR}/nvm.sh ]
then
    set +x
    . ${NVM_DIR}/nvm.sh
    set -x
else
    echo "NVM_DIR have to be set"
    exit 42
fi

nvm --version
npm --version
node --version

npm install --no-interaction
