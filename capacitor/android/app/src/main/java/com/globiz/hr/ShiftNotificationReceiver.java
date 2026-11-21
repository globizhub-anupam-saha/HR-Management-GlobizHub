package com.globiz.hr;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.NotificationCompat;
import com.globiz.hr.network.ApiClient;

public class ShiftNotificationReceiver extends BroadcastReceiver {
    public static final String ACTION_SHIFT_START_REMINDER = "com.globiz.hr.ACTION_SHIFT_START_REMINDER";
    public static final String ACTION_SHIFT_END_REMINDER = "com.globiz.hr.ACTION_SHIFT_END_REMINDER";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        String action = intent.getAction();
        ApiClient apiClient = ApiClient.getInstance(context);
        if (!apiClient.isLoggedIn()) return;

        String title;
        String body;
        int notifId;

        if (ACTION_SHIFT_START_REMINDER.equals(action)) {
            title = "Upcoming Shift • Starting in 5 mins";
            body = "Good morning! Your shift starts at 09:00 AM. Punch in now to start on time. Have a wonderful and productive work day!";
            notifId = 1001;
        } else if (ACTION_SHIFT_END_REMINDER.equals(action)) {
            title = "Shift Completed • 06:00 PM";
            body = "Great job today! Your shift is now over. Thank you for your dedication and hard work—don't forget to punch out!";
            notifId = 1002;
        } else {
            return;
        }

        apiClient.recordLocalNotification(title, body);

        try {
            Intent mainIntent = new Intent(context, HomeActivity.class);
            mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    notifId,
                    mainIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, "globiz_attendance_channel")
                    .setSmallIcon(R.drawable.ic_notifications)
                    .setColor(android.graphics.Color.parseColor("#0056FD"))
                    .setContentTitle(title)
                    .setContentText(body)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent);

            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify(notifId, builder.build());
            }
        } catch (Exception ignored) {}
    }
}
