import { IsString, MinLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @MinLength(2)
  name: string;
}

export class UpdateTagDto {
  @IsString()
  @MinLength(2)
  name: string;
}
