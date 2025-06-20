import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNotEmpty, IsNumber, IsPositive  } from 'class-validator';

export class QueryFilterDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  select?: string; // مثال: ?select=name email

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sort?: string; // مثال: ?sort=name -createdAt

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;
}