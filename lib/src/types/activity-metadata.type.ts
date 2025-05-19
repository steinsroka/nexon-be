export interface LoginMetadata {
  loginAt: Date;
}

export interface UserInviteMetadata {
  invitedUserId: string;
  invitedEmail: string;
}

export interface QuestClearMetadata {
  questId: string;
}

// 메타데이터 타입 유니온
export type ActivityMetadata =
  | LoginMetadata
  | UserInviteMetadata
  | Record<string, any>;
