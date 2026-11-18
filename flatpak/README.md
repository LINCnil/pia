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
the Flatpak sandbox. The current manifest supports x86-64 only; the ARM64
archive must be published and added as a separate architecture-specific source
before building for aarch64.

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
flatpak install -y flathub org.freedesktop.Platform//26.08 org.freedesktop.Sdk//26.08 org.electronjs.Electron2.BaseApp//26.08

# Build & install the Flatpak (also available as `yarn electron:flatpak`)
flatpak-builder --user --install --force-clean build-dir flatpak/fr.cnil.PIA.yml

# Run it
flatpak run fr.cnil.PIA
```

## Releasing a new version

1. Build both Linux archives with `yarn electron:linux`. The Linux release
   workflow builds each architecture on a native runner.
2. Publish `pia-X.Y.Z.tar.gz` and `pia-X.Y.Z-arm64.tar.gz` on the GitHub Release.
3. In `fr.cnil.PIA.yml`, configure an archive source for each architecture,
   using `only-arches: [x86_64]` and `only-arches: [aarch64]`, and update each
   URL and SHA-256 (`sha256sum electron/releases/*.tar.gz`).
4. Add the matching `<release>` entry in `fr.cnil.PIA.metainfo.xml`.
5. Submit/update the manifest on https://github.com/flathub/flathub.

The PIA manifest uses files from the checkout so CI tests changes to them.
In the Flathub repository, fetch the desktop file, metadata, icon and
application license from an immutable PIA revision, with SHA-256 hashes.
Remove any temporary architecture restriction from `flathub.json` after both
archive sources are configured and tested.

## Permissions

Static permissions are kept to a minimum, as Flathub requires. There is no
`--filesystem` access: opening and saving files goes through the desktop portals.
