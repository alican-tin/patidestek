import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentReport } from './comment-report.entity';
import { Comment } from '../comments/comment.entity';
import { CreateCommentReportDto, ReportQueryDto } from './dto';
import { User } from '../users/user.entity';
import { ReportStatus } from '../../common/enums';

@Injectable()
export class CommentReportsService {
  constructor(
    @InjectRepository(CommentReport)
    private reportsRepository: Repository<CommentReport>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(createReportDto: CreateCommentReportDto, user: User): Promise<CommentReport> {
    const { commentId, reason, details } = createReportDto;

    const comment = await this.commentsRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const report = this.reportsRepository.create({
      commentId,
      reason,
      details,
      reporterId: user.id,
      status: ReportStatus.OPEN,
    });

    const savedReport = await this.reportsRepository.save(report);

    return this.reportsRepository.findOne({
      where: { id: savedReport.id },
      relations: ['comment', 'reporter'],
    }) as Promise<CommentReport>;
  }

  async findAll(query: ReportQueryDto): Promise<CommentReport[]> {
    const qb = this.reportsRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.comment', 'comment')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('comment.user', 'commentUser');

    if (query.status) {
      qb.where('report.status = :status', { status: query.status });
    }

    qb.orderBy('report.createdAt', 'DESC');

    return qb.getMany();
  }

  async resolve(id: number): Promise<CommentReport> {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['comment', 'reporter'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = ReportStatus.RESOLVED;
    return this.reportsRepository.save(report);
  }

  async delete(id: number): Promise<void> {
    const report = await this.reportsRepository.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    await this.reportsRepository.remove(report);
  }
}
