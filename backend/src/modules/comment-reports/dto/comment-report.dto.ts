import { IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportReason } from '../../../common/enums';

export class CreateCommentReportDto {
  @IsNumber()
  commentId: number;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  details?: string;
}

export class ReportQueryDto {
  @IsOptional()
  @IsString()
  status?: string; // OPEN | RESOLVED
}
