// The app is installed from Google Play, so Android never asks to allow "unknown apps" and
// updates arrive automatically. The same link works everywhere: on Android it opens the
// Play Store app; on a computer, Google Play's page can install it on the visitor's phone.
// (Old direct-APK links, /downloads/WebNestStudio-v*.apk, redirect here; see vercel.json.)
const PACKAGE_NAME = 'com.webneststudio.app'

export const ANDROID_APP = {
  name: 'WebNest Studio',
  packageName: PACKAGE_NAME,
  playStoreHref: `https://play.google.com/store/apps/details?id=${PACKAGE_NAME}`,
  minAndroid: 'Android 7.0',
}
