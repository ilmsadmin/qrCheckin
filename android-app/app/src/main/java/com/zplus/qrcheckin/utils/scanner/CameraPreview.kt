package com.zplus.qrcheckin.utils.scanner

import android.content.Context
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

@Composable
fun CameraPreview(
    onQRCodeDetected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    
    var previewView: PreviewView? by remember { mutableStateOf(null) }
    val cameraExecutor: ExecutorService = remember { Executors.newSingleThreadExecutor() }
    
    DisposableEffect(Unit) {
        onDispose {
            cameraExecutor.shutdown()
        }
    }
    
    Box(modifier = modifier) {
        AndroidView(
            factory = { ctx ->
                PreviewView(ctx).apply {
                    previewView = this
                    startCamera(
                        context = ctx,
                        lifecycleOwner = lifecycleOwner,
                        previewView = this,
                        onQRCodeDetected = onQRCodeDetected,
                        cameraExecutor = cameraExecutor
                    )
                }
            },
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(12.dp))
        )
        
        // Scanning overlay
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Scanning frame
            Box(
                modifier = Modifier
                    .size(250.dp)
                    .background(
                        Color.Transparent,
                        RoundedCornerShape(12.dp)
                    )
            ) {
                // Corner indicators
                repeat(4) { index ->
                    val (alignment, rotation) = when (index) {
                        0 -> Alignment.TopStart to 0f
                        1 -> Alignment.TopEnd to 90f
                        2 -> Alignment.BottomEnd to 180f
                        else -> Alignment.BottomStart to 270f
                    }
                    
                    Box(
                        modifier = Modifier
                            .align(alignment)
                            .size(30.dp)
                            .background(
                                Color.White.copy(alpha = 0.8f),
                                RoundedCornerShape(4.dp)
                            )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = Color.Black.copy(alpha = 0.7f)
                )
            ) {
                Text(
                    text = "Position QR code within the frame",
                    color = Color.White,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
    }
}

private fun startCamera(
    context: Context,
    lifecycleOwner: androidx.lifecycle.LifecycleOwner,
    previewView: PreviewView,
    onQRCodeDetected: (String) -> Unit,
    cameraExecutor: ExecutorService
) {
    val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
    
    cameraProviderFuture.addListener({
        val cameraProvider = cameraProviderFuture.get()
        
        val preview = Preview.Builder().build().also {
            it.setSurfaceProvider(previewView.surfaceProvider)
        }
        
        val imageAnalyzer = ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build()
            .also {
                it.setAnalyzer(cameraExecutor, QRCodeAnalyzer(onQRCodeDetected))
            }
        
        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
        
        try {
            cameraProvider.unbindAll()
            cameraProvider.bindToLifecycle(
                lifecycleOwner,
                cameraSelector,
                preview,
                imageAnalyzer
            )
        } catch (exc: Exception) {
            // Handle camera binding failure
        }
    }, ContextCompat.getMainExecutor(context))
}