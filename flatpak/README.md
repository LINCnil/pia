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
the Flatpak sandbox.

## Building / testing in CI (no Linux needed)

Because `flatpak-builder` only runs on Linux, a GitHub Actions workflow
([`.github/workflows/flatpak.yml`](../.github/workflows/flatpak.yml)) builds and
validates the package on a Linux runner. It runs automatically on any change
under `flatpak/`, and can also be triggered manually (`workflow_dispatch`). It:

- lints the manifest and validates the AppStream metainfo, and
- builds a `fr.cnil.PIA.flatpak` bundle artifact (once a matching Release archive
  with a valid `url`/`sha256` is available).

This is the recommended way to verify the package when developing on macOS or
Windows.

## Building / testing locally

```sh
# Install the required Flathub runtimes
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub org.freedesktop.Platform//24.08 org.freedesktop.Sdk//24.08 org.electronjs.Electron2.BaseApp//24.08

# Build & install the Flatpak (also available as `yarn electron:flatpak`)
flatpak-builder --user --install --force-clean build-dir flatpak/fr.cnil.PIA.yml

# Run it
flatpak run fr.cnil.PIA
```

## Releasing a new version

1. `yarn electron:linux` to produce `electron/releases/pia-X.Y.Z.tar.gz`.
2. Publish the archive on the GitHub Release.
3. In `fr.cnil.PIA.yml`, update the archive `url` and its `sha256`
   (`sha256sum electron/releases/pia-X.Y.Z.tar.gz`).
4. Add the matching `<release>` entry in `fr.cnil.PIA.metainfo.xml`.
5. Submit/update the manifest on https://github.com/flathub/flathub.

See `../BUILD_LINUX.md` (section 6) for the full procedure.
