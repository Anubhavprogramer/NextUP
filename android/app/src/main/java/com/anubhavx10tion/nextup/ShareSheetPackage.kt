package com.anubhavx10tion.nextup

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.ViewManager

/**
 * Lets the share sheet close ShareActivity explicitly. BackHandler.exitApp() acts on
 * React's *current* activity, which becomes MainActivity as soon as the sheet hands a
 * share over to the app — so it would close the wrong screen.
 */
class ShareSheetModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName(): String = "NextUPShareSheet"

  @ReactMethod
  fun close() {
    UiThreadUtil.runOnUiThread { ShareActivity.current?.get()?.finish() }
  }
}

class ShareSheetPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> =
      listOf(ShareSheetModule(context))

  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
