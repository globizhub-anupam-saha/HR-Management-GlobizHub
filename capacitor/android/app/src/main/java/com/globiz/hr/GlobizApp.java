package com.globiz.hr;

import android.app.Application;
import android.util.Log;

public class GlobizApp extends Application {
    private static final String TAG = "GlobizApp";

    @Override
    public void onCreate() {
        super.onCreate();

        final Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            Log.e(TAG, "Uncaught exception in " + thread.getName(), throwable);
            try {
                getSharedPreferences("Globiz_Crash_Report", MODE_PRIVATE)
                        .edit()
                        .putString("last_crash_exception", Log.getStackTraceString(throwable))
                        .putLong("last_crash_timestamp", System.currentTimeMillis())
                        .commit();
            } catch (Exception ignored) {}

            if (defaultHandler != null) {
                defaultHandler.uncaughtException(thread, throwable);
            }
        });
    }
}
