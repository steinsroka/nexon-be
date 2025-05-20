export interface LoginMetadata {
  loginAt: Date;
}

export interface UserInviteMetadata {
  invitedUserId: string;
  invitedEmail: string;
  invitedAt: Date;
}

export interface QuestClearMetadata {
  questId: string;
}

// 메타데이터 타입 유니온
export type ActivityMetadata =
  | LoginMetadata
  | UserInviteMetadata
  | QuestClearMetadata
  | Record<string, any>;
