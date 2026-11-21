package com.globiz.hr;

import android.app.ProgressDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Outline;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.globiz.hr.network.ApiClient;

import org.json.JSONObject;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;
import java.util.concurrent.Executors;

public class AccountSettingsActivity extends AppCompatActivity {

    private FrameLayout flAccountAvatar;
    private ImageView ivAccountAvatar;
    private TextView tvAccountInitials;

    private EditText etFirstName;
    private EditText etLastName;
    private EditText etPhone;
    private Spinner spBloodGroup;
    private Spinner spGender;
    private EditText etUanNumber;
    private EditText etEsicIp;

    private TextView tvEmpCode;
    private TextView tvOfficialEmail;
    private TextView tvDepartment;
    private TextView tvDesignation;
    private TextView tvOrganizationName;

    private EditText etCurrentPassword;
    private EditText etNewPassword;
    private EditText etConfirmPassword;
    private Button btnUpdatePassword;
    private Button btnSaveProfile;

    private ApiClient apiClient;

    private static final String[] BLOOD_GROUPS_DISPLAY = {"Select...", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
    private static final String[] BLOOD_GROUPS_VALUES = {"", "O_POS", "O_NEG", "A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG"};

    private static final String[] GENDERS_DISPLAY = {"Male", "Female", "Other"};
    private static final String[] GENDERS_VALUES = {"MALE", "FEMALE", "OTHER"};

    private static final int REQUEST_IMAGE_PICK = 101;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_settings);

        AppHeaderHelper.applyWindowInsets(this);
        apiClient = ApiClient.getInstance(this);

        initViews();
        loadProfileData();
    }

    private void initViews() {
        findViewById(R.id.btnAccountBack).setOnClickListener(v -> finish());
        TabletHelper.applyTabletConstraint(findViewById(R.id.accountContentContainer));
        TabletHelper.applyTabletConstraint(findViewById(R.id.accountSettingsTopBar));

        flAccountAvatar = findViewById(R.id.flAccountAvatar);
        ivAccountAvatar = findViewById(R.id.ivAccountAvatar);
        tvAccountInitials = findViewById(R.id.tvAccountInitials);

        flAccountAvatar.setOutlineProvider(new ViewOutlineProvider() {
            @Override
            public void getOutline(View view, Outline outline) {
                outline.setOval(0, 0, view.getWidth(), view.getHeight());
            }
        });
        flAccountAvatar.setClipToOutline(true);

        findViewById(R.id.btnChangePhoto).setOnClickListener(v -> openImagePicker());

        etFirstName = findViewById(R.id.etFirstName);
        etLastName = findViewById(R.id.etLastName);
        etPhone = findViewById(R.id.etPhone);
        spBloodGroup = findViewById(R.id.spBloodGroup);
        spGender = findViewById(R.id.spGender);
        etUanNumber = findViewById(R.id.etUanNumber);
        etEsicIp = findViewById(R.id.etEsicIp);

        ArrayAdapter<String> bgAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, BLOOD_GROUPS_DISPLAY);
        spBloodGroup.setAdapter(bgAdapter);

        ArrayAdapter<String> gAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, GENDERS_DISPLAY);
        spGender.setAdapter(gAdapter);

        tvEmpCode = findViewById(R.id.tvEmpCode);
        tvOfficialEmail = findViewById(R.id.tvOfficialEmail);
        tvDepartment = findViewById(R.id.tvDepartment);
        tvDesignation = findViewById(R.id.tvDesignation);
        tvOrganizationName = findViewById(R.id.tvOrganizationName);

        etCurrentPassword = findViewById(R.id.etCurrentPassword);
        etNewPassword = findViewById(R.id.etNewPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnUpdatePassword = findViewById(R.id.btnUpdatePassword);
        btnSaveProfile = findViewById(R.id.btnSaveProfile);

        btnUpdatePassword.setOnClickListener(v -> handleUpdatePassword());
        btnSaveProfile.setOnClickListener(v -> handleSaveProfile());
    }

    private void openImagePicker() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(intent, REQUEST_IMAGE_PICK);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_IMAGE_PICK && resultCode == RESULT_OK && data != null && data.getData() != null) {
            Uri imageUri = data.getData();
            try {
                Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), imageUri);
                if (bitmap != null) {
                    ivAccountAvatar.setImageBitmap(bitmap);
                    ivAccountAvatar.setVisibility(View.VISIBLE);
                    tvAccountInitials.setVisibility(View.GONE);
                }
            } catch (Exception ignored) {}
        }
    }

    private void handleSaveProfile() {
        String first = etFirstName.getText().toString().trim();
        String last = etLastName.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();
        String uan = etUanNumber.getText().toString().trim();
        String esic = etEsicIp.getText().toString().trim();

        int bgIndex = spBloodGroup.getSelectedItemPosition();
        String blood = (bgIndex >= 0 && bgIndex < BLOOD_GROUPS_VALUES.length) ? BLOOD_GROUPS_VALUES[bgIndex] : "";

        int gIndex = spGender.getSelectedItemPosition();
        String gender = (gIndex >= 0 && gIndex < GENDERS_VALUES.length) ? GENDERS_VALUES[gIndex] : "MALE";

        ProgressDialog progress = new ProgressDialog(this);
        progress.setMessage("Saving account profile...");
        progress.setCancelable(false);
        progress.show();

        try {
            JSONObject payload = new JSONObject();
            payload.put("firstName", first);
            payload.put("lastName", last);
            payload.put("phone", phone);
            payload.put("gender", gender);
            if (!blood.isEmpty()) payload.put("bloodGroup", blood);
            if (!uan.isEmpty()) payload.put("uanNumber", uan);
            if (!esic.isEmpty()) payload.put("esicIpNumber", esic);

            apiClient.updateProfile(payload, new ApiClient.ApiCallback<JSONObject>() {
                @Override
                public void onSuccess(JSONObject result) {
                    progress.dismiss();
                    Toast.makeText(AccountSettingsActivity.this, "Profile updated successfully.", Toast.LENGTH_SHORT).show();
                    finish();
                }

                @Override
                public void onError(String errorMessage, int statusCode) {
                    progress.dismiss();
                    new AlertDialog.Builder(AccountSettingsActivity.this)
                            .setTitle("Update Error")
                            .setMessage(errorMessage)
                            .setPositiveButton("OK", null)
                            .show();
                }
            });

        } catch (Exception e) {
            progress.dismiss();
            Toast.makeText(this, "Failed to compile profile data.", Toast.LENGTH_SHORT).show();
        }
    }

    private void handleUpdatePassword() {
        String cur = etCurrentPassword.getText().toString().trim();
        String newP = etNewPassword.getText().toString().trim();
        String conf = etConfirmPassword.getText().toString().trim();

        if (cur.isEmpty() || newP.isEmpty() || conf.isEmpty()) {
            Toast.makeText(this, "Please enter all password fields.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (newP.length() < 8) {
            Toast.makeText(this, "New password must be at least 8 characters.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (!newP.equals(conf)) {
            Toast.makeText(this, "New passwords do not match.", Toast.LENGTH_SHORT).show();
            return;
        }

        ProgressDialog progress = new ProgressDialog(this);
        progress.setMessage("Updating password...");
        progress.setCancelable(false);
        progress.show();

        apiClient.changePassword(cur, newP, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject result) {
                progress.dismiss();
                etCurrentPassword.setText("");
                etNewPassword.setText("");
                etConfirmPassword.setText("");
                Toast.makeText(AccountSettingsActivity.this, "Password updated successfully.", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                progress.dismiss();
                new AlertDialog.Builder(AccountSettingsActivity.this)
                        .setTitle("Error")
                        .setMessage(errorMessage)
                        .setPositiveButton("OK", null)
                        .show();
            }
        });
    }

    private void loadProfileData() {
        String token = apiClient.getToken();
        String savedEmail = apiClient.getEmail();
        tvOfficialEmail.setText(savedEmail);

        if (token == null) return;

        apiClient.getProfile(token, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject user) {
                if (isFinishing() || isDestroyed()) return;

                String first = user.optString("firstName", "");
                String last = user.optString("lastName", "");
                String phone = user.optString("phone", "");
                String blood = user.optString("bloodGroup", "");
                String gender = user.optString("gender", "MALE");
                String uan = user.optString("uanNumber", "");
                String esic = user.optString("esicIpNumber", "");
                String email = user.optString("email", savedEmail);
                String code = user.optString("employeeCode", "EMP-1024");
                String photoUrl = user.optString("profilePhoto", "");
                if (photoUrl.isEmpty()) photoUrl = user.optString("profileImage", "");

                etFirstName.setText(first);
                etLastName.setText(last);
                etPhone.setText(phone);
                etUanNumber.setText(uan);
                etEsicIp.setText(esic);
                tvEmpCode.setText(code);
                tvOfficialEmail.setText(email);

                String initial = "U";
                if (!first.isEmpty()) {
                    initial = first.substring(0, 1).toUpperCase(Locale.ROOT);
                } else if (!email.isEmpty()) {
                    initial = email.substring(0, 1).toUpperCase(Locale.ROOT);
                }
                tvAccountInitials.setText(initial);

                // Set Blood Group selection
                for (int i = 0; i < BLOOD_GROUPS_VALUES.length; i++) {
                    if (BLOOD_GROUPS_VALUES[i].equalsIgnoreCase(blood)) {
                        spBloodGroup.setSelection(i);
                        break;
                    }
                }

                // Set Gender selection
                for (int i = 0; i < GENDERS_VALUES.length; i++) {
                    if (GENDERS_VALUES[i].equalsIgnoreCase(gender)) {
                        spGender.setSelection(i);
                        break;
                    }
                }

                // Department
                String deptName = "General Operations";
                if (user.has("department") && !user.isNull("department")) {
                    JSONObject dObj = user.optJSONObject("department");
                    if (dObj != null && dObj.has("name")) {
                        deptName = dObj.optString("name", "General Operations");
                    }
                }
                tvDepartment.setText(deptName);

                // Designation
                UserRole role = UserRole.fromString(apiClient.getRole());
                tvDesignation.setText(role.getDisplayName());

                // Organization
                String orgName = apiClient.getOrganization();
                if (user.has("company") && !user.isNull("company")) {
                    JSONObject cObj = user.optJSONObject("company");
                    if (cObj != null && cObj.has("name")) {
                        orgName = cObj.optString("name", orgName);
                    }
                }
                if (orgName == null || orgName.isEmpty() || "acmecorp".equalsIgnoreCase(orgName) || "null".equalsIgnoreCase(orgName)) {
                    orgName = "GlobizHub Inc.";
                }
                tvOrganizationName.setText(orgName);

                if (!photoUrl.isEmpty()) {
                    loadAvatarBitmap(photoUrl);
                } else {
                    ivAccountAvatar.setVisibility(View.GONE);
                    tvAccountInitials.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                // Keep default state
            }
        });
    }

    private void loadAvatarBitmap(String imageUrl) {
        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                URL url = new URL(imageUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setDoInput(true);
                conn.connect();
                InputStream is = conn.getInputStream();
                Bitmap bitmap = BitmapFactory.decodeStream(is);

                runOnUiThread(() -> {
                    if (bitmap != null && !isFinishing() && !isDestroyed()) {
                        ivAccountAvatar.setImageBitmap(bitmap);
                        ivAccountAvatar.setVisibility(View.VISIBLE);
                        tvAccountInitials.setVisibility(View.GONE);
                    }
                });
            } catch (Exception ignored) {
            }
        });
    }
}
