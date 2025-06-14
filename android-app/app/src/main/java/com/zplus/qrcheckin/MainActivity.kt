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
import androidx.hilt.navigation.compose.hiltViewModel
import com.zplus.qrcheckin.presentation.auth.AuthViewModel
import com.zplus.qrcheckin.presentation.auth.LoginScreen
import com.zplus.qrcheckin.presentation.navigation.BottomNavItem
import com.zplus.qrcheckin.presentation.navigation.QRCheckinBottomBar
import com.zplus.qrcheckin.presentation.scanner.QRScannerScreen
import com.zplus.qrcheckin.presentation.logs.LogsScreen
import com.zplus.qrcheckin.presentation.stats.StatsScreen
import com.zplus.qrcheckin.presentation.profile.ProfileScreen
import com.zplus.qrcheckin.ui.theme.QrCheckinTheme
import dagger.hilt.android.AndroidEntryPoint

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
fun QRCheckinApp(
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val authUiState by authViewModel.uiState.collectAsState()
    var currentRoute by remember { mutableStateOf(BottomNavItem.Scanner.route) }
    
    if (!authUiState.isLoggedIn) {
        // Show login screen
        LoginScreen(
            onLoginSuccess = {
                // Navigate to main app after successful login
            }
        )
    } else {
        // Show main app
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
                        QRScannerScreen()
                    }
                    BottomNavItem.Logs.route -> {
                        LogsScreen()
                    }
                    BottomNavItem.Stats.route -> {
                        StatsScreen()
                    }
                    BottomNavItem.Profile.route -> {
                        ProfileScreen(
                            onLogout = {
                                authViewModel.logout()
                            }
                        )
                    }
                }
            }
        }
    }
}