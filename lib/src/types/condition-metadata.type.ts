export interface LoginBetweenMetadata {
  startDate: Date;
  endDate: Date;
}

export interface LoginConsecutiveMetadata {
  consecutiveDays: number;
}

export interface UserInviteMetadata {
  inviteCount: number;
}

export interface QuestClearSpecificMetadata {
  questIds: string[];
}

export interface QuestClearCountMetadata {
  clearCount: number;
}

export type ConditionMetadata =
  | LoginBetweenMetadata
  | LoginConsecutiveMetadata
  | UserInviteMetadata
  | QuestClearSpecificMetadata
  | QuestClearCountMetadata
  | Record<string, any>;
