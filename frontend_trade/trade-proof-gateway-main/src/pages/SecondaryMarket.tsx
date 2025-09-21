import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, Calendar, DollarSign, TrendingUp, Search, Filter, Plus, ArrowUpDown } from "lucide-react";

interface SecondaryListing {
  id: string;
  originalDealId: string;
  wrId: string;
  issuer: string;
  commodity: string;
  originalAmount: number;
  remainingAmount: number;
  askingPrice: number;
  currentYield: number;
  daysToMaturity: number;
  listedBy: string;
  listedDate: string;
  status: "listed" | "sold" | "withdrawn";
}

interface InvestedPosition {
  dealId: string;
  wrId: string;
  issuer: string;
  commodity: string;
  investedAmount: number;
  currentValue: number;
  daysRemaining: number;
  status: "active" | "matured";
}

const SecondaryMarket: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("yield");
  const [isListingDialogOpen, setIsListingDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<InvestedPosition | null>(null);
  const [askingPrice, setAskingPrice] = useState("");

  // Simulated user's invested positions (would come from smart contracts)
  const [userPositions] = useState<InvestedPosition[]>([
    {
      dealId: "DEAL-002",
      wrId: "WR-2024-002",
      issuer: "Global Commodities",
      commodity: "Coffee Beans",
      investedAmount: 25000,
      currentValue: 26500,
      daysRemaining: 45,
      status: "active"
    },
    {
      dealId: "DEAL-004",
      wrId: "WR-2024-004", 
      issuer: "Tropical Exports",
      commodity: "Palm Oil",
      investedAmount: 15000,
      currentValue: 15750,
      daysRemaining: 62,
      status: "active"
    }
  ]);

  // Current secondary market listings (no smart contract yet - simulated)
  const [listings] = useState<SecondaryListing[]>([
    {
      id: "SEC-001",
      originalDealId: "DEAL-003",
      wrId: "WR-2024-003",
      issuer: "Timber Co Ltd",
      commodity: "Hardwood Lumber",
      originalAmount: 30000,
      remainingAmount: 30000,
      askingPrice: 28500,
      currentYield: 9.2,
      daysToMaturity: 55,
      listedBy: "0x742d...89f3",
      listedDate: "2024-01-18",
      status: "listed"
    }
  ]);

  const filteredListings = listings.filter(listing =>
    listing.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.wrId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleListPosition = () => {
    if (selectedPosition && askingPrice) {
      // This would interact with smart contracts when available
      console.log("Listing position:", selectedPosition, "Price:", askingPrice);
      setIsListingDialogOpen(false);
      setSelectedPosition(null);
      setAskingPrice("");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      listed: "status-pending",
      sold: "status-verified", 
      withdrawn: "status-released"
    };
    return statusMap[status as keyof typeof statusMap] || "status-pending";
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Secondary Market</h1>
          <p className="text-muted-foreground mt-2">
            Trade funded positions with other investors (Demo - No Smart Contract)
          </p>
        </div>
        <Dialog open={isListingDialogOpen} onOpenChange={setIsListingDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              List Position
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>List Your Position</DialogTitle>
              <DialogDescription>
                Select a position to list on the secondary market
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="position">Select Position</Label>
                <Select onValueChange={(value) => {
                  const position = userPositions.find(p => p.dealId === value);
                  setSelectedPosition(position || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a position to list" />
                  </SelectTrigger>
                  <SelectContent>
                    {userPositions.filter(p => p.status === "active").map((position) => (
                      <SelectItem key={position.dealId} value={position.dealId}>
                        {position.wrId} - {position.commodity} (${position.investedAmount.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPosition && (
                <>
                  <div className="bg-accent/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="font-semibold">${selectedPosition.currentValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedPosition.daysRemaining} days remaining
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Asking Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter your asking price"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={handleListPosition}
                disabled={!selectedPosition || !askingPrice}
                className="btn-primary"
              >
                List Position
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Your Positions */}
      <Card className="card-billport">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Your Invested Positions
          </CardTitle>
          <CardDescription>Positions you can list on the secondary market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userPositions.map((position) => (
              <div key={position.dealId} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                    {position.commodity.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold">{position.wrId}</h4>
                    <p className="text-sm text-muted-foreground">{position.issuer}</p>
                    <p className="text-xs text-muted-foreground">{position.commodity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${position.currentValue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Invested: ${position.investedAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-400">
                    {position.daysRemaining} days remaining
                  </p>
                </div>
              </div>
            ))}
            {userPositions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No positions to list</p>
                <p className="text-sm">Fund some deals in the marketplace first</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by issuer, commodity, or WR ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yield">Sort by Yield</SelectItem>
            <SelectItem value="price">Sort by Price</SelectItem>
            <SelectItem value="maturity">Sort by Maturity</SelectItem>
            <SelectItem value="amount">Sort by Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Secondary Market Listings */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Available Listings</h2>
        {filteredListings.length === 0 ? (
          <Card className="card-billport">
            <CardContent className="text-center py-12">
              <ArrowUpDown className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Listings Available</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to list a position on the secondary market
              </p>
              <p className="text-sm text-muted-foreground">
                Note: Secondary market functionality is in demo mode - no smart contracts deployed yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="card-glow group">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {listing.commodity.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{listing.wrId}</h3>
                          <Badge className={getStatusBadge(listing.status)}>
                            {listing.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm">{listing.issuer}</span>
                        </div>
                        <p className="text-sm font-medium">{listing.commodity}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{listing.daysToMaturity} days</span>
                          </div>
                          <span>Listed by {listing.listedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Asking Price</p>
                          <p className="font-bold text-lg">${listing.askingPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Yield</p>
                          <p className="font-bold text-lg text-emerald-400">{listing.currentYield}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-bold">${listing.remainingAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      <Button className="btn-primary whitespace-nowrap" disabled>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Buy Position (Demo)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondaryMarket;