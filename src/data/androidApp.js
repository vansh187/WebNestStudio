// The Android app is distributed as a signed APK from public/downloads. For a new
// release: drop the new APK in that folder, update VERSION, FILE_SIZE_BYTES and
// sha256 below (from `aapt dump badging` and `Get-FileHash -Algorithm SHA256`),
// then delete the old APK and add a vercel.json redirect from its old URL to
// /download-app so shared links keep working.
//
// To host the APK outside the repo (e.g. as a GitHub Release asset), point `href`
// at its full URL; nothing else needs to change.
const VERSION = '1.3'
const FILE_SIZE_BYTES = 41327563
const FILE_NAME = `WebNestStudio-v${VERSION}.apk`

export const ANDROID_APP = {
  name: 'WebNest Studio',
  version: VERSION,
  fileName: FILE_NAME,
  href: `/downloads/${FILE_NAME}`,
  // Decimal megabytes, the unit Android's download manager and Files app show.
  size: `${(FILE_SIZE_BYTES / 1e6).toFixed(1)} MB`,
  minAndroid: 'Android 7.0',
  packageName: 'com.webneststudio.app',
  sha256: '896C3DCC4F84236976F2D055FECD0B2DCCE5CDA44C43777E291195E7D4AC6E11',
}

export function isAndroidDevice() {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
}
