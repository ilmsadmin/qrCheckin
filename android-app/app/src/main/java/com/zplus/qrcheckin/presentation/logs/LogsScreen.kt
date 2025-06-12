package com.zplus.qrcheckin.presentation.logs

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
import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.model.CheckinType
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogsScreen(
    logs: List<CheckinLog>,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF111827))
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Check-in Logs",
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            
            IconButton(
                onClick = onRefresh
            ) {
                Icon(
                    Icons.Default.Refresh,
                    contentDescription = "Refresh",
                    tint = Color(0xFF60A5FA)
                )
            }
        }
        
        // Summary Cards
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SummaryCard(
                title = "Today's Check-ins",
                value = logs.count { 
                    it.type == CheckinType.CHECKIN && 
                    isToday(it.timestamp)
                }.toString(),
                icon = Icons.Default.Login,
                color = Color(0xFF10B981),
                modifier = Modifier.weight(1f)
            )
            
            SummaryCard(
                title = "Currently In",
                value = calculateCurrentlyIn(logs).toString(),
                icon = Icons.Default.People,
                color = Color(0xFF3B82F6),
                modifier = Modifier.weight(1f)
            )
        }
        
        // Logs List
        if (logs.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Default.List,
                        contentDescription = null,
                        tint = Color(0xFF4B5563),
                        modifier = Modifier.size(64.dp)
                    )
                    Text(
                        "No logs available",
                        color = Color(0xFF9CA3AF),
                        fontSize = 16.sp,
                        modifier = Modifier.padding(top = 16.dp)
                    )
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(logs) { log ->
                    LogItem(log = log)
                }
            }
        }
    }
}

@Composable
private fun SummaryCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1F2937)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(32.dp)
            )
            Text(
                value,
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 8.dp)
            )
            Text(
                title,
                color = Color(0xFF9CA3AF),
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}

@Composable
private fun LogItem(
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
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Status Icon
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(
                        if (log.type == CheckinType.CHECKIN) Color(0xFF10B981) else Color(0xFFEF4444)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    if (log.type == CheckinType.CHECKIN) Icons.Default.Login else Icons.Default.Logout,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
            
            // User and Event Info
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 16.dp)
            ) {
                Text(
                    log.user?.let { "${it.firstName} ${it.lastName}" } ?: "Unknown User",
                    color = Color.White,
                    fontWeight = FontWeight.Medium,
                    fontSize = 16.sp
                )
                Text(
                    log.event?.name ?: "Unknown Event",
                    color = Color(0xFF9CA3AF),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
                Text(
                    "${log.type.name.lowercase().replaceFirstChar { it.uppercase() }} • ${formatDateTime(log.timestamp)}",
                    color = Color(0xFF6B7280),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
            
            // Status Badge
            Surface(
                color = if (log.type == CheckinType.CHECKIN) 
                    Color(0xFF10B981).copy(alpha = 0.1f) else 
                    Color(0xFFEF4444).copy(alpha = 0.1f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    if (log.type == CheckinType.CHECKIN) "IN" else "OUT",
                    color = if (log.type == CheckinType.CHECKIN) Color(0xFF10B981) else Color(0xFFEF4444),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}

private fun isToday(date: Date): Boolean {
    val today = Calendar.getInstance()
    val logDate = Calendar.getInstance().apply { time = date }
    return today.get(Calendar.YEAR) == logDate.get(Calendar.YEAR) &&
           today.get(Calendar.DAY_OF_YEAR) == logDate.get(Calendar.DAY_OF_YEAR)
}

private fun calculateCurrentlyIn(logs: List<CheckinLog>): Int {
    // Simple calculation: count users who have checked in but not checked out
    val userStatuses = mutableMapOf<String, CheckinType>()
    
    logs.sortedBy { it.timestamp }.forEach { log ->
        userStatuses[log.userId] = log.type
    }
    
    return userStatuses.values.count { it == CheckinType.CHECKIN }
}

private fun formatDateTime(timestamp: Date): String {
    val format = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault())
    return format.format(timestamp)
}