// hooks/usePropertySearch.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import {
  NFT_MARKETPLACE_ABI,
  NFT_MARKETPLACE_ADDRESS,
} from "@/utils/contractUtil";
import {
  Property,
  ContractProperty,
  SearchCriteria,
} from "@/types/searchProps";
import { toast } from "react-hot-toast";

const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
let lastRequestTime = 0;

export function usePropertySearch(initialValues: SearchCriteria) {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const searchCriteriaRef = useRef(initialValues);

  const convertContractPropertyToProperty = ( property: ContractProperty ): Property => ({
    propertyId: property.propertyId.toString(),
    tokenId: property.tokenId.toString(),
    seller: property.seller,
    owner: property.owner,
    price: property.price.toString(),
    sold: property.sold,
    propertyType: property.propertyType,
    propertyImage: property.propertyImage,
    squareFootage: property.squareFootage.toString(),
    location: property.location,
  });

  const checkRateLimit = async () => {
    try {
      const response = await fetch("/api/rate-limit", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          setIsRateLimited(true);
          const resetTime = response.headers.get("X-RateLimit-Reset");
          const waitTime = resetTime
            ? parseInt(resetTime) - Math.floor(Date.now() / 1000)
            : 60;
          toast.error(
            `Rate limit exceeded. Please try again in ${waitTime} seconds.`
          );
          return false;
        }
        throw new Error(data.error || "Failed to check rate limit");
      }

      setIsRateLimited(false);
      return true;
    } catch (error) {
      console.error("Rate limit check failed:", error);
      return true; // Proceed if rate limit check fails
    }
  };

  const fetchProperties = useCallback(async () => {
    // Check if enough time has passed since the last request
    const now = Date.now();
    const timeElapsed = now - lastRequestTime;
    if (timeElapsed < RATE_LIMIT_DELAY) {
      await new Promise((resolve) =>
        setTimeout(resolve, RATE_LIMIT_DELAY - timeElapsed)
      );
    }

    // Check rate limit with the server
    const canProceed = await checkRateLimit();
    if (!canProceed) {
      return;
    }

    setIsLoading(true);
    setError(null);
    lastRequestTime = Date.now();

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask");
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        NFT_MARKETPLACE_ADDRESS,
        NFT_MARKETPLACE_ABI,
        signer
      );

      // Fetch properties from contract
      let properties: ContractProperty[];
      try {
        properties = await contract.fetchAvailableProperties();
      } catch (err) {
        console.error("Contract call failed:", err);
        if (err instanceof Error && err.message.includes("CALL_EXCEPTION")) {
          throw new Error(
            "Unable to fetch properties. The contract might not be initialized properly."
          );
        }
        throw err;
      }

      // Convert and filter properties
      let processedProperties = properties.map(
        convertContractPropertyToProperty
      );

      const currentCriteria = searchCriteriaRef.current;

      // Apply search filters
      if (currentCriteria.search) {
        const searchTerm = currentCriteria.search.toLowerCase();
        processedProperties = processedProperties.filter(
          (property) =>
            property.propertyType.toLowerCase().includes(searchTerm) ||
            property.location.toLowerCase().includes(searchTerm)
        );
      }

      if (
        currentCriteria.propertyType &&
        currentCriteria.propertyType !== "all"
      ) {
        processedProperties = processedProperties.filter(
          (property) =>
            property.propertyType.toLowerCase() ===
            currentCriteria.propertyType.toLowerCase()
        );
      }

      if (currentCriteria.minPrice) {
        try {
          const minPriceWei = ethers.parseEther(currentCriteria.minPrice);
          processedProperties = processedProperties.filter(
            (property) => BigInt(property.price) >= minPriceWei
          );
        } catch (err) {
          console.error("Error parsing minimum price:", err);
        }
      }

      if (currentCriteria.maxPrice) {
        try {
          const maxPriceWei = ethers.parseEther(currentCriteria.maxPrice);
          processedProperties = processedProperties.filter(
            (property) => BigInt(property.price) <= maxPriceWei
          );
        } catch (err) {
          console.error("Error parsing maximum price:", err);
        }
      }

      if (currentCriteria.location) {
        const locationTerm = currentCriteria.location.toLowerCase();
        processedProperties = processedProperties.filter((property) =>
          property.location.toLowerCase().includes(locationTerm)
        );
      }

      setFilteredProperties(processedProperties);
      setError(null);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setFilteredProperties([]);
      setError(
        err instanceof Error ? err.message : "Failed to fetch properties"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [initialValues, fetchProperties]);

  return {
    filteredProperties,
    isLoading,
    error,
    isRateLimited,
    fetchProperties,
  };
}
