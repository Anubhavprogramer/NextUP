/**
 * ShareIntentHandler.java
 * Native module to handle incoming share intents from Android
 * 
 * Place this file in: android/app/src/main/java/com/nextup/
 */

package com.nextup;

import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import androidx.annotation.Nullable;

public class ShareIntentHandler extends ReactContextBaseJavaModule {
  private static final String EVENT_NAME = "INCOMING_SHARE";
  private String sharedText = null;

  public ShareIntentHandler(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ShareIntentHandler";
  }

  /**
   * Get the shared text from the intent
   */
  @ReactMethod
  public void getSharedText(Promise promise) {
    try {
      if (sharedText != null) {
        promise.resolve(sharedText);
        sharedText = null; // Clear after retrieving
      } else {
        promise.resolve(null);
      }
    } catch (Exception e) {
      promise.reject("ERROR", e);
    }
  }

  /**
   * Handle the incoming intent
   * Called from MainActivity
   */
  public static void handleIntent(Intent intent, ReactApplicationContext reactContext) {
    if (intent != null) {
      String action = intent.getAction();
      String type = intent.getType();

      if (Intent.ACTION_SEND.equals(action) && type != null) {
        if ("text/plain".equals(type) || "text/*".equals(type)) {
          String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
          if (sharedText != null) {
            // Send event to React Native
            reactContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
              .emit(EVENT_NAME, sharedText);
          }
        }
      }
    }
  }

  /**
   * Set the shared text
   */
  public void setSharedText(String text) {
    this.sharedText = text;
  }
}
