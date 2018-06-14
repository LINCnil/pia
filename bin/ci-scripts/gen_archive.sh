#!/usr/bin/env bash
set -ex

if [ -z ${Name} ]
then
    Name=Pialab-front
fi

if [ -z ${Branch} ]
then
    Branch=$(git name-rev  --name-only $(git rev-parse HEAD) | sed -e s/\\^.*//g | awk -F'/' '{print $(NF)}')
fi

# Clean current git dir
#git clean -df
#git checkout -- .

Filename=${Name}_${Branch}.tar.gz

rm -f ${Filename}

rm -rf \
   *.log \
   *.nbr \
   *.dist

cp src/environments/environment.* .

cat > build-metadata.json <<- EOF
{
  "branch": "$Branch",
  "commit": "$(git rev-parse HEAD)",
  "date": "$(date +"%Y%m%d%H%M%S")",
}
EOF

tar --exclude-vcs \
    --exclude=build \
    --exclude=bin/git-scripts \
    --exclude=etc \
    --transform s/dist/public/g \
    -czhf ${Filename} build-metadata.json apache.example.conf environment.* ./dist

sha256sum ${Filename} > ${Filename}.sha256.txt
