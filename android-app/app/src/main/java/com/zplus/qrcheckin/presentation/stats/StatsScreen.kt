package com.zplus.qrcheckin.presentation.stats

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.model.CheckinType
import com.zplus.qrcheckin.domain.model.Event
import java.text.SimpleDateFormat
import java.util.*

data class EventStats(
    val event: Event,
    val totalCheckins: Int,
    val currentlyIn: Int,
    val peakHour: String
)

@Composable
fun StatsScreen(
    logs: List<CheckinLog>,
    events: List<Event>,
    modifier: Modifier = Modifier
) {
    val eventStats = remember(logs, events) {
        calculateEventStats(logs, events)
    }
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF111827))
            .padding(16.dp)
    ) {
        // Header
        Text(
            "Statistics",
            color = Color.White,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        // Overview Cards
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                OverviewSection(logs = logs)
            }
            
            item {
                Text(
                    "Event Statistics",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(vertical = 16.dp)
                )
            }
            
            items(eventStats) { stats ->
                EventStatsCard(stats = stats)
            }
        }
    }
}

@Composable
private fun OverviewSection(
    logs: List<CheckinLog>
) {
    Column {
        Text(
            "Today's Overview",
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatsCard(
                title = "Total Check-ins",
                value = logs.count { it.type == CheckinType.CHECKIN }.toString(),
                icon = Icons.Default.Login,
                color = Color(0xFF10B981),
                modifier = Modifier.weight(1f)
            )
            
            StatsCard(
                title = "Total Check-outs", 
                value = logs.count { it.type == CheckinType.CHECKOUT }.toString(),
                icon = Icons.Default.Logout,
                color = Color(0xFFEF4444),
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatsCard(
                title = "Unique Visitors",
                value = logs.distinctBy { it.userId }.size.toString(),
                icon = Icons.Default.People,
                color = Color(0xFF3B82F6),
                modifier = Modifier.weight(1f)
            )
            
            StatsCard(
                title = "Peak Hour",
                value = calculatePeakHour(logs),
                icon = Icons.Default.Schedule,
                color = Color(0xFF8B5CF6),
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun StatsCard(
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
                fontSize = 20.sp,
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
private fun EventStatsCard(
    stats: EventStats,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1F2937)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        stats.event.name,
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        stats.event.location ?: "No location",
                        color = Color(0xFF9CA3AF),
                        fontSize = 14.sp,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
                
                Icon(
                    Icons.Default.EventNote,
                    contentDescription = null,
                    tint = Color(0xFF60A5FA),
                    modifier = Modifier.size(24.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                StatItem(
                    label = "Total Check-ins",
                    value = stats.totalCheckins.toString(),
                    modifier = Modifier.weight(1f)
                )
                
                StatItem(
                    label = "Currently In",
                    value = stats.currentlyIn.toString(),
                    modifier = Modifier.weight(1f)
                )
                
                StatItem(
                    label = "Peak Hour",
                    value = stats.peakHour,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun StatItem(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            value,
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            label,
            color = Color(0xFF9CA3AF),
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 2.dp)
        )
    }
}

private fun calculateEventStats(logs: List<CheckinLog>, events: List<Event>): List<EventStats> {
    return events.map { event ->
        val eventLogs = logs.filter { it.eventId == event.id }
        val checkinLogs = eventLogs.filter { it.type == CheckinType.CHECKIN }
        
        // Calculate currently in for this event
        val userStatuses = mutableMapOf<String, CheckinType>()
        eventLogs.sortedBy { it.timestamp }.forEach { log ->
            userStatuses[log.userId] = log.type
        }
        val currentlyIn = userStatuses.values.count { it == CheckinType.CHECKIN }
        
        // Calculate peak hour
        val peakHour = calculatePeakHour(checkinLogs)
        
        EventStats(
            event = event,
            totalCheckins = checkinLogs.size,
            currentlyIn = currentlyIn,
            peakHour = peakHour
        )
    }
}

private fun calculatePeakHour(logs: List<CheckinLog>): String {
    if (logs.isEmpty()) return "N/A"
    
    val hourCounts = mutableMapOf<Int, Int>()
    
    logs.forEach { log ->
        val calendar = Calendar.getInstance().apply { time = log.timestamp }
        val hour = calendar.get(Calendar.HOUR_OF_DAY)
        hourCounts[hour] = hourCounts.getOrDefault(hour, 0) + 1
    }
    
    val peakHour = hourCounts.maxByOrNull { it.value }?.key ?: return "N/A"
    
    return "${peakHour}:00"
}