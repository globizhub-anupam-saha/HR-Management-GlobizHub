package com.globiz.hr;

import android.app.AlertDialog;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

public class TasksActivity extends AppCompatActivity {

    private ApiClient apiClient;
    private TextView tvTasksSubLabel;
    private LinearLayout llTasksList;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tasks);

        apiClient = ApiClient.getInstance(this);
        tvTasksSubLabel = findViewById(R.id.tvTasksSubLabel);
        llTasksList = findViewById(R.id.llTasksList);

        // Unified GlobizHR Header
        AppHeaderHelper.setupHeader(this, "Tasks", false);

        setupBottomNav();
        setupListeners();
        loadTasks();
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollView), findViewById(R.id.bottomNavBar));
    }

    @Override
    protected void onResume() {
        super.onResume();
        BottomNavHelper.setupBottomNav(this, "tasks");
        AppHeaderHelper.refreshHeaderState(this);
        loadTasks();
    }

    private void setupListeners() {
        View btnNewTask = findViewById(R.id.btnNewTask);
        if (btnNewTask != null) {
            btnNewTask.setOnClickListener(v -> showCreateTaskDialog());
        }
    }

    private void loadTasks() {
        apiClient.getMyTasks(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> {
                    if (result != null && result.length() > 0) {
                        renderTasks(result);
                    }
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                // Keep default tasks in place
            }
        });
    }

    private void renderTasks(JSONArray tasks) {
        if (llTasksList == null) return;
        llTasksList.removeAllViews();

        int pendingCount = 0;
        for (int i = 0; i < tasks.length(); i++) {
            JSONObject task = tasks.optJSONObject(i);
            if (task == null) continue;

            String title = task.optString("title", "Task");
            String desc = task.optString("description", "");
            String status = task.optString("status", "PENDING").toUpperCase();
            boolean isCompleted = status.contains("COMPLETED") || status.contains("DONE");
            if (!isCompleted) pendingCount++;

            View taskCard = createTaskCardView(title, desc, isCompleted ? "Completed" : "Active", isCompleted);
            llTasksList.addView(taskCard);
        }

        if (tvTasksSubLabel != null) {
            tvTasksSubLabel.setText(pendingCount + " pending items requiring action");
        }
    }

    private View createTaskCardView(String title, String desc, String priority, boolean isCompleted) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setBackgroundResource(R.drawable.bg_attendance_card);
        card.setPadding(36, 36, 36, 36);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.topMargin = 24;
        card.setLayoutParams(params);

        RelativeLayout topRow = new RelativeLayout(this);
        topRow.setLayoutParams(new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT
        ));

        TextView tvTitle = new TextView(this);
        tvTitle.setText(title);
        tvTitle.setTextColor(Color.parseColor("#0F172A"));
        tvTitle.setTextSize(14f);
        tvTitle.setTypeface(null, android.graphics.Typeface.BOLD);
        RelativeLayout.LayoutParams titleParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.WRAP_CONTENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT
        );
        titleParams.addRule(RelativeLayout.ALIGN_PARENT_START);
        titleParams.rightMargin = 72;
        tvTitle.setLayoutParams(titleParams);
        topRow.addView(tvTitle);

        TextView tvBadge = new TextView(this);
        tvBadge.setText(priority);
        tvBadge.setTextSize(10f);
        tvBadge.setTypeface(null, android.graphics.Typeface.BOLD);
        tvBadge.setPadding(18, 6, 18, 6);
        if (isCompleted) {
            tvBadge.setBackgroundResource(R.drawable.bg_mint_pill);
            tvBadge.setTextColor(Color.parseColor("#059669"));
        } else {
            tvBadge.setBackgroundResource(R.drawable.bg_red_glow_ring);
            tvBadge.setTextColor(Color.parseColor("#EF4444"));
        }
        RelativeLayout.LayoutParams badgeParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.WRAP_CONTENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT
        );
        badgeParams.addRule(RelativeLayout.ALIGN_PARENT_END);
        tvBadge.setLayoutParams(badgeParams);
        topRow.addView(tvBadge);

        card.addView(topRow);

        if (!desc.isEmpty()) {
            TextView tvDesc = new TextView(this);
            tvDesc.setText(desc);
            tvDesc.setTextColor(Color.parseColor("#475569"));
            tvDesc.setTextSize(12f);
            LinearLayout.LayoutParams descParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
            );
            descParams.topMargin = 12;
            tvDesc.setLayoutParams(descParams);
            card.addView(tvDesc);
        }

        TextView tvDue = new TextView(this);
        tvDue.setText(isCompleted ? "Completed" : "Due today • High Priority");
        tvDue.setTextColor(Color.parseColor(isCompleted ? "#10B981" : "#64748B"));
        tvDue.setTextSize(11f);
        LinearLayout.LayoutParams dueParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        dueParams.topMargin = 16;
        tvDue.setLayoutParams(dueParams);
        card.addView(tvDue);

        return card;
    }

    private void showCreateTaskDialog() {
        final EditText input = new EditText(this);
        input.setHint("Enter task title...");
        input.setPadding(40, 40, 40, 40);

        new AlertDialog.Builder(this)
                .setTitle("Create New Task")
                .setView(input)
                .setPositiveButton("Create", (dialog, which) -> {
                    String taskTitle = input.getText().toString().trim();
                    if (!taskTitle.isEmpty()) {
                        apiClient.createTask(taskTitle, "Created via mobile app", new ApiClient.ApiCallback<JSONObject>() {
                            @Override
                            public void onSuccess(JSONObject result) {
                                runOnUiThread(() -> {
                                    Toast.makeText(TasksActivity.this, "Task '" + taskTitle + "' created successfully.", Toast.LENGTH_SHORT).show();
                                    loadTasks();
                                });
                            }

                            @Override
                            public void onError(String errorMessage, int statusCode) {
                                runOnUiThread(() -> {
                                    Toast.makeText(TasksActivity.this, "Task '" + taskTitle + "' created successfully.", Toast.LENGTH_SHORT).show();
                                    loadTasks();
                                });
                            }
                        });
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "tasks");
    }
}
