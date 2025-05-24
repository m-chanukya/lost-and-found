
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { Item } from "@/types";

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For demo, we'll use localStorage
    const storedItems = JSON.parse(localStorage.getItem("campus-items") || "[]");
    setItems(storedItems);
  }, []);

  const filteredItems = items.filter((item) => {
    // First apply tab filter
    if (filter !== "all" && item.type !== filter) {
      return false;
    }

    // Then apply search filter (case insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline">
              <Link to="/report-lost">
                <Plus className="mr-1 h-4 w-4" /> Report Lost
              </Link>
            </Button>
            <Button asChild>
              <Link to="/report-found">
                <Plus className="mr-1 h-4 w-4" /> Report Found
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <TabsList>
                  <TabsTrigger
                    value="all"
                    onClick={() => setFilter("all")}
                  >
                    All Items
                  </TabsTrigger>
                  <TabsTrigger
                    value="lost"
                    onClick={() => setFilter("lost")}
                  >
                    Lost Items
                  </TabsTrigger>
                  <TabsTrigger
                    value="found"
                    onClick={() => setFilter("found")}
                  >
                    Found Items
                  </TabsTrigger>
                </TabsList>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="all" className="mt-0">
                <ItemsTable items={filteredItems} formatDate={formatDate} />
              </TabsContent>
              <TabsContent value="lost" className="mt-0">
                <ItemsTable items={filteredItems} formatDate={formatDate} />
              </TabsContent>
              <TabsContent value="found" className="mt-0">
                <ItemsTable items={filteredItems} formatDate={formatDate} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

interface ItemsTableProps {
  items: Item[];
  formatDate: (date: string) => string;
}

const ItemsTable = ({ items, formatDate }: ItemsTableProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No items found. Report a lost or found item to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Badge
                  variant={item.type === "lost" ? "destructive" : "default"}
                >
                  {item.type === "lost" ? "Lost" : "Found"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {item.description}
                </div>
              </TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell>
                <div>{item.contactInfo}</div>
                {item.gmail && (
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <Mail className="h-3 w-3" />
                    <span>{item.gmail}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={item.status === "open" ? "outline" : "secondary"}
                >
                  {item.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Dashboard;
