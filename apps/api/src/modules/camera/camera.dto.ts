import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateCameraDto {
  @IsString() @MaxLength(64)
  code!: string;

  @IsString() @MaxLength(128)
  name!: string;

  @IsOptional() @IsString() vendor?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsInt() channelNo?: number;
  @IsOptional() @IsInt() nvrId?: number;

  @IsOptional() @IsString() rtspMain?: string;
  @IsOptional() @IsString() rtspSub?: string;

  @IsOptional() @IsString() onvifHost?: string;
  @IsOptional() @IsInt() onvifPort?: number;
  @IsOptional() @IsString() onvifUser?: string;
  @IsOptional() @IsString() onvifPass?: string;

  @IsOptional() @IsBoolean() hasPtz?: boolean;
  @IsOptional() @IsBoolean() hasAudio?: boolean;
  @IsOptional() @IsString() resolution?: string;
}

export class UpdateCameraDto extends PartialType(CreateCameraDto) {}
