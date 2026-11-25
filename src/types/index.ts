export type Role = 'USER' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SOLD'
  | 'RENTED'
  | 'ARCHIVED';

export type ListingType = 'SALE' | 'RENT' | 'LEASE';

export type PropertyType = string;

export type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';

export type PossessionStatus = 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION';

export type InquiryStatus = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED' | 'SPAM';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: Role;
  accountStatus: AccountStatus;
  profileImage?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    properties: number;
    buyerInquiries: number;
    receivedInquiries: number;
    favorites?: number;
  };
  properties?: PropertySummary[];
  buyerInquiries?: InquirySummary[];
}

export interface PropertyImage {
  id: string;
  storageKey?: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface PropertyAmenity {
  propertyId: string;
  amenityId: string;
  amenity: Amenity;
}

export interface ModerationHistoryItem {
  id: string;
  propertyId: string;
  adminId: string;
  action: string;
  previousStatus: PropertyStatus;
  newStatus: PropertyStatus;
  reason?: string | null;
  createdAt: string;
  admin?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number | string;
  negotiable: boolean;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  builtUpArea?: number | string | null;
  carpetArea: number | string;
  plotArea?: number | string | null;
  areaUnit: string;
  floorNumber?: number | null;
  totalFloors?: number | null;
  furnishingStatus: FurnishingStatus;
  possessionStatus: PossessionStatus;
  constructionStatus?: string | null;
  propertyAge?: string | null;
  facing?: string | null;
  parkingSpaces: number;
  city: string;
  locality: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  address: string;
  landmark?: string | null;
  status: PropertyStatus;
  isFeatured?: boolean;
  isLatest?: boolean;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role?: Role;
    accountStatus?: AccountStatus;
    createdAt?: string;
  };
  images: PropertyImage[];
  amenities?: PropertyAmenity[];
  moderationHistory?: ModerationHistoryItem[];
  _count?: {
    inquiries: number;
    favorites: number;
  };
}

export interface PropertySummary {
  id: string;
  title: string;
  slug?: string;
  city: string;
  locality?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number | string;
  status: PropertyStatus;
  createdAt: string;
}

export interface InquirySummary {
  id: string;
  propertyId: string;
  buyerId?: string | null;
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiryStatus: InquiryStatus;
  source: string;
  createdAt: string;
  updatedAt?: string;
  property: {
    id: string;
    title: string;
    city: string;
    price?: number | string;
    listingType?: ListingType;
    images?: PropertyImage[];
  };
  buyer?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role?: Role;
  } | null;
  owner?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role?: Role;
  };
}

export interface AuditLogItem {
  id: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  ipAddress?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  } | null;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  soldProperties: number;
  rentalProperties: number;
  totalInquiries: number;
  newInquiries: number;
  propertiesAddedToday: number;
  usersRegisteredToday: number;
}

export interface DashboardRecentActivity {
  recentUsers: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    accountStatus: AccountStatus;
    createdAt: string;
  }[];
  recentProperties: {
    id: string;
    title: string;
    city: string;
    price: number | string;
    status: PropertyStatus;
    listingType: ListingType;
    propertyType: PropertyType;
    createdAt: string;
    owner: { id: string; fullName: string; email: string };
    images?: { imageUrl: string }[];
  }[];
  recentInquiries: {
    id: string;
    name: string;
    email: string;
    phone: string;
    inquiryStatus: InquiryStatus;
    createdAt: string;
    property: { id: string; title: string; city: string };
    owner: { id: string; fullName: string; email: string };
  }[];
  pendingApprovals: {
    id: string;
    title: string;
    city: string;
    price: number | string;
    createdAt: string;
    owner: { id: string; fullName: string; email: string; phone?: string | null };
    images?: { imageUrl: string }[];
  }[];
  recentAuditLogs: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
    actor?: { id: string; fullName: string; email: string; role: Role } | null;
  }[];
}

