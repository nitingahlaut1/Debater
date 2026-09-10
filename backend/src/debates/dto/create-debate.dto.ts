import { IsString, IsInt, Min, Max, IsOptional, IsIn } from 'class-validator';

export class CreateDebateDto {
  @IsString()
  topic: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  rounds?: number = 3;

  @IsString()
  @IsOptional()
  @IsIn(['OXFORD', 'SOCRATIC', 'RAPID_FIRE', 'ACADEMIC', 'CASUAL'])
  style?: string = 'OXFORD';

  @IsString()
  @IsOptional()
  @IsIn(['CASUAL', 'STANDARD', 'DEEP_THINKER', 'GRANDMASTER'])
  difficulty?: string = 'STANDARD';

  @IsString()
  @IsOptional()
  language?: string = 'English';

  @IsString()
  @IsOptional()
  agentAContext?: string;

  @IsString()
  @IsOptional()
  agentBContext?: string;
}
