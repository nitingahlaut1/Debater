export type DebateStyle = 'OXFORD' | 'SOCRATIC' | 'RAPID_FIRE' | 'ACADEMIC' | 'CASUAL';

export type DebateDifficulty = 'CASUAL' | 'STANDARD' | 'DEEP_THINKER' | 'GRANDMASTER';

export type DebateStatus = 'CREATED' | 'RUNNING' | 'JUDGING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type AgentRole = 'DEBATER_A' | 'DEBATER_B' | 'JUDGE';

export interface ScoreCategory {
  logic: number; // 0-10
  evidence: number; // 0-10
  rebuttal: number; // 0-10
  clarity: number; // 0-10
  persuasiveness: number; // 0-10
  accuracy?: number; // 0-10
}

export interface JudgeScorecard {
  winner: 'Agent A' | 'Agent B' | 'Tie';
  agentAScore: number; // 0-100
  agentBScore: number; // 0-100
  scores: {
    agentA: ScoreCategory;
    agentB: ScoreCategory;
  };
  reasoning: string;
  agentAStrengths: string[];
  agentBStrengths: string[];
  agentAWeaknesses: string[];
  agentBWeaknesses: string[];
  keyTurningPoints: string[];
  finalVerdict: string;
}

export interface StreamEvent {
  type:
    | 'status_change'
    | 'agent_thinking'
    | 'agent_chunk'
    | 'agent_message_complete'
    | 'round_advance'
    | 'judging_start'
    | 'judge_chunk'
    | 'judge_complete'
    | 'debate_complete'
    | 'debate_error';
  debateId: string;
  round?: number;
  agentRole?: AgentRole;
  agentName?: string;
  chunk?: string;
  message?: any;
  result?: JudgeScorecard;
  status?: DebateStatus;
  error?: string;
  timestamp: string;
}
