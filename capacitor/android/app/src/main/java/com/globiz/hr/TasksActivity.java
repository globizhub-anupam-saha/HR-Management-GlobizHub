package com.globiz.hr;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.ScrollView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

public class TasksActivity extends AppCompatActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tasks);

        // Unified GlobizHR Header
        AppHeaderHelper.setupHeader(this, "Tasks", false);

        setupBottomNav();
        setupListeners();
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollView), findViewById(R.id.bottomNavBar));
    }

    @Override
    protected void onResume() {
        super.onResume();
        BottomNavHelper.setupBottomNav(this, "tasks");
        AppHeaderHelper.refreshHeaderState(this);
    }

    private void setupListeners() {
        View btnNewTask = findViewById(R.id.btnNewTask);
        if (btnNewTask != null) {
            btnNewTask.setOnClickListener(v -> showCreateTaskDialog());
        }
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
                        Toast.makeText(this, "Task '" + taskTitle + "' created successfully.", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "tasks");
    }
}
