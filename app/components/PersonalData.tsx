"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams } from 'next/navigation';
interface Employee {
  id: string
  name: string
  phoneNumber: string
  institutionKey: string
}


const BaseUrl = process.env.NEXT_PUBLIC_API_URL

export function PersonalDataCard() {
  const [isEditing, setIsEditing] = useState(false)
  //const [formData, setFormData] = useState({})
  const [formData, setFormData] = useState<Employee>({id: "",
    name: "",
    phoneNumber: "",
    institutionKey: "",});
  const params = useParams()
  const employeeId = Array.isArray(params.employeeId) ? params.employeeId[0] : params.employeeId as string


  useEffect(() => {
    const getPersonalData = async () => {
      const response = await fetch(`${BaseUrl}/api?employeeId=${employeeId}`);
      const data = await response.json();
      setFormData({
        id: data[0]._id, // Since Mongoose `find()` method returns an array
        name: data[0].name,
        phoneNumber: data[0].phoneNumber,
        institutionKey: data[0].institutionKey,
      });
      console.log(data);
    };
    getPersonalData();

  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send an API request to update the employee data
    console.log("Updating employee:", formData)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Data</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="institutionKey">Institution Key</Label>
              <Input
                id="institutionKey"
                name="institutionKey"
                value={formData.institutionKey}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {formData.name}
            </p>
            <p>
              <strong>Phone:</strong> {formData.phoneNumber}
            </p>
            <p>
              <strong>Institution Key:</strong> {formData.institutionKey}
            </p>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

