// types/property.ts
export interface Property {
  propertyId: bigint;
  tokenId: bigint;
  seller: string;
  owner: string;
  price: bigint;
  sold: boolean;
  propertyType: string;
  propertyImage: string;
  squareFootage: bigint;
  location: string;
}

// types/property.ts
export interface PropertyCardProps {
  propertyId: string;
  tokenId: string;
  seller: string;
  owner: string;
  price: string;
  sold: boolean;
  propertyType: string;
  propertyImage: string;
  squareFootage: string;
  location: string;
}

export interface PropertyCardComponentProps {
  property: PropertyCardProps;
  onBuyClick: () => void;
}

export interface ContractProperty {
  propertyId: bigint;
  tokenId: bigint;
  seller: string;
  owner: string;
  price: bigint;
  sold: boolean;
  propertyType: string;
  propertyImage: string;
  squareFootage: bigint;
  location: string;
}

export interface SearchCriteria {
  search: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  location: string;
}