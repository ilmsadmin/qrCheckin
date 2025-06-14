package com.zplus.qrcheckin.data.remote.apollo

import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.network.okHttpClient
import com.zplus.qrcheckin.config.ApiConfig
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ApolloClientProvider @Inject constructor(
    private val authInterceptor: AuthInterceptor
) {
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(ApiConfig.CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .readTimeout(ApiConfig.READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .writeTimeout(ApiConfig.WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .build()
    
    val apolloClient: ApolloClient = ApolloClient.Builder()
        .serverUrl("${ApiConfig.BASE_URL}${ApiConfig.GRAPHQL_ENDPOINT}")
        .okHttpClient(okHttpClient)
        .build()
}

/**
 * Auth Interceptor to add Bearer token to requests
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {
    
    override fun intercept(chain: Interceptor.Chain): okhttp3.Response {
        val originalRequest = chain.request()
        
        val token = tokenManager.getAccessToken()
        
        return if (!token.isNullOrEmpty()) {
            val newRequest = originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
            chain.proceed(newRequest)
        } else {
            chain.proceed(originalRequest)
        }
    }
}

/**
 * Token Manager for handling JWT tokens
 */
@Singleton
class TokenManager @Inject constructor() {
    private var accessToken: String? = null
    private var refreshToken: String? = null
    
    fun saveTokens(accessToken: String, refreshToken: String? = null) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
    }
    
    fun getAccessToken(): String? = accessToken
    
    fun getRefreshToken(): String? = refreshToken
    
    fun clearTokens() {
        accessToken = null
        refreshToken = null
    }
    
    fun hasValidToken(): Boolean = !accessToken.isNullOrEmpty()
}