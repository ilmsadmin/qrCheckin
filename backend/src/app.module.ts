import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { CheckinModule } from './checkin/checkin.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ClubsModule } from './clubs/clubs.module';
import { CustomersModule } from './customers/customers.module';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from './redis/redis.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { EnvironmentVariables } from './config/env.validation';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      validate: (config) => {
        const validatedConfig = plainToClass(EnvironmentVariables, config, {
          enableImplicitConversion: true,
        });
        const errors = validateSync(validatedConfig, {
          skipMissingProperties: false,
        });
        if (errors.length > 0) {
          throw new Error(errors.toString());
        }
        return validatedConfig;
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    ClubsModule,
    CustomersModule,
    EventsModule,
    CheckinModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}