package com.zplus.qrcheckin.presentation.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.zplus.qrcheckin.presentation.auth.AuthViewModel

@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val authUiState by authViewModel.uiState.collectAsState()
    val user = authUiState.user
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF111827))
            .padding(16.dp)
    ) {
        // Header
        Text(
            "Profile",
            color = Color.White,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 32.dp)
        )
        
        if (user != null) {
            // User Info Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF1F2937)
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Avatar
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF3B82F6)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "${user.firstName.firstOrNull()}${user.lastName.firstOrNull()}",
                            color = Color.White,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Name
                    Text(
                        "${user.firstName} ${user.lastName}",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    
                    // Role
                    Surface(
                        color = when (user.role.name) {
                            "ADMIN" -> Color(0xFFDC2626).copy(alpha = 0.1f)
                            "STAFF" -> Color(0xFF3B82F6).copy(alpha = 0.1f)
                            else -> Color(0xFF6B7280).copy(alpha = 0.1f)
                        },
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text(
                            user.role.name,
                            color = when (user.role.name) {
                                "ADMIN" -> Color(0xFFDC2626)
                                "STAFF" -> Color(0xFF3B82F6)
                                else -> Color(0xFF6B7280)
                            },
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Email
                    Text(
                        user.email,
                        color = Color(0xFF9CA3AF),
                        fontSize = 14.sp
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Menu Items
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ProfileMenuItem(
                    icon = Icons.Default.Person,
                    title = "Edit Profile",
                    onClick = { /* TODO */ }
                )
                
                ProfileMenuItem(
                    icon = Icons.Default.Notifications,
                    title = "Notifications",
                    onClick = { /* TODO */ }
                )
                
                ProfileMenuItem(
                    icon = Icons.Default.Settings,
                    title = "Settings",
                    onClick = { /* TODO */ }
                )
                
                ProfileMenuItem(
                    icon = Icons.Default.Help,
                    title = "Help & Support",
                    onClick = { /* TODO */ }
                )
                
                ProfileMenuItem(
                    icon = Icons.Default.Info,
                    title = "About",
                    onClick = { /* TODO */ }
                )
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            // Logout Button
            Button(
                onClick = {
                    authViewModel.logout()
                    onLogout()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFDC2626)
                ),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                enabled = !authUiState.isLoading
            ) {
                if (authUiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White
                    )
                } else {
                    Icon(
                        Icons.Default.ExitToApp,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        "Logout",
                        modifier = Modifier.padding(start = 8.dp),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            
        } else {
            // No user state
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        tint = Color(0xFF4B5563),
                        modifier = Modifier.size(64.dp)
                    )
                    Text(
                        "No user information available",
                        color = Color(0xFF9CA3AF),
                        fontSize = 16.sp,
                        modifier = Modifier.padding(top = 16.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun ProfileMenuItem(
    icon: ImageVector,
    title: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1F2937)
        ),
        shape = RoundedCornerShape(8.dp),
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = Color(0xFF60A5FA),
                modifier = Modifier.size(24.dp)
            )
            
            Text(
                title,
                color = Color.White,
                fontSize = 16.sp,
                modifier = Modifier.padding(start = 16.dp)
            )
            
            Spacer(modifier = Modifier.weight(1f))
            
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = Color(0xFF6B7280),
                modifier = Modifier.size(20.dp)
            )
        }
    }
}