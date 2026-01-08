import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentReportsService } from './comment-reports.service';
import { CreateCommentReportDto, ReportQueryDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard, BannedGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';
import { User } from '../users/user.entity';

@Controller('comment-reports')
export class CommentReportsController {
  constructor(private reportsService: CommentReportsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), BannedGuard)
  async create(
    @Body() createReportDto: CreateCommentReportDto,
    @CurrentUser() user: User,
  ) {
    const report = await this.reportsService.create(createReportDto, user);
    return this.formatReport(report);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: ReportQueryDto) {
    const reports = await this.reportsService.findAll(query);
    return reports.map((report) => this.formatReport(report));
  }

  @Patch(':id/resolve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async resolve(@Param('id', ParseIntPipe) id: number) {
    const report = await this.reportsService.resolve(id);
    return this.formatReport(report);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.reportsService.delete(id);
    return { message: 'Report deleted successfully' };
  }

  private formatReport(report: any) {
    return {
      id: report.id,
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: report.createdAt,
      comment: report.comment ? {
        id: report.comment.id,
        content: report.comment.content,
        user: report.comment.user ? {
          id: report.comment.user.id,
          name: report.comment.user.name,
        } : null,
      } : null,
      reporter: report.reporter ? {
        id: report.reporter.id,
        name: report.reporter.name,
      } : null,
    };
  }
}
