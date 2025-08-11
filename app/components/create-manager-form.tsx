"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Eye, EyeOff } from "lucide-react"

interface Institution {
  id: number
  name: string
}

export function CreateManagerForm() {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    role: "manager",
  })
  const [selectedInstitutions, setSelectedInstitutions] = useState<number[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock institutions - replace with actual API call
  const institutions: Institution[] = [
    { id: 1, name: "Main University" },
    { id: 2, name: "Technical College" },
    { id: 3, name: "Medical Institute" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleInstitutionToggle = (institutionId: number) => {
    setSelectedInstitutions((prev) =>
      prev.includes(institutionId) ? prev.filter((id) => id !== institutionId) : [...prev, institutionId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phoneNumber) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive",
      })
      return
    }

    if (selectedInstitutions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one institution",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/admins/create-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          institutionIds: selectedInstitutions,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create manager")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: result.note || "Manager created successfully",
      })

      // Show temporary password if generated
      if (result.tempPassword) {
        toast({
          title: "Temporary Password",
          description: `Temporary password: ${result.tempPassword}`,
          duration: 10000,
        })
      }

      // Reset form
      setFormData({
        name: "",
        phoneNumber: "",
        password: "",
        role: "manager",
      })
      setSelectedInstitutions([])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create manager",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create New Manager
        </CardTitle>
        <CardDescription>Create a new manager account and assign to institutions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password (Optional)</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Leave empty for auto-generated password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">If left empty, a temporary password will be generated</p>
          </div>

          <div className="space-y-3">
            <Label>Assign to Institutions</Label>
            <div className="space-y-2">
              {institutions.map((institution) => (
                <div key={institution.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`institution-${institution.id}`}
                    checked={selectedInstitutions.includes(institution.id)}
                    onCheckedChange={() => handleInstitutionToggle(institution.id)}
                  />
                  <Label htmlFor={`institution-${institution.id}`} className="text-sm font-normal">
                    {institution.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating Manager..." : "Create Manager"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
