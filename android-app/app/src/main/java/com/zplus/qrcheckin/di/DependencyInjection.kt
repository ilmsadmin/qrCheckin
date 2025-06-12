package com.zplus.qrcheckin.di

/**
 * Dependency Injection modules for Hilt
 * 
 * These modules would provide dependencies throughout the app.
 * To use Hilt, you would need to:
 * 1. Add Hilt dependencies to build.gradle
 * 2. Add @HiltAndroidApp to Application class
 * 3. Add @AndroidEntryPoint to Activities/Fragments
 * 4. Use @Inject in ViewModels and other classes
 */

/*
Example of what the Hilt modules would look like:

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideApolloClient(okHttpClient: OkHttpClient): ApolloClient {
        return ApolloClient.Builder()
            .serverUrl("http://localhost:4000/graphql")
            .okHttpClient(okHttpClient)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideQRCheckinApiService(apolloClient: ApolloClient): QRCheckinApiService {
        return QRCheckinApiServiceImpl(apolloClient)
    }
}

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideQRCheckinDatabase(@ApplicationContext context: Context): QRCheckinDatabase {
        return Room.databaseBuilder(
            context,
            QRCheckinDatabase::class.java,
            "qr_checkin_database"
        ).build()
    }
    
    @Provides
    fun provideCheckinLogDao(database: QRCheckinDatabase): CheckinLogDao {
        return database.checkinLogDao()
    }
    
    @Provides
    fun provideEventDao(database: QRCheckinDatabase): EventDao {
        return database.eventDao()
    }
}

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    
    @Provides
    @Singleton
    fun provideCheckinRepository(
        apiService: QRCheckinApiService,
        checkinLogDao: CheckinLogDao
    ): CheckinRepository {
        return CheckinRepositoryImpl(apiService, checkinLogDao)
    }
    
    @Provides
    @Singleton
    fun provideEventRepository(
        apiService: QRCheckinApiService,
        eventDao: EventDao
    ): EventRepository {
        return EventRepositoryImpl(apiService, eventDao)
    }
    
    @Provides
    @Singleton
    fun provideAuthRepository(
        apiService: QRCheckinApiService,
        @ApplicationContext context: Context
    ): AuthRepository {
        return AuthRepositoryImpl(apiService, context)
    }
}

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
*/

// Application class that would be annotated with @HiltAndroidApp
/*
@HiltAndroidApp
class QRCheckinApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize app-wide dependencies
    }
}
*/