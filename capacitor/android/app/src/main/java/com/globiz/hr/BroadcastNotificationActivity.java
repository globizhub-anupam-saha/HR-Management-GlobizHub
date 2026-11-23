package com.globiz.hr;

import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.globiz.hr.network.ApiClient;
import com.google.android.material.card.MaterialCardView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class BroadcastNotificationActivity extends AppCompatActivity {

    private String targetAudience = "ALL"; // "ALL", "DEPARTMENT", "SPECIFIC_EMPLOYEES"
    private final Set<String> selectedDeptIds = new HashSet<>();
    private final Set<String> selectedEmpIds = new HashSet<>();

    private final List<JSONObject> departments = new ArrayList<>();
    private final List<JSONObject> employees = new ArrayList<>();
    private final List<JSONObject> filteredEmployees = new ArrayList<>();

    private MaterialCardView cardAudienceAll;
    private MaterialCardView cardAudienceDept;
    private MaterialCardView cardAudienceStaff;
    private TextView tvDeliveryEstimate;

    private LinearLayout llDepartmentContainer;
    private LinearLayout llDepartmentList;
    private TextView btnSelectAllDepts;

    private LinearLayout llEmployeeContainer;
    private LinearLayout llEmployeeList;
    private TextView tvSelectedStaffCount;
    private EditText etEmployeeSearch;

    private Spinner spNotificationCategory;
    private Spinner spNotificationUrgency;
    private EditText etBroadcastTitle;
    private EditText etBroadcastMessage;
    private CheckBox cbCreateAnnouncement;

    private Button btnDispatchNotification;
    private ProgressBar pbDispatch;

    private ApiClient apiClient;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_broadcast_notification);

        apiClient = ApiClient.getInstance(this);

        initViews();
        setupListeners();
        loadData();
    }

    private void initViews() {
        ImageView btnBack = findViewById(R.id.btnBack);
        if (btnBack != null) btnBack.setOnClickListener(v -> finish());

        cardAudienceAll = findViewById(R.id.cardAudienceAll);
        cardAudienceDept = findViewById(R.id.cardAudienceDept);
        cardAudienceStaff = findViewById(R.id.cardAudienceStaff);
        tvDeliveryEstimate = findViewById(R.id.tvDeliveryEstimate);

        llDepartmentContainer = findViewById(R.id.llDepartmentContainer);
        llDepartmentList = findViewById(R.id.llDepartmentList);
        btnSelectAllDepts = findViewById(R.id.btnSelectAllDepts);

        llEmployeeContainer = findViewById(R.id.llEmployeeContainer);
        llEmployeeList = findViewById(R.id.llEmployeeList);
        tvSelectedStaffCount = findViewById(R.id.tvSelectedStaffCount);
        etEmployeeSearch = findViewById(R.id.etEmployeeSearch);

        spNotificationCategory = findViewById(R.id.spNotificationCategory);
        spNotificationUrgency = findViewById(R.id.spNotificationUrgency);
        etBroadcastTitle = findViewById(R.id.etBroadcastTitle);
        etBroadcastMessage = findViewById(R.id.etBroadcastMessage);
        cbCreateAnnouncement = findViewById(R.id.cbCreateAnnouncement);

        btnDispatchNotification = findViewById(R.id.btnDispatchNotification);
        pbDispatch = findViewById(R.id.pbDispatch);

        // Populate Category Spinner
        String[] categories = new String[]{"Announcement", "Important Alert", "Policy Update", "General Notice"};
        ArrayAdapter<String> catAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, categories);
        spNotificationCategory.setAdapter(catAdapter);

        // Populate Urgency Spinner
        String[] urgencies = new String[]{"Normal Priority", "Urgent (Bypasses Mute)"};
        ArrayAdapter<String> urgAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, urgencies);
        spNotificationUrgency.setAdapter(urgAdapter);
    }

    private void setupListeners() {
        cardAudienceAll.setOnClickListener(v -> selectAudience("ALL"));
        cardAudienceDept.setOnClickListener(v -> selectAudience("DEPARTMENT"));
        cardAudienceStaff.setOnClickListener(v -> selectAudience("SPECIFIC_EMPLOYEES"));

        btnSelectAllDepts.setOnClickListener(v -> {
            if (selectedDeptIds.size() == departments.size()) {
                selectedDeptIds.clear();
                btnSelectAllDepts.setText("Select All");
            } else {
                for (JSONObject d : departments) {
                    selectedDeptIds.add(d.optString("id", ""));
                }
                btnSelectAllDepts.setText("Deselect All");
            }
            renderDepartmentRows();
            updateDeliveryEstimate();
        });

        etEmployeeSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterEmployees(s.toString());
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnDispatchNotification.setOnClickListener(v -> dispatchNotification());
    }

    private void selectAudience(String audience) {
        targetAudience = audience;

        int activeColor = Color.parseColor("#0056FD");
        int inactiveColor = Color.parseColor("#E2E8F0");

        cardAudienceAll.setStrokeColor(audience.equals("ALL") ? activeColor : inactiveColor);
        cardAudienceAll.setCardBackgroundColor(audience.equals("ALL") ? Color.parseColor("#EFF6FF") : Color.WHITE);

        cardAudienceDept.setStrokeColor(audience.equals("DEPARTMENT") ? activeColor : inactiveColor);
        cardAudienceDept.setCardBackgroundColor(audience.equals("DEPARTMENT") ? Color.parseColor("#EFF6FF") : Color.WHITE);

        cardAudienceStaff.setStrokeColor(audience.equals("SPECIFIC_EMPLOYEES") ? activeColor : inactiveColor);
        cardAudienceStaff.setCardBackgroundColor(audience.equals("SPECIFIC_EMPLOYEES") ? Color.parseColor("#EFF6FF") : Color.WHITE);

        llDepartmentContainer.setVisibility(audience.equals("DEPARTMENT") ? View.VISIBLE : View.GONE);
        llEmployeeContainer.setVisibility(audience.equals("SPECIFIC_EMPLOYEES") ? View.VISIBLE : View.GONE);

        updateDeliveryEstimate();
    }

    private void loadData() {
        apiClient.getDepartments(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray depts) {
                runOnUiThread(() -> {
                    departments.clear();
                    if (depts != null) {
                        for (int i = 0; i < depts.length(); i++) {
                            JSONObject d = depts.optJSONObject(i);
                            if (d != null) departments.add(d);
                        }
                    }
                    renderDepartmentRows();
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {}
        });

        apiClient.getTeamMembers(apiClient.getToken(), new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray emps) {
                runOnUiThread(() -> {
                    employees.clear();
                    filteredEmployees.clear();
                    if (emps != null) {
                        for (int i = 0; i < emps.length(); i++) {
                            JSONObject e = emps.optJSONObject(i);
                            if (e != null) {
                                employees.add(e);
                                filteredEmployees.add(e);
                            }
                        }
                    }
                    renderEmployeeRows();
                    updateDeliveryEstimate();
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {}
        });
    }

    private void updateDeliveryEstimate() {
        if ("ALL".equals(targetAudience)) {
            String count = employees.isEmpty() ? "All active" : String.valueOf(employees.size());
            tvDeliveryEstimate.setText("Delivery estimate: " + count + " employees");
        } else if ("DEPARTMENT".equals(targetAudience)) {
            int count = 0;
            for (JSONObject emp : employees) {
                String dId = emp.optString("departmentId", "");
                if (dId.isEmpty()) {
                    JSONObject dObj = emp.optJSONObject("department");
                    if (dObj != null) dId = dObj.optString("id", "");
                }
                if (selectedDeptIds.contains(dId)) {
                    count++;
                }
            }
            tvDeliveryEstimate.setText("Delivery estimate: " + count + " employees in " + selectedDeptIds.size() + " department(s)");
        } else {
            tvDeliveryEstimate.setText("Delivery estimate: " + selectedEmpIds.size() + " selected employee(s)");
        }
    }

    private void renderDepartmentRows() {
        llDepartmentList.removeAllViews();
        if (departments.isEmpty()) {
            TextView emptyTv = new TextView(this);
            emptyTv.setText("No registered departments in company.");
            emptyTv.setTextSize(12);
            emptyTv.setTextColor(Color.parseColor("#94A3B8"));
            llDepartmentList.addView(emptyTv);
            return;
        }

        for (JSONObject dept : departments) {
            String id = dept.optString("id", "");
            String name = dept.optString("name", "Department");
            boolean isSelected = selectedDeptIds.contains(id);

            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(dpToPx(12), dpToPx(8), dpToPx(12), dpToPx(8));
            row.setBackgroundResource(R.drawable.bg_attendance_card);
            row.setClickable(true);
            row.setFocusable(true);

            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            params.setMargins(0, 0, 0, dpToPx(6));
            row.setLayoutParams(params);

            TextView nameTv = new TextView(this);
            nameTv.setText(name);
            nameTv.setTextSize(13);
            nameTv.setTextColor(isSelected ? Color.parseColor("#0056FD") : Color.parseColor("#1E293B"));
            nameTv.setLayoutParams(new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f));
            row.addView(nameTv);

            CheckBox cb = new CheckBox(this);
            cb.setChecked(isSelected);
            cb.setClickable(false);
            row.addView(cb);

            row.setOnClickListener(v -> {
                if (selectedDeptIds.contains(id)) {
                    selectedDeptIds.remove(id);
                } else {
                    selectedDeptIds.add(id);
                }
                btnSelectAllDepts.setText(selectedDeptIds.size() == departments.size() ? "Deselect All" : "Select All");
                renderDepartmentRows();
                updateDeliveryEstimate();
            });

            llDepartmentList.addView(row);
        }
    }

    private void filterEmployees(String query) {
        String q = query.trim().toLowerCase();
        filteredEmployees.clear();
        if (q.isEmpty()) {
            filteredEmployees.addAll(employees);
        } else {
            for (JSONObject e : employees) {
                String fn = e.optString("firstName", "").toLowerCase();
                String ln = e.optString("lastName", "").toLowerCase();
                String email = e.optString("email", "").toLowerCase();
                JSONObject d = e.optJSONObject("department");
                String dName = d != null ? d.optString("name", "").toLowerCase() : "";
                if (fn.contains(q) || ln.contains(q) || email.contains(q) || dName.contains(q)) {
                    filteredEmployees.add(e);
                }
            }
        }
        renderEmployeeRows();
    }

    private void renderEmployeeRows() {
        llEmployeeList.removeAllViews();
        tvSelectedStaffCount.setText(selectedEmpIds.size() + " Selected");

        if (filteredEmployees.isEmpty()) {
            TextView emptyTv = new TextView(this);
            emptyTv.setText(employees.isEmpty() ? "No active employees found." : "No matching staff members found.");
            emptyTv.setTextSize(12);
            emptyTv.setTextColor(Color.parseColor("#94A3B8"));
            llEmployeeList.addView(emptyTv);
            return;
        }

        for (JSONObject emp : filteredEmployees) {
            String id = emp.optString("id", "");
            String fn = emp.optString("firstName", "");
            String ln = emp.optString("lastName", "");
            String fullName = (fn + " " + ln).trim();
            String email = emp.optString("email", "");
            JSONObject dept = emp.optJSONObject("department");
            String deptName = dept != null ? dept.optString("name", "") : "";
            boolean isSelected = selectedEmpIds.contains(id);

            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(dpToPx(10), dpToPx(8), dpToPx(10), dpToPx(8));
            row.setBackgroundResource(R.drawable.bg_attendance_card);
            row.setClickable(true);
            row.setFocusable(true);

            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            params.setMargins(0, 0, 0, dpToPx(6));
            row.setLayoutParams(params);

            // Initials Avatar
            TextView avatar = new TextView(this);
            String initial = !fn.isEmpty() ? fn.substring(0, 1).toUpperCase() : (!fullName.isEmpty() ? fullName.substring(0, 1).toUpperCase() : "E");
            avatar.setText(initial);
            avatar.setGravity(Gravity.CENTER);
            avatar.setTextColor(Color.parseColor("#0056FD"));
            avatar.setTextSize(11);
            avatar.setBackgroundResource(R.drawable.bg_circle_soft_blue);
            row.addView(avatar, new LinearLayout.LayoutParams(dpToPx(30), dpToPx(30)));

            // Text column
            LinearLayout textCol = new LinearLayout(this);
            textCol.setOrientation(LinearLayout.VERTICAL);
            textCol.setPadding(dpToPx(10), 0, dpToPx(6), 0);
            textCol.setLayoutParams(new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f));

            TextView nameTv = new TextView(this);
            nameTv.setText(fullName.isEmpty() ? email : fullName);
            nameTv.setTextSize(12);
            nameTv.setTextColor(Color.parseColor("#0F172A"));
            textCol.addView(nameTv);

            TextView subTv = new TextView(this);
            subTv.setText(deptName.isEmpty() ? email : email + " • " + deptName);
            subTv.setTextSize(10);
            subTv.setTextColor(Color.parseColor("#64748B"));
            textCol.addView(subTv);

            row.addView(textCol);

            CheckBox cb = new CheckBox(this);
            cb.setChecked(isSelected);
            cb.setClickable(false);
            row.addView(cb);

            row.setOnClickListener(v -> {
                if (selectedEmpIds.contains(id)) {
                    selectedEmpIds.remove(id);
                } else {
                    selectedEmpIds.add(id);
                }
                renderEmployeeRows();
                updateDeliveryEstimate();
            });

            llEmployeeList.addView(row);
        }
    }

    private void dispatchNotification() {
        String title = etBroadcastTitle.getText().toString().trim();
        String message = etBroadcastMessage.getText().toString().trim();

        if (title.isEmpty() || message.isEmpty()) {
            Toast.makeText(this, "Please enter both a title and message details.", Toast.LENGTH_SHORT).show();
            return;
        }

        if ("DEPARTMENT".equals(targetAudience) && selectedDeptIds.isEmpty()) {
            Toast.makeText(this, "Please select at least one department.", Toast.LENGTH_SHORT).show();
            return;
        }

        if ("SPECIFIC_EMPLOYEES".equals(targetAudience) && selectedEmpIds.isEmpty()) {
            Toast.makeText(this, "Please select at least one employee.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnDispatchNotification.setEnabled(false);
        btnDispatchNotification.setText("");
        pbDispatch.setVisibility(View.VISIBLE);

        String[] categoryKeys = new String[]{"ANNOUNCEMENT", "ALERT", "POLICY", "GENERAL"};
        String category = categoryKeys[spNotificationCategory.getSelectedItemPosition()];
        String priority = spNotificationUrgency.getSelectedItemPosition() == 1 ? "URGENT" : "NORMAL";

        try {
            JSONObject payload = new JSONObject();
            payload.put("title", title);
            payload.put("message", message);
            payload.put("type", category);
            payload.put("targetAudience", targetAudience);
            payload.put("priority", priority);
            payload.put("createAnnouncement", cbCreateAnnouncement.isChecked());

            if ("DEPARTMENT".equals(targetAudience)) {
                JSONArray deptsArr = new JSONArray();
                for (String dId : selectedDeptIds) deptsArr.put(dId);
                payload.put("departmentIds", deptsArr);
            } else if ("SPECIFIC_EMPLOYEES".equals(targetAudience)) {
                JSONArray empsArr = new JSONArray();
                for (String eId : selectedEmpIds) empsArr.put(eId);
                payload.put("employeeIds", empsArr);
            }

            apiClient.broadcastNotification(payload, new ApiClient.ApiCallback<JSONObject>() {
                @Override
                public void onSuccess(JSONObject result) {
                    runOnUiThread(() -> {
                        pbDispatch.setVisibility(View.GONE);
                        btnDispatchNotification.setEnabled(true);
                        btnDispatchNotification.setText("Dispatch Notification");

                        String msg = result != null ? result.optString("message", "Notification broadcast successfully delivered!") : "Notification broadcast successfully delivered!";
                        new androidx.appcompat.app.AlertDialog.Builder(BroadcastNotificationActivity.this)
                                .setTitle("Broadcast Delivered")
                                .setMessage(msg)
                                .setPositiveButton("OK", (dialog, which) -> {
                                    setResult(RESULT_OK);
                                    finish();
                                })
                                .setCancelable(false)
                                .show();
                    });
                }

                @Override
                public void onError(String errorMessage, int statusCode) {
                    runOnUiThread(() -> {
                        pbDispatch.setVisibility(View.GONE);
                        btnDispatchNotification.setEnabled(true);
                        btnDispatchNotification.setText("Dispatch Notification");

                        new androidx.appcompat.app.AlertDialog.Builder(BroadcastNotificationActivity.this)
                                .setTitle("Broadcast Failed")
                                .setMessage(errorMessage != null ? errorMessage : "Failed to broadcast notification.")
                                .setPositiveButton("OK", null)
                                .show();
                    });
                }
            });
        } catch (Exception e) {
            pbDispatch.setVisibility(View.GONE);
            btnDispatchNotification.setEnabled(true);
            btnDispatchNotification.setText("Dispatch Notification");
            Toast.makeText(this, "Error building payload: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private int dpToPx(int dp) {
        return Math.round(dp * getResources().getDisplayMetrics().density);
    }
}
