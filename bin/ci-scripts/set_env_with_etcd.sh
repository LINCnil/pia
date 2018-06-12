#!/usr/bin/env bash
set -ex

export ETCDCTL_API=3

# rand number to avoid build colision (same db used by two build)
if [ ! -f shuf.nbr ]
then
    shuf -i 200-600 -n 1 > shuf.nbr
fi

if [ -z "$Suffix" ]
   then
       #RND may contain branch with '-' or upper case char which may not work as database name for postgre
       Suffix=$(echo $RND|sed -e s/-/_/g|tr '[:upper:]' '[:lower:]')$(echo -n $(cat shuf.nbr ))
fi

if [ -z "$Prefix" ]
then
    Prefix="/pialab/build/$Suffix"
fi

if [ -z "$ETCDHOST" ]
then
    ETCDHOST="etcd.host"
fi
ETCDENDPOINT="--endpoints=http://${ETCDHOST}:2379"

if [ -z "$ETCDCTLCMD" ]
then
    ETCDCTLCMD="etcdctl"
fi

if [ -z "${APICLIENTID}" ]
then
    APICLIENTID=1234
    if [ -n "$ClientId" ]
    then
        APICLIENTID=$ClientId
    fi

fi

if [ -z "${APICLIENTSECRET}" ]
then
    APICLIENTSECRET=4321
    if [ -n "$ClientSecret" ]
    then
        APICLIENTSECRET=$ClientSecret
    fi

fi

if [ -z "${BACKURL}" ]
then
    BACKURL='http://localhost:8000'
    if [ -n "$BackUrl" ]
    then
        BACKURL=$BackUrl
    fi

fi


# todo add env management (prod and dev)

$ETCDCTLCMD put $Prefix/api/client/id ${APICLIENTID} $ETCDENDPOINT
$ETCDCTLCMD put $Prefix/api/client/secret ${APICLIENTSECRET} $ETCDENDPOINT
$ETCDCTLCMD put $Prefix/api/host/url ${BACKURL} $ETCDENDPOINT

confd -onetime -backend etcdv3 -node http://${ETCDHOST}:2379 -confdir ./etc/confd -log-level debug -prefix $Prefix
cat src/environments/environment.ts
