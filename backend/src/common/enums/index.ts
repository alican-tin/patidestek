export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum PostStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
}

export enum ReportReason {
  SPAM = 'SPAM',
  ABUSE = 'ABUSE',
  PERSONAL_INFO = 'PERSONAL_INFO',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}
