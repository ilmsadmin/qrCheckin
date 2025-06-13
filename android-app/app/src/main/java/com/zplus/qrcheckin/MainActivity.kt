package com.zplus.qrcheckin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.zplus.qrcheckin.domain.model.*
import com.zplus.qrcheckin.presentation.navigation.BottomNavItem
import com.zplus.qrcheckin.presentation.navigation.QRCheckinBottomBar
import com.zplus.qrcheckin.presentation.scanner.QRScannerScreen
import com.zplus.qrcheckin.presentation.logs.LogsScreen
import com.zplus.qrcheckin.presentation.stats.StatsScreen
import com.zplus.qrcheckin.presentation.profile.ProfileScreen
import com.zplus.qrcheckin.ui.theme.QrCheckinTheme
import dagger.hilt.android.AndroidEntryPoint
import java.util.*

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            QrCheckinTheme {
                QRCheckinApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QRCheckinApp() {
    var currentRoute by remember { mutableStateOf(BottomNavItem.Scanner.route) }
    
    // Mock data for demonstration
    val mockEvents = remember {
        listOf(
            Event(
                id = "1",
                name = "Fitness Class - Room A",
                description = "Morning fitness session",
                startTime = Date(),
                endTime = Date(System.currentTimeMillis() + 3600000),
                location = "Room A",
                maxCapacity = 20,
                isActive = true,
                clubId = "club1"
            ),
            Event(
                id = "2",
                name = "Yoga Session - Studio B",
                description = "Relaxing yoga session",
                startTime = Date(),
                endTime = Date(System.currentTimeMillis() + 3600000),
                location = "Studio B",
                maxCapacity = 15,
                isActive = true,
                clubId = "club1"
            ),
            Event(
                id = "3",
                name = "Swimming Pool Access",
                description = "General pool access",
                startTime = Date(),
                endTime = Date(System.currentTimeMillis() + 7200000),
                location = "Pool",
                maxCapacity = 50,
                isActive = true,
                clubId = "club1"
            )
        )
    }
    
    val mockUser = User(
        id = "user1",
        email = "john.doe@example.com",
        username = "johndoe",
        firstName = "John",
        lastName = "Doe",
        role = Role.USER,
        isActive = true
    )
    
    val mockRecentLogs = remember {
        listOf(
            CheckinLog(
                id = "log1",
                type = CheckinType.CHECKIN,
                timestamp = Date(System.currentTimeMillis() - 120000), // 2 minutes ago
                location = null,
                notes = null,
                userId = "user1",
                eventId = "1",
                subscriptionId = "sub1",
                qrCodeId = "qr1",
                user = mockUser,
                event = mockEvents[0]
            ),
            CheckinLog(
                id = "log2",
                type = CheckinType.CHECKOUT,
                timestamp = Date(System.currentTimeMillis() - 300000), // 5 minutes ago
                location = null,
                notes = null,
                userId = "user2",
                eventId = "2",
                subscriptionId = "sub2",
                qrCodeId = "qr2",
                user = mockUser.copy(id = "user2", firstName = "Jane", lastName = "Smith"),
                event = mockEvents[1]
            ),
            CheckinLog(
                id = "log3",
                type = CheckinType.CHECKIN,
                timestamp = Date(System.currentTimeMillis() - 480000), // 8 minutes ago
                location = null,
                notes = null,
                userId = "user3",
                eventId = "1",
                subscriptionId = "sub3",
                qrCodeId = "qr3",
                user = mockUser.copy(id = "user3", firstName = "Mike", lastName = "Johnson"),
                event = mockEvents[0]
            )
        )
    }
    
    var selectedEvent by remember { mutableStateOf(mockEvents.firstOrNull()) }
    
    Scaffold(
        containerColor = Color(0xFF111827),
        bottomBar = {
            QRCheckinBottomBar(
                currentRoute = currentRoute,
                onNavigate = { route -> currentRoute = route }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (currentRoute) {
                BottomNavItem.Scanner.route -> {
                    QRScannerScreen(
                        events = mockEvents,
                        recentLogs = mockRecentLogs,
                        selectedEvent = selectedEvent,
                        onEventSelected = { event -> selectedEvent = event },
                        onCheckin = { 
                            // TODO: Handle checkin
                        },
                        onCheckout = { 
                            // TODO: Handle checkout
                        }
                    )
                }
                BottomNavItem.Logs.route -> {
                    LogsScreen(
                        logs = mockRecentLogs,
                        onRefresh = {
                            // TODO: Refresh logs
                        }
                    )
                }
                BottomNavItem.Stats.route -> {
                    StatsScreen(
                        logs = mockRecentLogs,
                        events = mockEvents
                    )
                }
                BottomNavItem.Profile.route -> {
                    ProfileScreen(
                        user = mockUser,
                        onLogout = {
                            // TODO: Handle logout
                        }
                    )
                }
            }
        }
    }
}