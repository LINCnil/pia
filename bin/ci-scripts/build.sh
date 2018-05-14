#!/usr/bin/env bash
set -ex

if []
then
    . ${NVM_DIR}/nvm.sh
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
       BUILDARG="--sourcemap --prod --build-optimizer"
fi


# todo : add build option env variable
ng build "${BUILDARG}"

