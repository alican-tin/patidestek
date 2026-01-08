import { IsString, IsNumber, IsOptional, IsArray, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  provinceCode: string;

  @IsString()
  provinceName: string;

  @IsString()
  districtCode: string;

  @IsString()
  districtName: string;

  @IsString()
  neighbourhoodName: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  provinceCode?: string;

  @IsOptional()
  @IsString()
  provinceName?: string;

  @IsOptional()
  @IsString()
  districtCode?: string;

  @IsOptional()
  @IsString()
  districtName?: string;

  @IsOptional()
  @IsString()
  neighbourhoodName?: string;
}

export class UpdateTagsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds: number[];
}

export class PostQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  tagIds?: string; // comma-separated: "1,2,3"

  @IsOptional()
  @IsString()
  tagLogic?: 'AND' | 'OR'; // AND = kesişim, OR = birleşim (default: OR)

  @IsOptional()
  @IsString()
  provinceCode?: string;

  @IsOptional()
  @IsString()
  districtCode?: string;

  @IsOptional()
  @IsString()
  neighbourhoodName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string; // Başlık veya açıklamada arama

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number;
}

export class RejectPostDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
