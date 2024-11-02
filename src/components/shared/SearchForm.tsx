import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isMarketplace?: boolean;
  initialValues?: {
    search: string;
    propertyType: string;
    minPrice: string;
    maxPrice: string;
    location: string;
  };
}

const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" }
];

export default function SearchForm({ 
  onSubmit, 
  isMarketplace = false, 
  initialValues = {
    search: '',
    propertyType: 'all',
    minPrice: '',
    maxPrice: '',
    location: ''
  } 
}: SearchFormProps) {
  return (
    <Card className="p-6 mb-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Input
              name="search"
              placeholder="Search properties..."
              defaultValue={initialValues.search}
              className="w-full"
            />
          </div>

          {/* Property Type Select */}
          <div className="space-y-2">
            <Select name="propertyType" defaultValue={initialValues.propertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Input
              name="minPrice"
              type="number"
              placeholder="Min Price (MATIC)"
              defaultValue={initialValues.minPrice}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Input
              name="maxPrice"
              type="number"
              placeholder="Max Price (MATIC)"
              defaultValue={initialValues.maxPrice}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Input
              name="location"
              placeholder="Location"
              defaultValue={initialValues.location}
              className="w-full"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              {isMarketplace ? "Search Marketplace" : "Search"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}