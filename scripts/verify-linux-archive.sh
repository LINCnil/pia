#!/usr/bin/env bash
set -euo pipefail

archive=$1
entries=$(tar -tzf "$archive")

for source in flatpak/fr.cnil.PIA.desktop flatpak/fr.cnil.PIA.metainfo.xml electron/icons/icon.png LICENSE; do
  name=${source##*/}
  path=$(printf '%s\n' "$entries" | awk -F / -v name="$name" 'NF == 2 && $2 == name { print }')
  if [[ -z "$path" || "$path" == *$'\n'* ]]; then
    echo "Expected exactly one top-level $name in $archive" >&2
    exit 1
  fi
  tar -xOzf "$archive" "$path" | cmp - "$source"
done
