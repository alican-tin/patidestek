import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentReportsController } from './comment-reports.controller';
import { CommentReportsService } from './comment-reports.service';
import { CommentReport } from './comment-report.entity';
import { Comment } from '../comments/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentReport, Comment])],
  controllers: [CommentReportsController],
  providers: [CommentReportsService],
  exports: [CommentReportsService],
})
export class CommentReportsModule {}
