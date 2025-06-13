package com.zplus.qrcheckin.presentation.scanner

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.model.CheckinType
import com.zplus.qrcheckin.domain.model.Event
import com.zplus.qrcheckin.utils.scanner.CameraPermission
import com.zplus.qrcheckin.utils.scanner.CameraPreview

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QRScannerScreen(
    modifier: Modifier = Modifier,
    viewModel: QRScannerViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF111827))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header with Network Status
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "QR Scanner",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Staff Portal",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    // Network Status Indicator
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(
                                if (uiState.isConnected) Color(0xFF10B981) else Color(0xFFEF4444),
                                CircleShape
                            )
                    )
                    
                    Text(
                        text = if (uiState.isConnected) "Online" else "Offline",
                        fontSize = 12.sp,
                        color = if (uiState.isConnected) Color(0xFF10B981) else Color(0xFFEF4444),
                        modifier = Modifier.padding(start = 4.dp)
                    )
                    
                    // Queued Operations Count
                    if (uiState.queuedOperationsCount > 0) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = Color(0xFFEF4444)
                            ),
                            modifier = Modifier.padding(start = 4.dp)
                        ) {
                            Text(
                                text = "${uiState.queuedOperationsCount} queued",
                                fontSize = 10.sp,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }
            
            IconButton(
                onClick = { /* Settings */ },
                modifier = Modifier
                    .background(
                        Color.White.copy(alpha = 0.1f),
                        CircleShape
                    )
            ) {
                Icon(
                    Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = Color.White
                )
            }
        }
        
        // Event Selection
        uiState.events.let { events ->
            if (events.isNotEmpty()) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF1F2937)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Current Event",
                            color = Color.White,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        
                        ExposedDropdownMenuBox(
                            expanded = uiState.isEventDropdownExpanded,
                            onExpandedChange = { viewModel.setEventDropdownExpanded(it) }
                        ) {
                            OutlinedTextField(
                                value = uiState.selectedEvent?.name ?: "Select Event",
                                onValueChange = { },
                                readOnly = true,
                                trailingIcon = {
                                    ExposedDropdownMenuDefaults.TrailingIcon(
                                        expanded = uiState.isEventDropdownExpanded
                                    )
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = Color(0xFF3B82F6),
                                    unfocusedBorderColor = Color.Gray
                                )
                            )
                            
                            ExposedDropdownMenu(
                                expanded = uiState.isEventDropdownExpanded,
                                onDismissRequest = { viewModel.setEventDropdownExpanded(false) }
                            ) {
                                events.forEach { event ->
                                    DropdownMenuItem(
                                        text = { Text(event.name) },
                                        onClick = {
                                            viewModel.selectEvent(event)
                                            viewModel.setEventDropdownExpanded(false)
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Camera Scanner
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp)
                .padding(bottom = 24.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFF1F2937)
            )
        ) {
            CameraPermission {
                CameraPreview(
                    onQRCodeDetected = { qrCode ->
                        viewModel.handleQRCodeScan(qrCode)
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
        
        // Action Buttons
        if (uiState.selectedEvent != null) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Button(
                    onClick = { viewModel.processCheckin() },
                    enabled = !uiState.isLoading && uiState.scannedQRCode.isNotEmpty(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF10B981)
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = Color.White
                        )
                    } else {
                        Icon(Icons.Default.Login, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Check In")
                    }
                }
                
                Button(
                    onClick = { viewModel.processCheckout() },
                    enabled = !uiState.isLoading && uiState.scannedQRCode.isNotEmpty(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFEF4444)
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = Color.White
                        )
                    } else {
                        Icon(Icons.Default.Logout, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Check Out")
                    }
                }
            }
        }
        
        // Status Message
        uiState.statusMessage?.let { message ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (uiState.isError) Color(0xFFEF4444) else Color(0xFF10B981)
                )
            ) {
                Text(
                    text = message,
                    color = Color.White,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
        
        // Recent Scans
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFF1F2937)
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Recent Scans",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.height(200.dp)
                ) {
                    items(uiState.recentLogs) { log ->
                        RecentScanItem(log)
                    }
                }
            }
        }
    }
}

@Composable
private fun RecentScanItem(log: CheckinLog) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF374151)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(
                            if (log.type == CheckinType.CHECKIN) Color(0xFF10B981) else Color(0xFFEF4444),
                            CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        if (log.type == CheckinType.CHECKIN) Icons.Default.Check else Icons.Default.Close,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column {
                    Text(
                        text = log.user?.let { "${it.firstName} ${it.lastName}" } ?: "Unknown User",
                        color = Color.White,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "${log.type.name.lowercase().replaceFirstChar { it.uppercase() }} • ${log.event?.name ?: "Unknown Event"}",
                        color = Color.Gray,
                        fontSize = 12.sp
                    )
                }
            }
            
            Text(
                text = if (log.type == CheckinType.CHECKIN) "Success" else "Completed",
                color = if (log.type == CheckinType.CHECKIN) Color(0xFF10B981) else Color(0xFFEF4444),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.QrCode,
                    contentDescription = null,
                    tint = Color(0xFF60A5FA),
                    modifier = Modifier.size(24.dp)
                )
                Text(
                    "QR Scanner",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(start = 12.dp)
                )
            }
            
            Row {
                Text(
                    "Staff App",
                    color = Color(0xFF9CA3AF),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(end = 16.dp)
                )
                Icon(
                    Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = Color(0xFF9CA3AF),
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        // Scanner Frame
        Box(
            modifier = Modifier
                .size(250.dp)
                .border(
                    2.dp,
                    Color(0xFF3B82F6),
                    RoundedCornerShape(12.dp)
                )
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    Icons.Default.QrCode,
                    contentDescription = null,
                    tint = Color(0xFF60A5FA),
                    modifier = Modifier.size(64.dp)
                )
                Text(
                    "Position QR code here",
                    color = Color(0xFF9CA3AF),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Instructions
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(bottom = 24.dp)
        ) {
            Text(
                "Scan Member QR Code",
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                "Align the QR code within the frame to check-in/check-out",
                color = Color(0xFF9CA3AF),
                fontSize = 14.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        // Event Selection
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp)
        ) {
            Text(
                "Current Event",
                color = Color(0xFF9CA3AF),
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            var expanded by remember { mutableStateOf(false) }
            
            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = !expanded }
            ) {
                OutlinedTextField(
                    value = selectedEvent?.name ?: "Select Event",
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF3B82F6),
                        unfocusedBorderColor = Color(0xFF4B5563),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedContainerColor = Color(0xFF1F2937),
                        unfocusedContainerColor = Color(0xFF1F2937)
                    ),
                    modifier = Modifier
                        .menuAnchor()
                        .fillMaxWidth()
                )
                
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier.background(Color(0xFF1F2937))
                ) {
                    events.forEach { event ->
                        DropdownMenuItem(
                            text = { 
                                Text(
                                    event.name,
                                    color = Color.White
                                ) 
                            },
                            onClick = {
                                onEventSelected(event)
                                expanded = false
                            }
                        )
                    }
                }
            }
        }

        // Action Buttons
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Button(
                onClick = onCheckin,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF059669)
                ),
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
            ) {
                Icon(
                    Icons.Default.Login,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    "Check In",
                    modifier = Modifier.padding(start = 8.dp)
                )
            }
            
            Button(
                onClick = onCheckout,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFDC2626)
                ),
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
            ) {
                Icon(
                    Icons.Default.Logout,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    "Check Out",
                    modifier = Modifier.padding(start = 8.dp)
                )
            }
        }

        // Recent Scans
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                "Recent Scans",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(recentLogs) { log ->
                    RecentScanItem(log = log)
                }
            }
        }
    }
}

@Composable
private fun RecentScanItem(
    log: CheckinLog,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1F2937)
        ),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(
                            if (log.type == CheckinType.CHECKIN) Color(0xFF10B981) else Color(0xFFEF4444)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        if (log.type == CheckinType.CHECKIN) Icons.Default.Check else Icons.Default.Close,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
                
                Column(
                    modifier = Modifier.padding(start = 12.dp)
                ) {
                    Text(
                        log.user?.let { "${it.firstName} ${it.lastName}" } ?: "Unknown User",
                        color = Color.White,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        "${log.type.name.lowercase().replaceFirstChar { it.uppercase() }} • ${formatTimeAgo(log.timestamp)}",
                        color = Color(0xFF9CA3AF),
                        fontSize = 12.sp
                    )
                }
            }
            
            Text(
                if (log.type == CheckinType.CHECKIN) "Success" else "Completed",
                color = if (log.type == CheckinType.CHECKIN) Color(0xFF10B981) else Color(0xFFEF4444),
                fontSize = 12.sp
            )
        }
    }
}

private fun formatTimeAgo(timestamp: java.util.Date): String {
    val now = System.currentTimeMillis()
    val diff = now - timestamp.time
    val minutes = diff / (1000 * 60)
    return when {
        minutes < 1 -> "Just now"
        minutes < 60 -> "${minutes} mins ago"
        else -> "${minutes / 60} hours ago"
    }
}