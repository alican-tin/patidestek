import { IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../common/enums';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateBanDto {
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isBanned: boolean;
}
