package com.anubhavx10tion.codes

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "NextUP"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // Shares arrive as ACTION_SEND before React is running (cold start) or while it is
  // (onNewIntent). Rewriting them into a nextup://import VIEW intent lets JS read both
  // through Linking.getInitialURL() / 'url' events, the same path the iOS share extension uses.
  override fun onCreate(savedInstanceState: Bundle?) {
    intent = toImportIntent(intent)
    super.onCreate(savedInstanceState)
  }

  override fun onNewIntent(intent: Intent) {
    val importIntent = toImportIntent(intent)
    setIntent(importIntent)
    super.onNewIntent(importIntent)
  }

  private fun toImportIntent(intent: Intent): Intent {
    if (intent.action != Intent.ACTION_SEND || intent.type?.startsWith("text/") != true) {
      return intent
    }
    val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT) ?: return intent
    return Intent(Intent.ACTION_VIEW, Uri.parse("nextup://import?url=" + Uri.encode(sharedText)))
  }
}
