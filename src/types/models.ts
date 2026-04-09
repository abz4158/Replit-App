export type RelationshipStatus = 'close' | 'issues' | 'cut' | 'lost' | 'none';
export type LineageType = 'direct' | 'distant';

export interface Person {
  id: string;
  name: string;
  title: string;
  isDeceased: boolean;
  religion: boolean;
  disavowedFaith: boolean;
  relationshipStatus: RelationshipStatus;
  lineageType: LineageType;
  emotionalConnections: string[];
  notes: string;
  parentIds: string[];
  childrenIds: string[];
  partnerIds: string[];
}

export interface ArchiveEvent {
  id: string;
  personIds: string[];
  date: string;
  title: string;
  description: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  notes: string;
}
