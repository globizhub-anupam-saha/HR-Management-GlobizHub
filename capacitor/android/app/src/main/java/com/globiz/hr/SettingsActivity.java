package com.globiz.hr;

import android.app.ProgressDialog;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Outline;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.widget.FrameLayout;
import android.widget.ImageView;
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

public class SettingsActivity extends AppCompatActivity {

    private FrameLayout flProfileAvatar;
    private ImageView ivProfileAvatar;
    private TextView tvProfileInitials;
    private TextView tvProfileName;
    private TextView tvProfileEmail;
    private TextView tvRoleBadge;
    private TextView tvCompanyName;
    private TextView tvAppVersion;

    private androidx.appcompat.widget.SwitchCompat swPushNotification;

    private ApiClient apiClient;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        AppHeaderHelper.applyWindowInsets(this);

        apiClient = ApiClient.getInstance(this);

        initViews();
        loadProfileData();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadProfileData();
    }

    private void initViews() {
        findViewById(R.id.btnBack).setOnClickListener(v -> finish());
        findViewById(R.id.btnSignOutTop).setOnClickListener(v -> confirmSignOut());
        TabletHelper.applyTabletConstraint(findViewById(R.id.settingsContentContainer));
        TabletHelper.applyTabletConstraint(findViewById(R.id.settingsTopBar));

        flProfileAvatar = findViewById(R.id.flProfileAvatar);
        ivProfileAvatar = findViewById(R.id.ivProfileAvatar);
        tvProfileInitials = findViewById(R.id.tvProfileInitials);
        tvProfileName = findViewById(R.id.tvProfileName);
        tvProfileEmail = findViewById(R.id.tvProfileEmail);
        tvRoleBadge = findViewById(R.id.tvRoleBadge);
        tvCompanyName = findViewById(R.id.tvCompanyName);
        tvAppVersion = findViewById(R.id.tvAppVersion);

        // Prepopulate immediately from local profile so name and avatar are never blank
        tvProfileName.setText(apiClient.getFullName());
        tvProfileEmail.setText(apiClient.getEmail());
        tvProfileInitials.setText(apiClient.getUserInitials());
        tvProfileInitials.setVisibility(View.VISIBLE);
        ivProfileAvatar.setVisibility(View.GONE);
        tvCompanyName.setText(apiClient.getOrganization());

        // Dynamic app version
        try {
            PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            tvAppVersion.setText(pInfo.versionName + " (" + pInfo.versionCode + ")");
        } catch (Exception e) {
            tvAppVersion.setText("1.0.0 (1)");
        }

        // Circular avatar outline
        flProfileAvatar.setOutlineProvider(new ViewOutlineProvider() {
            @Override
            public void getOutline(View view, Outline outline) {
                outline.setOval(0, 0, view.getWidth(), view.getHeight());
            }
        });
        flProfileAvatar.setClipToOutline(true);

        // View Profile -> Account Settings
        findViewById(R.id.btnViewProfile).setOnClickListener(v -> {
            startActivity(new Intent(this, AccountSettingsActivity.class));
        });

        // Account Settings Card (Below Organization)
        View btnAccountSettingsCard = findViewById(R.id.btnAccountSettingsCard);
        if (btnAccountSettingsCard != null) {
            btnAccountSettingsCard.setOnClickListener(v -> {
                startActivity(new Intent(this, AccountSettingsActivity.class));
            });
        }

        // Role badge update (Plain badge, no dropdown)
        updateRoleBadge();

        // Help & Support Box
        View btnHelpSupport = findViewById(R.id.btnHelpSupport);
        if (btnHelpSupport != null) {
            btnHelpSupport.setOnClickListener(v -> {
                startActivity(new Intent(this, HelpSupportActivity.class));
            });
        }

        // Privacy Policy (Redirect to web URL)
        View btnPrivacyPolicy = findViewById(R.id.btnPrivacyPolicy);
        if (btnPrivacyPolicy != null) {
            btnPrivacyPolicy.setOnClickListener(v -> {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://hr.globizhub.com/privacy"));
                    startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(this, "https://hr.globizhub.com/privacy", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Terms of Service (Redirect to web URL)
        View btnTermsOfService = findViewById(R.id.btnTermsOfService);
        if (btnTermsOfService != null) {
            btnTermsOfService.setOnClickListener(v -> {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://hr.globizhub.com/terms"));
                    startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(this, "https://hr.globizhub.com/terms", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Write Us
        View btnWriteUs = findViewById(R.id.btnWriteUs);
        if (btnWriteUs != null) {
            btnWriteUs.setOnClickListener(v -> {
                try {
                    Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
                    emailIntent.setData(Uri.parse("mailto:support@globizhub.com?subject=GlobizHR%20Support"));
                    startActivity(emailIntent);
                } catch (Exception e) {
                    Toast.makeText(this, "Email: support@globizhub.com", Toast.LENGTH_LONG).show();
                }
            });
        }

        // App Issues & Feedback
        View btnAppIssuesFeedback = findViewById(R.id.btnAppIssuesFeedback);
        if (btnAppIssuesFeedback != null) {
            btnAppIssuesFeedback.setOnClickListener(v -> {
                startActivity(new Intent(this, HelpSupportActivity.class));
            });
        }

        // Refresh App (2s HUD, reloads data, navigates to HomeActivity)
        View btnRefresh = findViewById(R.id.btnRefresh);
        if (btnRefresh != null) {
            btnRefresh.setOnClickListener(v -> handleRefreshApp());
        }

        // Push Notification Toggle
        swPushNotification = findViewById(R.id.swPushNotification);
        if (swPushNotification != null) {
            swPushNotification.setChecked(AppNotificationManager.isPushNotificationEnabled(this));
            swPushNotification.setOnCheckedChangeListener((buttonView, isChecked) -> {
                AppNotificationManager.setPushNotificationEnabled(this, isChecked);
                if (isChecked) {
                    AppNotificationManager.requestNotificationPermission(this);
                    Toast.makeText(this, "Push notifications enabled", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(this, "Push notifications paused", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Manage Account
        View btnManageAccount = findViewById(R.id.btnManageAccount);
        if (btnManageAccount != null) {
            btnManageAccount.setOnClickListener(v -> {
                startActivity(new Intent(this, DeleteAccountActivity.class));
            });
        }

        // Sign Out
        View btnSignOut = findViewById(R.id.btnSignOut);
        if (btnSignOut != null) {
            btnSignOut.setOnClickListener(v -> confirmSignOut());
        }
    }

    private void handleRefreshApp() {
        ProgressDialog progressDialog = new ProgressDialog(this);
        progressDialog.setMessage("Refreshing GlobizHR...");
        progressDialog.setCancelable(false);
        progressDialog.show();

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (!isFinishing() && !isDestroyed()) {
                progressDialog.dismiss();
                loadProfileData();

                Intent intent = new Intent(this, HomeActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(intent);
                finish();
            }
        }, 2000);
    }

    private void updateRoleBadge() {
        if (tvRoleBadge == null) return;
        UserRole currentRole = UserRole.fromString(apiClient.getRole());
        tvRoleBadge.setText(currentRole.getDisplayName());
    }

    private void loadProfileData() {
        String token = apiClient.getToken();
        String savedEmail = apiClient.getEmail();
        tvProfileName.setText(apiClient.getFullName());
        tvProfileEmail.setText(savedEmail);
        tvProfileInitials.setText(apiClient.getUserInitials());
        tvProfileInitials.setVisibility(View.VISIBLE);
        ivProfileAvatar.setVisibility(View.GONE);
        tvCompanyName.setText(apiClient.getOrganization());
        updateRoleBadge();

        if (token == null) return;

        apiClient.getProfile(token, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject user) {
                if (isFinishing() || isDestroyed()) return;

                String firstName = user.optString("firstName", "");
                String lastName = user.optString("lastName", "");
                String email = user.optString("email", savedEmail);
                if (email == null || email.trim().isEmpty()) {
                    email = savedEmail;
                }
                String photoUrl = user.optString("profilePhoto", "");
                if (photoUrl.isEmpty()) {
                    photoUrl = user.optString("profileImage", "");
                }

                String fullName = (firstName + " " + lastName).trim();
                if (fullName.isEmpty()) {
                    fullName = apiClient.getFullName();
                }
                tvProfileName.setText(fullName);
                tvProfileEmail.setText(email);
                tvProfileInitials.setText(apiClient.getUserInitials());

                if (photoUrl != null && !photoUrl.trim().isEmpty()) {
                    loadAvatarBitmap(photoUrl.trim());
                } else {
                    ivProfileAvatar.setVisibility(View.GONE);
                    tvProfileInitials.setVisibility(View.VISIBLE);
                }

                // Organization / Company Name
                String resolvedOrgName = null;
                if (user.has("company") && !user.isNull("company")) {
                    JSONObject compObj = user.optJSONObject("company");
                    if (compObj != null && compObj.has("name")) {
                        resolvedOrgName = compObj.optString("name", "");
                    }
                }
                if ((resolvedOrgName == null || resolvedOrgName.isEmpty()) && user.has("companyName")) {
                    resolvedOrgName = user.optString("companyName", "");
                }
                if ((resolvedOrgName == null || resolvedOrgName.isEmpty()) && user.has("organization")) {
                    JSONObject orgObj = user.optJSONObject("organization");
                    if (orgObj != null && orgObj.has("name")) {
                        resolvedOrgName = orgObj.optString("name", "");
                    } else {
                        resolvedOrgName = user.optString("organization", "");
                    }
                }
                if ((resolvedOrgName == null || resolvedOrgName.isEmpty()) && user.has("organizationName")) {
                    resolvedOrgName = user.optString("organizationName", "");
                }
                if (resolvedOrgName == null || resolvedOrgName.isEmpty() || "acmecorp".equalsIgnoreCase(resolvedOrgName) || "null".equalsIgnoreCase(resolvedOrgName)) {
                    resolvedOrgName = apiClient.getOrganization();
                }
                if (resolvedOrgName == null || resolvedOrgName.isEmpty() || "acmecorp".equalsIgnoreCase(resolvedOrgName) || "null".equalsIgnoreCase(resolvedOrgName)) {
                    resolvedOrgName = "GlobizHub Inc.";
                }
                tvCompanyName.setText(resolvedOrgName);
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
                        ivProfileAvatar.setImageBitmap(bitmap);
                        ivProfileAvatar.setVisibility(View.VISIBLE);
                        tvProfileInitials.setVisibility(View.GONE);
                    }
                });
            } catch (Exception ignored) {
            }
        });
    }

    private void confirmSignOut() {
        new AlertDialog.Builder(this)
                .setTitle("Sign Out")
                .setMessage("Are you sure you want to sign out?")
                .setPositiveButton("Sign Out", (dialog, which) -> executeSignOut())
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void executeSignOut() {
        apiClient.clearAuth();
        Intent intent = new Intent(this, SignInActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
