import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CommentReportsModule } from './modules/comment-reports/comment-reports.module';
import { LocationsModule } from './modules/locations/locations.module';

import { User } from './modules/users/user.entity';
import { Category } from './modules/categories/category.entity';
import { Tag } from './modules/tags/tag.entity';
import { Post } from './modules/posts/post.entity';
import { Comment } from './modules/comments/comment.entity';
import { CommentReport } from './modules/comment-reports/comment-report.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const synchronize = configService.get<string>('TYPEORM_SYNCHRONIZE') === 'true';

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, Category, Tag, Post, Comment, CommentReport],
            synchronize,
            ssl: { rejectUnauthorized: false },
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: parseInt(configService.get<string>('DB_PORT') || '5432'),
          username: configService.get<string>('DB_USER') || 'postgres',
          password: configService.get<string>('DB_PASS') || 'postgres',
          database: configService.get<string>('DB_NAME') || 'patidestek',
          entities: [User, Category, Tag, Post, Comment, CommentReport],
          synchronize,
        };
      },
      inject: [ConfigService],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TagsModule,
    PostsModule,
    CommentsModule,
    CommentReportsModule,
    LocationsModule,
  ],
})
export class AppModule {}
