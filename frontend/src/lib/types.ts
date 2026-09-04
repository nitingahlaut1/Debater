export type DebateStyle = 'OXFORD' | 'SOCRATIC' | 'RAPID_FIRE' | 'ACADEMIC' | 'CASUAL';

export type DebateDifficulty = 'CASUAL' | 'STANDARD' | 'DEEP_THINKER' | 'GRANDMASTER';

export type DebateStatus = 'CREATED' | 'RUNNING' | 'JUDGING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type AgentRole = 'DEBATER_A' | 'DEBATER_B' | 'JUDGE';

export interface ScoreCategory {
  logic: number;
  evidence: number;
  rebuttal: number;
  clarity: number;
  persuasiveness: number;
  accuracy?: number;
}

export interface JudgeScorecard {
  id?: string;
  winner: 'Agent A' | 'Agent B' | 'Tie' | string;
  agentAScore: number;
  agentBScore: number;
  scores: {
    agentA: ScoreCategory;
    agentB: ScoreCategory;
  };
  reasoning: string;
  agentAStrengths: string[];
  agentBStrengths: string[];
  agentAWeaknesses: string[];
  agentBWeaknesses: string[];
  keyTurningPoints?: string[];
  finalVerdict: string;
  createdAt?: string;
}

export interface Agent {
  id: string;
  debateId: string;
  name: string;
  role: AgentRole;
  position: string;
  systemPrompt: string;
  avatar?: string;
}

export interface DebateMessage {
  id: string;
  debateId: string;
  agentId: string;
  agent: Agent;
  round: number;
  turn: string;
  content: string;
  tokenCount?: number;
  createdAt: string;
}

export interface Debate {
  id: string;
  topic: string;
  status: DebateStatus;
  rounds: number;
  currentRound: number;
  style: DebateStyle;
  difficulty: DebateDifficulty;
  language?: string;
  winner?: string;
  createdAt: string;
  completedAt?: string;
  agents: Agent[];
  messages: DebateMessage[];
  result?: JudgeScorecard;
  _count?: {
    messages: number;
  };
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
  message?: DebateMessage;
  result?: JudgeScorecard;
  status?: DebateStatus;
  error?: string;
  timestamp: string;
}
