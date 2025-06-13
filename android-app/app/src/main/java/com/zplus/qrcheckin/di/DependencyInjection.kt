package com.zplus.qrcheckin.di

import android.content.Context
import com.apollographql.apollo3.ApolloClient
import com.zplus.qrcheckin.data.remote.api.QRCheckinApiService
import com.zplus.qrcheckin.data.remote.apollo.ApolloClientProvider
import com.zplus.qrcheckin.data.remote.apollo.AuthInterceptor
import com.zplus.qrcheckin.data.remote.apollo.TokenManager
import com.zplus.qrcheckin.data.repository.AuthRepositoryImpl
import com.zplus.qrcheckin.data.repository.CheckinRepositoryImpl
import com.zplus.qrcheckin.data.repository.EventRepositoryImpl
import com.zplus.qrcheckin.domain.repository.AuthRepository
import com.zplus.qrcheckin.domain.repository.CheckinRepository
import com.zplus.qrcheckin.domain.repository.EventRepository
import com.zplus.qrcheckin.domain.usecase.CheckinUseCase
import com.zplus.qrcheckin.domain.usecase.GetEventsUseCase
import com.zplus.qrcheckin.utils.offline.NetworkMonitor
import com.zplus.qrcheckin.utils.offline.OfflineQueueManager
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import dagger.hilt.android.components.ViewModelComponent
import javax.inject.Singleton

/**
 * Network module providing Apollo GraphQL client and related dependencies
 */
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideTokenManager(): TokenManager {
        return TokenManager()
    }
    
    @Provides
    @Singleton
    fun provideAuthInterceptor(tokenManager: TokenManager): AuthInterceptor {
        return AuthInterceptor(tokenManager)
    }
    
    @Provides
    @Singleton
    fun provideApolloClientProvider(authInterceptor: AuthInterceptor): ApolloClientProvider {
        return ApolloClientProvider(authInterceptor)
    }
    
    @Provides
    @Singleton
    fun provideApolloClient(apolloClientProvider: ApolloClientProvider): ApolloClient {
        return apolloClientProvider.apolloClient
    }
    
    @Provides
    @Singleton
    fun provideQRCheckinApiService(apolloClient: ApolloClient): QRCheckinApiService {
        return QRCheckinApiService(apolloClient)
    }
    
    @Provides
    @Singleton
    fun provideNetworkMonitor(@ApplicationContext context: Context): NetworkMonitor {
        return NetworkMonitor(context)
    }
    
    @Provides
    @Singleton
    fun provideOfflineQueueManager(@ApplicationContext context: Context): OfflineQueueManager {
        return OfflineQueueManager(context)
    }
}

/**
 * Repository module providing repository implementations
 */
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    
    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository
    
    @Binds
    @Singleton
    abstract fun bindCheckinRepository(
        checkinRepositoryImpl: CheckinRepositoryImpl
    ): CheckinRepository
    
    @Binds
    @Singleton
    abstract fun bindEventRepository(
        eventRepositoryImpl: EventRepositoryImpl
    ): EventRepository
}

/**
 * Use case module providing domain use cases
 */
@Module
@InstallIn(ViewModelComponent::class)
object UseCaseModule {
    
    @Provides
    fun provideCheckinUseCase(
        checkinRepository: CheckinRepository
    ): CheckinUseCase {
        return CheckinUseCase(checkinRepository)
    }
    
    @Provides
    fun provideGetEventsUseCase(
        eventRepository: EventRepository
    ): GetEventsUseCase {
        return GetEventsUseCase(eventRepository)
    }
}