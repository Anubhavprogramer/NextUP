package com.anubhavx10tion.nextup

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * "Share → NextUP" target. A translucent activity that renders the NextUPShare
 * React root as a bottom sheet over the app the user shared from (Instagram),
 * saves the picked title, and finishes itself — the full app is never opened.
 * It runs in NextUP's process, so it shares DataManager/AsyncStorage with the app.
 */
class ShareActivity : ReactActivity() {

  override fun getMainComponentName(): String = "NextUPShare"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {
        override fun getLaunchOptions(): Bundle =
            Bundle().apply { putString("sharedText", sharedText(intent)) }
      }

  // No slide-in/out: the sheet animates itself over the caller.
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    overridePendingTransition(0, 0)
  }

  override fun finish() {
    super.finish()
    overridePendingTransition(0, 0)
  }

  private fun sharedText(intent: Intent?): String =
      if (intent?.action == Intent.ACTION_SEND) intent.getStringExtra(Intent.EXTRA_TEXT) ?: "" else ""
}
