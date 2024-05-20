import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  picture?: string;
}
