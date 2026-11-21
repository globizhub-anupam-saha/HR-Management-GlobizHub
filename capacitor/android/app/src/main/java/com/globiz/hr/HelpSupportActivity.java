package com.globiz.hr;

import android.app.ProgressDialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

public class HelpSupportActivity extends AppCompatActivity {

    private Spinner spTicketCategory;
    private Spinner spTicketPriority;
    private EditText etTicketTitle;
    private EditText etTicketDescription;
    private Button btnSubmitTicket;
    private LinearLayout containerMyTickets;

    private ApiClient apiClient;

    private static final String[] CATEGORIES_DISPLAY = {
            "General Inquiries",
            "HR & Personnel",
            "IT & Technical Support",
            "Payroll & Salary",
            "Facilities & Office"
    };

    private static final String[] CATEGORIES_VALUES = {
            "GENERAL",
            "HR",
            "IT",
            "PAYROLL",
            "FACILITIES"
    };

    private static final String[] PRIORITIES_DISPLAY = {"Low", "Medium", "High", "Urgent"};
    private static final String[] PRIORITIES_VALUES = {"LOW", "MEDIUM", "HIGH", "URGENT"};

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_help_support);

        AppHeaderHelper.applyWindowInsets(this);
        apiClient = ApiClient.getInstance(this);

        initViews();
        loadMyTickets();
    }

    private void initViews() {
        findViewById(R.id.btnHelpBack).setOnClickListener(v -> finish());
        TabletHelper.applyTabletConstraint(findViewById(R.id.helpContentContainer));
        TabletHelper.applyTabletConstraint(findViewById(R.id.helpTopBar));

        spTicketCategory = findViewById(R.id.spTicketCategory);
        spTicketPriority = findViewById(R.id.spTicketPriority);
        etTicketTitle = findViewById(R.id.etTicketTitle);
        etTicketDescription = findViewById(R.id.etTicketDescription);
        btnSubmitTicket = findViewById(R.id.btnSubmitTicket);
        containerMyTickets = findViewById(R.id.containerMyTickets);

        ArrayAdapter<String> catAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, CATEGORIES_DISPLAY);
        spTicketCategory.setAdapter(catAdapter);

        ArrayAdapter<String> pAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, PRIORITIES_DISPLAY);
        spTicketPriority.setAdapter(pAdapter);
        spTicketPriority.setSelection(1); // Medium default

        findViewById(R.id.btnEmailSupport).setOnClickListener(v -> {
            try {
                Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
                emailIntent.setData(Uri.parse("mailto:support@globizhub.com?subject=GlobizHR%20Support%20Request"));
                startActivity(emailIntent);
            } catch (Exception e) {
                Toast.makeText(this, "Email: support@globizhub.com", Toast.LENGTH_LONG).show();
            }
        });

        findViewById(R.id.btnCallSupport).setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                    .setTitle("HR Helpline")
                    .setMessage("Contact GlobizHub Support Desk:\n+91 98765 43210")
                    .setPositiveButton("Call", (dialog, which) -> {
                        try {
                            Intent callIntent = new Intent(Intent.ACTION_DIAL);
                            callIntent.setData(Uri.parse("tel:+919876543210"));
                            startActivity(callIntent);
                        } catch (Exception ignored) {}
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });

        btnSubmitTicket.setOnClickListener(v -> handleSubmitTicket());
    }

    private void handleSubmitTicket() {
        String title = etTicketTitle.getText().toString().trim();
        String desc = etTicketDescription.getText().toString().trim();

        if (title.isEmpty() || desc.isEmpty()) {
            Toast.makeText(this, "Please enter both a summary and detailed description.", Toast.LENGTH_SHORT).show();
            return;
        }

        int catIdx = spTicketCategory.getSelectedItemPosition();
        String category = (catIdx >= 0 && catIdx < CATEGORIES_VALUES.length) ? CATEGORIES_VALUES[catIdx] : "GENERAL";

        int pIdx = spTicketPriority.getSelectedItemPosition();
        String priority = (pIdx >= 0 && pIdx < PRIORITIES_VALUES.length) ? PRIORITIES_VALUES[pIdx] : "MEDIUM";

        ProgressDialog progress = new ProgressDialog(this);
        progress.setMessage("Submitting support ticket...");
        progress.setCancelable(false);
        progress.show();

        apiClient.createSupportTicket(title, category, priority, desc, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject result) {
                progress.dismiss();
                etTicketTitle.setText("");
                etTicketDescription.setText("");
                Toast.makeText(HelpSupportActivity.this, "Ticket submitted successfully.", Toast.LENGTH_SHORT).show();
                loadMyTickets();
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                progress.dismiss();
                new AlertDialog.Builder(HelpSupportActivity.this)
                        .setTitle("Submission Error")
                        .setMessage(errorMessage)
                        .setPositiveButton("OK", null)
                        .show();
            }
        });
    }

    private void loadMyTickets() {
        apiClient.getMySupportTickets(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray list) {
                if (isFinishing() || isDestroyed()) return;
                containerMyTickets.removeAllViews();

                if (list == null || list.length() == 0) {
                    TextView empty = new TextView(HelpSupportActivity.this);
                    empty.setText("No open support tickets. Everything is running smoothly.");
                    empty.setTextColor(0xFF94A3B8);
                    empty.setTextSize(13);
                    empty.setGravity(Gravity.CENTER);
                    empty.setPadding(0, 16, 0, 16);
                    containerMyTickets.addView(empty);
                    return;
                }

                for (int i = 0; i < list.length(); i++) {
                    JSONObject item = list.optJSONObject(i);
                    if (item == null) continue;

                    String tTitle = item.optString("title", "Support Request");
                    String tCat = item.optString("category", "GENERAL");
                    String tStatus = item.optString("status", "OPEN");

                    LinearLayout row = new LinearLayout(HelpSupportActivity.this);
                    row.setOrientation(LinearLayout.HORIZONTAL);
                    row.setGravity(Gravity.CENTER_VERTICAL);
                    row.setPadding(0, 12, 0, 12);

                    LinearLayout left = new LinearLayout(HelpSupportActivity.this);
                    left.setOrientation(LinearLayout.VERTICAL);
                    left.setLayoutParams(new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));

                    TextView tvT = new TextView(HelpSupportActivity.this);
                    tvT.setText(tTitle);
                    tvT.setTextColor(0xFF0F172A);
                    tvT.setTextSize(13);
                    tvT.setTypeface(null, Typeface.BOLD);
                    left.addView(tvT);

                    TextView tvC = new TextView(HelpSupportActivity.this);
                    tvC.setText("Category: " + tCat);
                    tvC.setTextColor(0xFF64748B);
                    tvC.setTextSize(11);
                    left.addView(tvC);

                    row.addView(left);

                    TextView badge = new TextView(HelpSupportActivity.this);
                    badge.setText(" " + tStatus + " ");
                    badge.setTextSize(11);
                    badge.setTypeface(null, Typeface.BOLD);
                    badge.setPadding(12, 6, 12, 6);
                    if ("RESOLVED".equalsIgnoreCase(tStatus)) {
                        badge.setTextColor(0xFF10B981);
                        badge.setBackgroundResource(R.drawable.bg_capsule_selected);
                    } else {
                        badge.setTextColor(0xFF0056FD);
                        badge.setBackgroundResource(R.drawable.bg_capsule_selected);
                    }
                    row.addView(badge);

                    containerMyTickets.addView(row);

                    if (i < list.length() - 1) {
                        View divider = new View(HelpSupportActivity.this);
                        divider.setBackgroundColor(0xFFF1F5F9);
                        divider.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 2));
                        containerMyTickets.addView(divider);
                    }
                }
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                if (isFinishing() || isDestroyed()) return;
                containerMyTickets.removeAllViews();
                TextView empty = new TextView(HelpSupportActivity.this);
                empty.setText("No open support tickets.");
                empty.setTextColor(0xFF94A3B8);
                empty.setTextSize(13);
                empty.setGravity(Gravity.CENTER);
                containerMyTickets.addView(empty);
            }
        });
    }
}
