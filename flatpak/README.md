# Flathub / Flatpak packaging

This folder contains everything needed to publish the **PIA** software on
[Flathub](https://flathub.org), as requested in
[issue #738](https://github.com/LINCnil/pia/issues/738).

| File                       | Purpose                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `fr.cnil.PIA.yml`          | Flatpak manifest (app-id `fr.cnil.PIA`)                            |
| `fr.cnil.PIA.metainfo.xml` | AppStream metadata (required by Flathub)                           |
| `fr.cnil.PIA.desktop`      | Desktop launcher entry                                             |
| `pia.sh`                   | Sandbox launcher (uses `zypak-wrapper` from the Electron base app) |

## How it works

The manifest does **not** rebuild the Angular/Electron app from scratch. Instead
it downloads the `pia-X.Y.Z.tar.gz` archive produced by `electron-builder`
(`tar.gz` target, see the `linux` section in `package.json`) from the matching
[GitHub Release](https://github.com/LINCnil/pia/releases) and integrates it into
the Flatpak sandbox. The manifest declares one source per architecture: that
archive for x86-64, and `pia-X.Y.Z-arm64.tar.gz` for ARM64 (aarch64).
Both archives include `fr.cnil.PIA.desktop`, `fr.cnil.PIA.metainfo.xml`,
`icon.png`, and `LICENSE` at the root of the application directory (under
`app/` after the manifest extracts the archive). The manifest installs these
files from the archive; older archives without them cannot be used.

## Validation in CI

A GitHub Actions workflow
([`.github/workflows/flatpak.yml`](../.github/workflows/flatpak.yml)) validates
the AppStream metainfo with `appstreamcli`. It runs on pull requests and on
pushes to `master` that change the metainfo, and can also be triggered manually
(`workflow_dispatch`).

The package itself is not built here: the manifest in this repository holds
`<VERSION>` and `<SHA256>` placeholders, and the real build runs on Flathub.

## Building / testing locally

```sh
# Install the required Flathub runtimes
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub org.freedesktop.Platform//26.08 org.freedesktop.Sdk//26.08 org.electronjs.Electron2.BaseApp//26.08

# Build & install the Flatpak (also available as `yarn electron:flatpak`)
flatpak-builder --user --install --force-clean build-dir flatpak/fr.cnil.PIA.yml

# Run it
flatpak run fr.cnil.PIA
```

## Releasing a new version

1. Add the matching `<release>` entry in `fr.cnil.PIA.metainfo.xml`.
2. Build both Linux archives with `yarn electron:linux:archives` after
   `yarn prod`. The Linux release workflow builds each architecture on a
   native runner.
3. Publish `pia-X.Y.Z.tar.gz` and `pia-X.Y.Z-arm64.tar.gz` on the GitHub Release.
4. In `fr.cnil.PIA.yml`, configure an archive source for each architecture,
   using `only-arches: [x86_64]` and `only-arches: [aarch64]`, and update each
   URL and SHA-256 (`sha256sum electron/releases/*.tar.gz`).
5. Submit/update the manifest on https://github.com/flathub/flathub.

Remove any temporary architecture restriction from `flathub.json` after both
archive sources are configured and tested.

## Permissions

Static permissions are kept to a minimum, as Flathub requires. There is no
`--filesystem` access: opening and saving files goes through the desktop portals.
