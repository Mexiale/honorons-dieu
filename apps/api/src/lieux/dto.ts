import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const toBool = ({ value }: { value: unknown }) =>
  value === 'true' || value === true;

export class SearchLieuxDto {
  @IsOptional()
  @IsString()
  q?: string; // nom, commune, quartier ou ville

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  religionId?: number;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  commune?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  // Rayon en kilomètres (2, 5, 10…)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  rayon?: number;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  accessible?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  climatisation?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  toilettes?: boolean;
}

export enum TypeHoraireDto {
  MESSE = 'MESSE',
  CULTE = 'CULTE',
  PRIERE = 'PRIERE',
  VEILLEE = 'VEILLEE',
}

export class HoraireDto {
  @IsString()
  jour: string;

  @IsString()
  heure: string;

  @IsEnum(TypeHoraireDto)
  type: TypeHoraireDto;
}

export class CreateLieuDto {
  @IsString()
  nom: string;

  @Type(() => Number)
  @IsInt()
  religionId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  site?: string;

  @IsString()
  adresse: string;

  @IsString()
  ville: string;

  @IsOptional()
  @IsString()
  commune?: string;

  @IsOptional()
  @IsString()
  quartier?: string;

  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  responsable?: string;

  @IsOptional()
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @IsBoolean()
  accessible?: boolean;

  @IsOptional()
  @IsBoolean()
  climatisation?: boolean;

  @IsOptional()
  @IsBoolean()
  toilettes?: boolean;

  @IsOptional()
  @Type(() => HoraireDto)
  horaires?: HoraireDto[];
}
