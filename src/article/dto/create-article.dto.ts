import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateArtileDto {
  @IsNotEmpty()
  readonly title: string;

  @IsNotEmpty()
  readonly description: string;

  @IsNotEmpty()
  readonly body: string;

  @IsOptional()
  readonly tagList?: string[];
}
