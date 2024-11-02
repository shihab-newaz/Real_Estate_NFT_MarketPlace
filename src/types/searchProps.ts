// types/property.ts

export interface PropertyBase {
    seller: string;
    owner: string;
    sold: boolean;
    propertyType: string;
    propertyImage: string;
    location: string;
  }
  
  export interface Property extends PropertyBase {
    propertyId: string;
    tokenId: string;
    price: string;
    squareFootage: string;
  }
  
  export interface PropertyCardProps extends PropertyBase {
    propertyId: string;
    tokenId: string;
    price: string;
    squareFootage: string;
  }
  
  export interface ContractProperty extends PropertyBase {
    propertyId: bigint;
    tokenId: bigint;
    price: bigint;
    squareFootage: bigint;
  }
  
  export interface SearchCriteria {
    search: string;
    propertyType: string;
    minPrice: string;
    maxPrice: string;
    location: string;
  }