import { IsString, IsNumber, IsObject, IsArray, IsOptional } from 'class-validator';

export class ScoreCategoryDto {
  @IsNumber()
  logic: number;

  @IsNumber()
  evidence: number;

  @IsNumber()
  rebuttal: number;

  @IsNumber()
  clarity: number;

  @IsNumber()
  persuasiveness: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}

export class JudgeScoresDto {
  @IsObject()
  agentA: ScoreCategoryDto;

  @IsObject()
  agentB: ScoreCategoryDto;
}

export class JudgeResultDto {
  @IsString()
  winner: string;

  @IsNumber()
  agentAScore: number;

  @IsNumber()
  agentBScore: number;

  @IsObject()
  scores: JudgeScoresDto;

  @IsString()
  reasoning: string;

  @IsArray()
  agentAStrengths: string[];

  @IsArray()
  agentBStrengths: string[];

  @IsArray()
  agentAWeaknesses: string[];

  @IsArray()
  agentBWeaknesses: string[];

  @IsOptional()
  @IsArray()
  keyTurningPoints?: string[];

  @IsString()
  finalVerdict: string;
}
