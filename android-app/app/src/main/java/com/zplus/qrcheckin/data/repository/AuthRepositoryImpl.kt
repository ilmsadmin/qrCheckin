package com.zplus.qrcheckin.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.zplus.qrcheckin.data.mapper.toDomain
import com.zplus.qrcheckin.data.remote.api.QRCheckinApiService
import com.zplus.qrcheckin.data.remote.apollo.TokenManager
import com.zplus.qrcheckin.domain.model.User
import com.zplus.qrcheckin.domain.repository.AuthRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of AuthRepository with GraphQL API integration
 */
@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val apiService: QRCheckinApiService,
    private val tokenManager: TokenManager,
    @ApplicationContext private val context: Context
) : AuthRepository {
    
    private val sharedPreferences: SharedPreferences by lazy {
        context.getSharedPreferences("qr_checkin_prefs", Context.MODE_PRIVATE)
    }
    
    override suspend fun login(email: String, password: String): Result<User> {
        return try {
            val result = apiService.login(email, password)
            result.map { authResponse ->
                // Save token
                tokenManager.saveTokens(authResponse.accessToken)
                
                // Save user info to preferences
                with(sharedPreferences.edit()) {
                    putString("user_id", authResponse.user.id)
                    putString("user_email", authResponse.user.email)
                    putString("user_name", "${authResponse.user.firstName} ${authResponse.user.lastName}")
                    putString("user_role", authResponse.user.role)
                    putBoolean("is_logged_in", true)
                    apply()
                }
                
                authResponse.user.toDomain()
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun logout(): Result<String> {
        return try {
            val result = apiService.logout()
            result.onSuccess {
                // Clear tokens and user data
                tokenManager.clearTokens()
                with(sharedPreferences.edit()) {
                    clear()
                    apply()
                }
            }
            result
        } catch (e: Exception) {
            // Clear local data even if network call fails
            tokenManager.clearTokens()
            with(sharedPreferences.edit()) {
                clear()
                apply()
            }
            Result.failure(e)
        }
    }
    
    override suspend fun getCurrentUser(): Result<User> {
        return try {
            val result = apiService.getCurrentUser()
            result.map { userDto -> userDto.toDomain() }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        username: String
    ): Result<User> {
        return try {
            val result = apiService.register(email, password, firstName, lastName, username)
            result.map { userDto -> userDto.toDomain() }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun isLoggedIn(): Boolean {
        return tokenManager.hasValidToken() && sharedPreferences.getBoolean("is_logged_in", false)
    }
    
    override fun getStoredUserInfo(): User? {
        return if (isLoggedIn()) {
            try {
                User(
                    id = sharedPreferences.getString("user_id", "") ?: "",
                    email = sharedPreferences.getString("user_email", "") ?: "",
                    username = sharedPreferences.getString("user_email", "") ?: "", // Fallback to email
                    firstName = sharedPreferences.getString("user_name", "")?.split(" ")?.firstOrNull() ?: "",
                    lastName = sharedPreferences.getString("user_name", "")?.split(" ")?.drop(1)?.joinToString(" ") ?: "",
                    role = com.zplus.qrcheckin.domain.model.Role.valueOf(
                        sharedPreferences.getString("user_role", "CUSTOMER") ?: "CUSTOMER"
                    ),
                    isActive = true
                )
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
    }
}