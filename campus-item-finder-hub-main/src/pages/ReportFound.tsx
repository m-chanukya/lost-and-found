import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Mail } from "lucide-react";
import Layout from "@/components/Layout";
import { ItemFormData } from "@/types";

const categories = [
  "Electronics",
  "Books",
  "Clothing",
  "Bags",
  "Keys",
  "ID/Cards",
  "Jewelry",
  "Other",
];

const ReportFound = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ItemFormData>({
    type: "found",
    title: "",
    description: "",
    category: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    contactInfo: user?.email || "",
  });

  const [useGmail, setUseGmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/found-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          category: formData.category,
          title: formData.title,
          description: formData.description,
          foundLocation: formData.location,
          date: new Date(formData.date),
          characteristics: {
            color: formData.color,
            brand: formData.brand,
            size: formData.size,
            markings: formData.markings,
            additionalDetails: formData.additionalDetails
          },
          status: 'pending'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit found item');
      }

      const result = await response.json();

      toast({
        title: "Item reported",
        description: result.matches 
          ? `The found item has been reported and ${result.matches.count} potential matches were found!`
          : "The found item has been reported successfully.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to report item:", error);
      toast({
        title: "Error",
        description: "Failed to report item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Report a Found Item</CardTitle>
            <CardDescription>
              Provide details about the item you've found on campus
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Item Name</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Blue Backpack, iPhone, etc."
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide details about the item (color, brand, distinguishing features, etc.)"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Where Found</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Library, Cafeteria, etc."
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date Found</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input
                  id="contactInfo"
                  name="contactInfo"
                  placeholder="Email or phone number"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="useGmail"
                  checked={useGmail}
                  onCheckedChange={setUseGmail}
                />
                <Label htmlFor="useGmail" className="cursor-pointer">
                  Add Gmail for communication
                </Label>
              </div>

              {useGmail && (
                <div className="space-y-2">
                  <Label htmlFor="gmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Gmail Address
                  </Label>
                  <Input
                    id="gmail"
                    name="gmail"
                    placeholder="your.name@gmail.com"
                    value={formData.gmail || ""}
                    onChange={handleChange}
                    type="email"
                    className="bg-blue-50 border-blue-200"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportFound;
