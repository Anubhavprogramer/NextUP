package com.anubhavx10tion.codes

import android.content.Intent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

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

  /**
   * Handle share intent when app is opened via share
   */
  override fun onCreate(savedInstanceState: android.os.Bundle?) {
    super.onCreate(savedInstanceState)
    handleShareIntent(intent)
  }

  /**
   * Handle share intent when app is already running
   */
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    handleShareIntent(intent)
  }

  /**
   * Process incoming share intent from other apps (e.g., Instagram)
   */
  private fun handleShareIntent(intent: Intent?) {
    if (intent != null) {
      val action = intent.action
      val type = intent.type

      if (Intent.ACTION_SEND == action && type != null) {
        if ("text/plain" == type || type.startsWith("text/")) {
          val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
          if (!sharedText.isNullOrEmpty() && reactNativeHost.hasInstance()) {
            try {
              // Send shared text to React Native via event emitter
              reactNativeHost.reactInstanceManager
                .currentReactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("INCOMING_SHARE", sharedText)
            } catch (e: Exception) {
              e.printStackTrace()
            }
          }
        }
      }
    }
  }
}
