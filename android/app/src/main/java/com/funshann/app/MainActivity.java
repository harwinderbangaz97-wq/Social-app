package com.funshann.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "FunshannMainActivity";
    private static final String APP_ASSET_URL = "https://appassets.androidplatform.net/assets/public/index.html";

    private static final int REQUEST_FILE_CHOOSER = 1001;
    private static final int PERMISSION_REQUEST_CAMERA = 2001;
    private static final int PERMISSION_REQUEST_WEB_RESOURCES = 2002;
    private static final int PERMISSION_REQUEST_LOCATION = 2003;

    private WebView webView;
    private ConnectivityManager connectivityManager;
    private ConnectivityManager.NetworkCallback networkCallback;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private boolean isInitialPageLoaded = false;

    // File Chooser state for Android WebView
    private ValueCallback<Uri[]> mFilePathCallback;
    private Uri mCameraPhotoUri;
    private Uri mCameraVideoUri;
    private PermissionRequest mPendingWebPermissionRequest;
    private GeolocationPermissions.Callback mPendingGeoCallback;
    private String mPendingGeoOrigin;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Native Android Edge-to-Edge full-screen configuration
        enableEdgeToEdge();

        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        configureWebView();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            // Load local asset package on fresh cold start
            webView.loadUrl(APP_ASSET_URL);
        }

        // Proactively request runtime camera and audio permissions if needed
        checkAndRequestAppPermissions();

        // Register resilient network state listener
        registerNetworkCallback();
    }

    private void checkAndRequestAppPermissions() {
        try {
            List<String> permissions = new ArrayList<>();
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.CAMERA);
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.RECORD_AUDIO);
            }
            if (!permissions.isEmpty()) {
                ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), PERMISSION_REQUEST_CAMERA);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking runtime permissions", e);
        }
    }

    private void enableEdgeToEdge() {
        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // Transparent system bars so content extends edge-to-edge
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        WindowInsetsControllerCompat insetsController =
            WindowCompat.getInsetsController(window, window.getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(true);
            insetsController.setAppearanceLightNavigationBars(true);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setGeolocationEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // Resilient cache configuration to prevent ERR_NETWORK_CHANGED from breaking local assets
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setLoadsImagesAutomatically(true);
        settings.setBlockNetworkImage(false);
        settings.setBlockNetworkLoads(false);

        // Enable hardware acceleration
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setBackgroundColor(Color.parseColor("#0F172A"));

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("WebViewConsole", consoleMessage.message() + " -- From line "
                        + consoleMessage.lineNumber() + " of " + consoleMessage.sourceId());
                return true;
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                mainHandler.post(() -> {
                    mPendingWebPermissionRequest = request;
                    List<String> neededPermissions = new ArrayList<>();
                    for (String resource : request.getResources()) {
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA)
                                    != PackageManager.PERMISSION_GRANTED) {
                                neededPermissions.add(Manifest.permission.CAMERA);
                            }
                        }
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                                    != PackageManager.PERMISSION_GRANTED) {
                                neededPermissions.add(Manifest.permission.RECORD_AUDIO);
                            }
                        }
                    }

                    if (neededPermissions.isEmpty()) {
                        request.grant(request.getResources());
                        mPendingWebPermissionRequest = null;
                    } else {
                        ActivityCompat.requestPermissions(
                                MainActivity.this,
                                neededPermissions.toArray(new String[0]),
                                PERMISSION_REQUEST_WEB_RESOURCES
                        );
                    }
                });
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                if (mPendingWebPermissionRequest != null) {
                    mPendingWebPermissionRequest = null;
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION)
                        == PackageManager.PERMISSION_GRANTED ||
                    ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_COARSE_LOCATION)
                        == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                } else {
                    mPendingGeoCallback = callback;
                    mPendingGeoOrigin = origin;
                    ActivityCompat.requestPermissions(
                            MainActivity.this,
                            new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION},
                            PERMISSION_REQUEST_LOCATION
                    );
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mFilePathCallback != null) {
                    mFilePathCallback.onReceiveValue(null);
                    mFilePathCallback = null;
                }
                mFilePathCallback = filePathCallback;

                try {
                    boolean isCapture = fileChooserParams.isCaptureEnabled();
                    String[] acceptTypes = fileChooserParams.getAcceptTypes();
                    boolean isVideoOnly = false;
                    boolean isImageOnly = false;

                    if (acceptTypes != null && acceptTypes.length > 0) {
                        for (String type : acceptTypes) {
                            if (type != null) {
                                if (type.contains("video") && !type.contains("image")) {
                                    isVideoOnly = true;
                                } else if (type.contains("image") && !type.contains("video")) {
                                    isImageOnly = true;
                                }
                            }
                        }
                    }

                    if (isCapture) {
                        if (isVideoOnly) {
                            launchCameraVideoIntent();
                        } else {
                            launchCameraPhotoIntent();
                        }
                    } else {
                        launchGalleryPickerIntent(acceptTypes, fileChooserParams.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                    }
                    return true;
                } catch (Exception e) {
                    Log.e(TAG, "Error opening file chooser in WebView", e);
                    if (mFilePathCallback != null) {
                        mFilePathCallback.onReceiveValue(null);
                        mFilePathCallback = null;
                    }
                    return false;
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if (scheme != null && (scheme.equals("tel") || scheme.equals("mailto") || scheme.equals("whatsapp") || scheme.equals("sms") || scheme.equals("intent"))) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Error launching external scheme: " + uri, e);
                        return true;
                    }
                }
                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                isInitialPageLoaded = true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                // Prevent Chromium from displaying default browser error page
                if (request != null && !request.isForMainFrame()) {
                    return;
                }

                if (isInitialPageLoaded) {
                    Log.w(TAG, "Main frame error ignored to preserve active UI: " + (error != null ? error.getDescription() : "unknown"));
                    return;
                }

                mainHandler.postDelayed(() -> {
                    if (webView != null && !isInitialPageLoaded) {
                        webView.loadUrl(APP_ASSET_URL);
                    }
                }, 1000);
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (isInitialPageLoaded) {
                    return;
                }
                mainHandler.postDelayed(() -> {
                    if (webView != null && !isInitialPageLoaded) {
                        webView.loadUrl(APP_ASSET_URL);
                    }
                }, 1000);
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                // Do not navigate away from the SPA for external HTTP errors
            }

            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                Log.e(TAG, "WebView render process crashed, recovering gracefully");
                isInitialPageLoaded = false;
                if (webView != null) {
                    webView.loadUrl(APP_ASSET_URL);
                }
                return true;
            }
        });
    }

    private void launchCameraPhotoIntent() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, PERMISSION_REQUEST_CAMERA);
            return;
        }

        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
            File photoFile = null;
            try {
                photoFile = createImageFile();
            } catch (IOException ex) {
                Log.e(TAG, "Unable to create image file for camera capture", ex);
            }

            if (photoFile != null) {
                mCameraPhotoUri = FileProvider.getUriForFile(
                        this,
                        getApplicationContext().getPackageName() + ".fileprovider",
                        photoFile
                );
                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, mCameraPhotoUri);
                takePictureIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                startActivityForResult(takePictureIntent, REQUEST_FILE_CHOOSER);
            } else {
                startActivityForResult(takePictureIntent, REQUEST_FILE_CHOOSER);
            }
        } else {
            // If no camera app found, fallback to gallery intent
            launchGalleryPickerIntent(new String[]{"image/*"}, false);
        }
    }

    private void launchCameraVideoIntent() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO},
                    PERMISSION_REQUEST_CAMERA
            );
            return;
        }

        Intent takeVideoIntent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
        if (takeVideoIntent.resolveActivity(getPackageManager()) != null) {
            File videoFile = null;
            try {
                videoFile = createVideoFile();
            } catch (IOException ex) {
                Log.e(TAG, "Unable to create video file for camera capture", ex);
            }

            if (videoFile != null) {
                mCameraVideoUri = FileProvider.getUriForFile(
                        this,
                        getApplicationContext().getPackageName() + ".fileprovider",
                        videoFile
                );
                takeVideoIntent.putExtra(MediaStore.EXTRA_OUTPUT, mCameraVideoUri);
                takeVideoIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                startActivityForResult(takeVideoIntent, REQUEST_FILE_CHOOSER);
            } else {
                startActivityForResult(takeVideoIntent, REQUEST_FILE_CHOOSER);
            }
        } else {
            launchGalleryPickerIntent(new String[]{"video/*"}, false);
        }
    }

    private void launchGalleryPickerIntent(String[] acceptTypes, boolean allowMultiple) {
        Intent galleryIntent = new Intent(Intent.ACTION_GET_CONTENT);
        galleryIntent.addCategory(Intent.CATEGORY_OPENABLE);

        if (acceptTypes != null && acceptTypes.length > 0 && !acceptTypes[0].isEmpty()) {
            if (acceptTypes.length == 1) {
                galleryIntent.setType(acceptTypes[0]);
            } else {
                galleryIntent.setType("*/*");
                galleryIntent.putExtra(Intent.EXTRA_MIME_TYPES, acceptTypes);
            }
        } else {
            galleryIntent.setType("image/*,video/*");
        }

        if (allowMultiple) {
            galleryIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        }

        Intent chooserIntent = Intent.createChooser(galleryIntent, "Select Media");
        startActivityForResult(chooserIntent, REQUEST_FILE_CHOOSER);
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        if (storageDir == null) {
            storageDir = getCacheDir();
        }
        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }

    private File createVideoFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String videoFileName = "VID_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_MOVIES);
        if (storageDir == null) {
            storageDir = getCacheDir();
        }
        return File.createTempFile(videoFileName, ".mp4", storageDir);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == REQUEST_FILE_CHOOSER) {
            if (mFilePathCallback == null) {
                return;
            }

            Uri[] results = null;

            if (resultCode == RESULT_OK) {
                if (data == null || (data.getData() == null && data.getClipData() == null)) {
                    // Camera photo or video capture output
                    if (mCameraPhotoUri != null) {
                        results = new Uri[]{mCameraPhotoUri};
                    } else if (mCameraVideoUri != null) {
                        results = new Uri[]{mCameraVideoUri};
                    }
                } else {
                    // Selected from Gallery / Photo Picker
                    if (data.getClipData() != null) {
                        ClipData clipData = data.getClipData();
                        int count = clipData.getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = clipData.getItemAt(i).getUri();
                        }
                    } else if (data.getData() != null) {
                        results = new Uri[]{data.getData()};
                    }
                }
            }

            mFilePathCallback.onReceiveValue(results);
            mFilePathCallback = null;
            mCameraPhotoUri = null;
            mCameraVideoUri = null;
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == PERMISSION_REQUEST_CAMERA) {
            boolean cameraGranted = false;
            for (int i = 0; i < permissions.length; i++) {
                if (Manifest.permission.CAMERA.equals(permissions[i]) && grantResults[i] == PackageManager.PERMISSION_GRANTED) {
                    cameraGranted = true;
                    break;
                }
            }
            if (mPendingWebPermissionRequest != null) {
                if (cameraGranted) {
                    mPendingWebPermissionRequest.grant(mPendingWebPermissionRequest.getResources());
                } else {
                    mPendingWebPermissionRequest.deny();
                }
                mPendingWebPermissionRequest = null;
            }
            if (mFilePathCallback != null) {
                if (cameraGranted) {
                    launchCameraPhotoIntent();
                } else {
                    mFilePathCallback.onReceiveValue(null);
                    mFilePathCallback = null;
                }
            }
        } else if (requestCode == PERMISSION_REQUEST_WEB_RESOURCES) {
            if (mPendingWebPermissionRequest != null) {
                List<String> grantedResources = new ArrayList<>();
                for (String resource : mPendingWebPermissionRequest.getResources()) {
                    if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                            grantedResources.add(resource);
                        }
                    }
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                            grantedResources.add(resource);
                        }
                    }
                }
                if (!grantedResources.isEmpty()) {
                    mPendingWebPermissionRequest.grant(grantedResources.toArray(new String[0]));
                } else {
                    mPendingWebPermissionRequest.deny();
                }
                mPendingWebPermissionRequest = null;
            }
        } else if (requestCode == PERMISSION_REQUEST_LOCATION) {
            if (mPendingGeoCallback != null && mPendingGeoOrigin != null) {
                boolean granted = false;
                for (int res : grantResults) {
                    if (res == PackageManager.PERMISSION_GRANTED) {
                        granted = true;
                        break;
                    }
                }
                mPendingGeoCallback.invoke(mPendingGeoOrigin, granted, false);
                mPendingGeoCallback = null;
                mPendingGeoOrigin = null;
            }
        }
    }

    private void registerNetworkCallback() {
        try {
            connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (connectivityManager == null) return;

            NetworkRequest request = new NetworkRequest.Builder()
                    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    .build();

            networkCallback = new ConnectivityManager.NetworkCallback() {
                @Override
                public void onAvailable(@NonNull Network network) {
                    super.onAvailable(network);
                    mainHandler.post(() -> {
                        if (webView != null) {
                            webView.evaluateJavascript(
                                "try { window.dispatchEvent(new Event('online')); if (window.__onFunshannNetworkRecovered) { window.__onFunshannNetworkRecovered(); } } catch(e){}",
                                null
                            );
                        }
                    });
                }

                @Override
                public void onLost(@NonNull Network network) {
                    super.onLost(network);
                    mainHandler.post(() -> {
                        if (webView != null) {
                            webView.evaluateJavascript(
                                "try { window.dispatchEvent(new Event('offline')); } catch(e){}",
                                null
                            );
                        }
                    });
                }
            };

            connectivityManager.registerNetworkCallback(request, networkCallback);
        } catch (Exception e) {
            Log.e(TAG, "Failed to register network callback", e);
        }
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onRestoreInstanceState(@NonNull Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        if (webView != null) {
            webView.restoreState(savedInstanceState);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (connectivityManager != null && networkCallback != null) {
            try {
                connectivityManager.unregisterNetworkCallback(networkCallback);
            } catch (Exception e) {
                Log.e(TAG, "Failed to unregister network callback", e);
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                "(function(){ try { if (window.__funshannHandleBack && typeof window.__funshannHandleBack === 'function') { return window.__funshannHandleBack(); } } catch(e){} return false; })()",
                value -> {
                    if ("true".equals(value)) {
                        // Handled natively by active camera modal / in-app view
                        return;
                    }
                    if (webView.canGoBack()) {
                        webView.goBack();
                    } else {
                        MainActivity.super.onBackPressed();
                    }
                }
            );
            return;
        }
        super.onBackPressed();
    }
}
