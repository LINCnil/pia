#!/usr/bin/env bash
set -ex

if [ -f ${NVM_DIR}/nvm.sh ]
then
    . ${NVM_DIR}/nvm.sh
else
    echo "NVM_DIR have to be set"
    exit 42
fi

# todo : add build option env variable
ng build

