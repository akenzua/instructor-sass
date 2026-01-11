import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { EmailModule } from "./modules/email/email.module";
import { AuthModule } from "./modules/auth/auth.module";
import { InstructorsModule } from "./modules/instructors/instructors.module";
import { LearnersModule } from "./modules/learners/learners.module";
import { LessonsModule } from "./modules/lessons/lessons.module";
import { AvailabilityModule } from "./modules/availability/availability.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PackagesModule } from "./modules/packages/packages.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    AuthModule,
    InstructorsModule,
    LearnersModule,
    LessonsModule,
    AvailabilityModule,
    PaymentsModule,
    PackagesModule,
  ],
})
export class AppModule {}
