// The signed APK is hosted as a GitHub Release asset, not in this repo, so each
// version doesn't add ~40 MB to git history. For a new release: on GitHub, create
// release `v<version>` and attach `WebNestStudio-v<version>.apk`, then update
// VERSION, FILE_SIZE_BYTES and sha256 below (from `aapt dump badging` and
// `Get-FileHash -Algorithm SHA256`). Older releases stay up, so shared links keep working.
const VERSION = '1.3'
const FILE_SIZE_BYTES = 41327563
const FILE_NAME = `WebNestStudio-v${VERSION}.apk`
const RELEASES = 'https://github.com/vansh187/WebNestStudio/releases'

export const ANDROID_APP = {
  name: 'WebNest Studio',
  version: VERSION,
  fileName: FILE_NAME,
  href: `${RELEASES}/download/v${VERSION}/${FILE_NAME}`,
  // Decimal megabytes, the unit Android's download manager and Files app show.
  size: `${(FILE_SIZE_BYTES / 1e6).toFixed(1)} MB`,
  minAndroid: 'Android 7.0',
  packageName: 'com.webneststudio.app',
  sha256: '896C3DCC4F84236976F2D055FECD0B2DCCE5CDA44C43777E291195E7D4AC6E11',
}

export function isAndroidDevice() {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
}
