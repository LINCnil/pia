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

if [ -z "${BUILDENV}" ]
then
    BUILDENV="dev"
fi

if [ -z "${BUILDARG}" ]
then
    BUILDARG="--sourcemap"
fi

if [ "${BUILDENV}" = "prod" ]
   then
       BUILDARG="--prod --build-optimizer"
fi


# todo : add build option env variable
ng build ${BUILDARG}
