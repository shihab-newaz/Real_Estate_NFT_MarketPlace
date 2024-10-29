// src/app/create-listing/PropertyForm.tsx
'use client'

import React from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ethers } from 'ethers'
import { usePropertyForm } from '@/hooks/usePropertyForm'
import { mintPropertyToken, listProperty } from '@/app/actions/propertyFormActions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { NFT_MARKETPLACE_ABI } from "@/utils/contractUtil"
import { Textarea } from "@/components/ui/textarea"

interface PropertyFormProps {
  NFT_MARKETPLACE_ADDRESS: string
}

interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
  description?: string
  isTextArea?: boolean
}

function FormField({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  required = true,
  placeholder,
  description,
  isTextArea = false
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      {isTextArea ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="min-h-[100px]"
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full"
        />
      )}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  )
}

export function PropertyForm({ NFT_MARKETPLACE_ADDRESS }: PropertyFormProps) {
  const router = useRouter()
  const { address, connectWallet } = useWalletConnection()
  const {
    formData,
    isLoading,
    isMinting,
    tokenId,
    handleInputChange,
    setIsLoading,
    setIsMinting,
    setTokenId,
    executeContractTransaction
  } = usePropertyForm(NFT_MARKETPLACE_ADDRESS)

  const handleMintToken = async () => {
    setIsMinting(true)
    try {
      if (!address) {
        throw new Error("Please connect your wallet first")
      }

      const result = await mintPropertyToken(formData)
      if (!result.success || !result.tokenURI) {
        throw new Error(result.error || "Failed to create token URI")
      }

      const receipt = await executeContractTransaction(result.tokenURI)
      const transferEvent = receipt.logs.find(
        (log: any) =>
          log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      )

      if (transferEvent) {
        const tokenIdBigInt = BigInt(transferEvent.topics[3])
        setTokenId(tokenIdBigInt)
        toast.success("Token minted successfully!")
      } else {
        throw new Error("Token minting failed - no transfer event found")
      }
    } catch (error) {
      console.error("Mint error:", error)
      toast.error(error instanceof Error ? error.message : "Minting failed")
    } finally {
      setIsMinting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!tokenId) {
        throw new Error("Please mint the token first")
      }

      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask")
      }

      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider)
      const contract = new ethers.Contract(
        NFT_MARKETPLACE_ADDRESS,
        NFT_MARKETPLACE_ABI,
        provider
      )
      const listingFee = await contract.getListingFee()

      const result = await listProperty(
        tokenId,
        formData,
        listingFee,
        NFT_MARKETPLACE_ADDRESS
      )

      if (!result.success || !result.params) {
        throw new Error(result.error || "Failed to prepare listing parameters")
      }

      await executeContractTransaction('', result.params)
      toast.success("Property listed successfully!")
      router.push("/marketplace")
    } catch (error) {
      console.error("List property error:", error)
      toast.error(error instanceof Error ? error.message : "Listing failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (!address) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>List Your Property</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="mb-4">Please connect your wallet to list a property.</p>
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>List Your Property</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Property Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter property name"
            description="Add a memorable name for your property"
          />
          
          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            isTextArea
            placeholder="Describe your property..."
            description="Include key features, condition, and any unique aspects"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Property Type"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              placeholder="e.g., House, Apartment"
            />
            
            <FormField
              label="Square Footage"
              name="squareFootage"
              value={formData.squareFootage}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter square footage"
            />
          </div>

          <FormField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Enter property location"
          />

          <FormField
            label="Property Image URL"
            name="propertyImage"
            value={formData.propertyImage}
            onChange={handleInputChange}
            placeholder="Enter image URL"
            description="Provide a direct link to your property image"
          />

          <FormField
            label="Price (MATIC)"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            type="number"
            placeholder="Enter price in MATIC"
            description="Set your property price in MATIC tokens"
          />
          
          <div className="flex flex-col space-y-4">
            <div>
              <Button
                type="button"
                onClick={handleMintToken}
                disabled={isMinting || !!tokenId}
                className="w-full"
              >
                {isMinting ? "Minting..." : tokenId ? "Token Minted" : "Mint Token"}
              </Button>
            </div>
            
            {tokenId && (
              <p className="text-sm text-gray-600">
                Token ID: {tokenId.toString()}
              </p>
            )}
            
            <div>
              <Button 
                type="submit" 
                disabled={isLoading || !tokenId}
                className="w-full"
              >
                {isLoading ? "Listing..." : "List Property"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}