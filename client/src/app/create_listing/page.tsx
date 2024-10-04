// src/app/create_listing/page.tsx
import React from "react";
import { ListPropertyForm } from "./ListPropertyForm";
import { NFT_MARKETPLACE_ADDRESS } from "@/utils/contractUtil";

export default async function CreateListingPage() {

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 py-8">
      <ListPropertyForm NFT_MARKETPLACE_ADDRESS={NFT_MARKETPLACE_ADDRESS} />
    </div>
  );
}