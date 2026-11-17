# GlobizHR ProGuard & R8 Configuration for Google Play Console

# 1. Preserve source file and line numbers for Google Play deobfuscation
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses,EnclosingMethod

# 2. Preserve GlobizHR native activities, network client, adapters, and models
-keep class com.globiz.hr.** { *; }
-keepclassmembers class com.globiz.hr.** { *; }

# 3. Preserve Capacitor Core & Bridge plugins
-keep class com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
}
-keep public class * extends com.getcapacitor.BridgeActivity { *; }
-keep class org.apache.cordova.** { *; }

# 4. Preserve WebView JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 5. Suppress harmless warnings from third-party libraries
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn androidx.**
