package com.zplus.qrcheckin.data.remote.api

import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.exception.ApolloException
import com.zplus.qrcheckin.data.remote.dto.*
import com.zplus.qrcheckin.graphql.*
import com.zplus.qrcheckin.graphql.type.LoginInput
import com.zplus.qrcheckin.graphql.type.RegisterInput
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * GraphQL API service implementation using Apollo Client
 */
@Singleton
class QRCheckinApiService @Inject constructor(
    private val apolloClient: ApolloClient
) {
    
    // Authentication
    suspend fun login(email: String, password: String): Result<AuthResponseDto> {
        return try {
            val response = apolloClient.mutation(
                LoginMutation(
                    input = LoginInput(
                        email = email,
                        password = password
                    )
                )
            ).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Login failed"))
            } else {
                val data = response.data?.login
                if (data != null) {
                    Result.success(
                        AuthResponseDto(
                            accessToken = data.access_token,
                            user = UserDto(
                                id = data.user.id,
                                email = data.user.email,
                                username = data.user.username,
                                firstName = data.user.firstName,
                                lastName = data.user.lastName,
                                role = data.user.role.name,
                                isActive = data.user.isActive,
                                clubId = data.user.clubId
                            )
                        )
                    )
                } else {
                    Result.failure(Exception("No data returned from login"))
                }
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
    
    suspend fun logout(): Result<String> {
        return try {
            val response = apolloClient.mutation(LogoutMutation()).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Logout failed"))
            } else {
                Result.success(response.data?.logout ?: "Logged out successfully")
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
    
    suspend fun register(email: String, password: String, firstName: String, lastName: String, username: String): Result<UserDto> {
        return try {
            val response = apolloClient.mutation(
                RegisterMutation(
                    input = RegisterInput(
                        email = email,
                        password = password,
                        firstName = firstName,
                        lastName = lastName,
                        username = username
                    )
                )
            ).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Registration failed"))
            } else {
                val data = response.data?.register
                if (data != null) {
                    Result.success(
                        UserDto(
                            id = data.id,
                            email = data.email,
                            username = data.username,
                            firstName = data.firstName,
                            lastName = data.lastName,
                            role = data.role.name,
                            isActive = data.isActive,
                            clubId = data.clubId
                        )
                    )
                } else {
                    Result.failure(Exception("No data returned from registration"))
                }
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
    
    suspend fun getCurrentUser(): Result<UserDto> {
        return try {
            val response = apolloClient.query(GetCurrentUserQuery()).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Failed to get current user"))
            } else {
                val data = response.data?.me
                if (data != null) {
                    Result.success(
                        UserDto(
                            id = data.id,
                            email = data.email,
                            username = data.username,
                            firstName = data.firstName,
                            lastName = data.lastName,
                            role = data.role.name,
                            isActive = data.isActive,
                            clubId = data.clubId
                        )
                    )
                } else {
                    Result.failure(Exception("No user data returned"))
                }
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
    
    // Events - Note: Backend returns String for events query
    suspend fun getEvents(): Result<String> {
        return try {
            val response = apolloClient.query(GetEventsQuery()).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Failed to get events"))
            } else {
                val data = response.data?.events
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No events data returned"))
                }
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
    
    suspend fun getEvent(id: String): Result<String> {
        return try {
            val response = apolloClient.query(GetEventQuery(id = id)).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Failed to get event"))
            } else {
                val data = response.data?.event
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No event data returned"))
                }
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
    
    // Check-ins
    suspend fun checkin(qrCodeId: String, eventId: String): Result<CheckinLogDto> {
        return try {
            val response = apolloClient.mutation(
                CheckinMutation(
                    qrCodeId = qrCodeId,
                    eventId = eventId
                )
            ).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Check-in failed"))
            } else {
                val data = response.data?.checkin
                if (data != null) {
                    Result.success(
                        CheckinLogDto(
                            id = data.id,
                            type = data.type.name,
                            action = data.action,
                            timestamp = data.timestamp.toString(),
                            location = data.location,
                            notes = data.notes,
                            userId = data.userId,
                            eventId = data.eventId,
                            user = data.user?.let { user ->
                                UserDto(
                                    id = user.id,
                                    email = user.email ?: "",
                                    username = user.username ?: "",
                                    firstName = user.firstName,
                                    lastName = user.lastName,
                                    role = user.role?.name ?: "",
                                    isActive = user.isActive ?: true
                                )
                            },
                            event = data.event?.let { event ->
                                EventDto(
                                    id = event.id,
                                    name = event.name,
                                    location = event.location
                                )
                            }
                        )
                    )
                } else {
                    Result.failure(Exception("No check-in data returned"))
                }
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
    
    suspend fun checkout(qrCodeId: String, eventId: String): Result<CheckinLogDto> {
        return try {
            val response = apolloClient.mutation(
                CheckoutMutation(
                    qrCodeId = qrCodeId,
                    eventId = eventId
                )
            ).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Check-out failed"))
            } else {
                val data = response.data?.checkout
                if (data != null) {
                    Result.success(
                        CheckinLogDto(
                            id = data.id,
                            type = data.type.name,
                            action = data.action,
                            timestamp = data.timestamp.toString(),
                            location = data.location,
                            notes = data.notes,
                            userId = data.userId,
                            eventId = data.eventId,
                            user = data.user?.let { user ->
                                UserDto(
                                    id = user.id,
                                    email = user.email ?: "",
                                    username = user.username ?: "",
                                    firstName = user.firstName,
                                    lastName = user.lastName,
                                    role = user.role?.name ?: "",
                                    isActive = user.isActive ?: true
                                )
                            },
                            event = data.event?.let { event ->
                                EventDto(
                                    id = event.id,
                                    name = event.name,
                                    location = event.location
                                )
                            }
                        )
                    )
                } else {
                    Result.failure(Exception("No check-out data returned"))
                }
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
    
    suspend fun getCheckinLogs(
        clubId: String? = null,
        customerId: String? = null,
        eventId: String? = null,
        limit: Int? = null,
        offset: Int? = null
    ): Result<List<CheckinLogDto>> {
        return try {
            val response = apolloClient.query(
                GetCheckinLogsQuery(
                    clubId = clubId,
                    customerId = customerId,
                    eventId = eventId,
                    limit = limit,
                    offset = offset
                )
            ).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Failed to get check-in logs"))
            } else {
                val data = response.data?.checkinLogs
                if (data != null) {
                    Result.success(
                        data.map { log ->
                            CheckinLogDto(
                                id = log.id,
                                type = log.type.name,
                                action = log.action,
                                timestamp = log.timestamp.toString(),
                                location = log.location,
                                notes = log.notes,
                                userId = log.userId,
                                eventId = log.eventId,
                                user = log.user?.let { user ->
                                    UserDto(
                                        id = user.id,
                                        email = user.email ?: "",
                                        username = user.username ?: "",
                                        firstName = user.firstName,
                                        lastName = user.lastName,
                                        role = user.role?.name ?: "",
                                        isActive = user.isActive ?: true
                                    )
                                },
                                event = log.event?.let { event ->
                                    EventDto(
                                        id = event.id,
                                        name = event.name,
                                        location = event.location
                                    )
                                }
                            )
                        }
                    )
                } else {
                    Result.failure(Exception("No check-in logs data returned"))
                }
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
    
    // QR Code generation
    suspend fun generateUserQRCode(userId: String): Result<QRCodeDto> {
        return try {
            val response = apolloClient.mutation(
                GenerateUserQRCodeMutation(userId = userId)
            ).execute()
            
            if (response.hasErrors()) {
                Result.failure(Exception(response.errors?.firstOrNull()?.message ?: "Failed to generate QR code"))
            } else {
                val data = response.data?.generateUserQRCode
                if (data != null) {
                    Result.success(
                        QRCodeDto(
                            id = data.id,
                            qrCode = data.qrCode,
                            isActive = data.isActive
                        )
                    )
                } else {
                    Result.failure(Exception("No QR code data returned"))
                }
            }
        } catch (e: ApolloException) {
            Result.failure(e)
        }
    }
}