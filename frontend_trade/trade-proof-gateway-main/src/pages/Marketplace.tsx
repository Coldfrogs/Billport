import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Calendar, DollarSign, TrendingUp, Search, Filter, Eye, Wallet, AlertCircle } from "lucide-react";

interface Deal {
  id: string;
  wrId: string;
  issuer: string;
  location: string;
  commodity: string;
  amount: number;
  requestedFunding: number;
  interestRate: number;
  duration: number;
  status: "listed" | "funded" | "verified" | "released";
  collateralType: string;
  riskScore: number;
  listedDate: string;
}

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("amount");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // Fetch deals from API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        setDeals(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching deals:', error);
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Check wallet connection
  useEffect(() => {
    const checkConnection = () => {
      const connected = localStorage.getItem('walletConnected') === 'true';
      setIsConnected(connected);
      if (connected) {
        // Fetch wallet balance
        fetchWalletBalance();
      }
    };
    checkConnection();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/balance/0xdaC0C95975eD9E9B90E99759B5e1dD5EcfCF3A46');
      const data = await response.json();
      setWalletBalance(parseFloat(data.mockUSD));
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const connectWallet = () => {
    setIsConnected(true);
    localStorage.setItem('walletConnected', 'true');
    fetchWalletBalance();
  };

  const fundDeal = async (dealId: string, amount: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (walletBalance < amount) {
      alert('Insufficient balance. You need more MockUSD to fund this deal.');
      return;
    }

    try {
      // Simulate funding
      const response = await fetch(`/api/deals/${dealId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        alert(`Successfully funded deal ${dealId} with $${amount.toLocaleString()}`);
        // Refresh deals
        const dealsResponse = await fetch('/api/deals');
        const dealsData = await dealsResponse.json();
        setDeals(dealsData);
        fetchWalletBalance();
      }
    } catch (error) {
      console.error('Error funding deal:', error);
      alert('Error funding deal. Please try again.');
    }
  };

  const viewDealDetails = (deal: Deal) => {
    alert(`Deal Details:\n\nID: ${deal.id}\nCommodity: ${deal.commodity}\nAmount: $${deal.amount.toLocaleString()}\nRequested: $${deal.requestedFunding.toLocaleString()}\nInterest Rate: ${deal.interestRate}%\nDuration: ${deal.duration} days\nRisk Score: ${deal.riskScore}/10\nStatus: ${deal.status.toUpperCase()}`);
  };

  // Initialize with mock data if API fails
  useEffect(() => {
    if (deals.length === 0 && !isLoading) {
      const mockDeals: Deal[] = [
        {
          id: "DEAL-001",
          wrId: "WR-2024-001",
          issuer: "AgriCorp Ltd",
          location: "Lagos, Nigeria",
          commodity: "Cocoa Beans",
          amount: 50000,
          requestedFunding: 40000,
          interestRate: 8.5,
          duration: 90,
          status: "listed",
          collateralType: "Warehouse Receipt",
          riskScore: 7.2,
          listedDate: "2024-01-15",
        },
        {
          id: "DEAL-002",
          wrId: "WR-2024-002",
          issuer: "Global Commodities",
          location: "Accra, Ghana",
          commodity: "Coffee Beans",
          amount: 75000,
          requestedFunding: 60000,
          interestRate: 7.8,
          duration: 120,
          status: "funded",
          collateralType: "Warehouse Receipt",
          riskScore: 8.1,
          listedDate: "2024-01-12",
        },
        {
          id: "DEAL-003",
          wrId: "WR-2024-003",
          issuer: "East African Traders",
          location: "Nairobi, Kenya",
          commodity: "Tea Leaves",
          amount: 30000,
          requestedFunding: 25000,
          interestRate: 9.2,
          duration: 60,
          status: "verified",
          collateralType: "Warehouse Receipt",
          riskScore: 6.8,
          listedDate: "2024-01-10",
        },
        {
          id: "DEAL-004",
          wrId: "WR-2024-004",
          issuer: "Sahel Agriculture",
          location: "Abidjan, Côte d'Ivoire",
          commodity: "Palm Oil",
          amount: 100000,
          requestedFunding: 80000,
          interestRate: 8.0,
          duration: 150,
          status: "listed",
          collateralType: "Warehouse Receipt",
          riskScore: 7.9,
          listedDate: "2024-01-08",
        },
      ];
      setDeals(mockDeals);
    }
  }, [deals.length, isLoading]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      listed: "status-pending",
      funded: "status-funded",
      verified: "status-verified",
      released: "status-released",
    };
    return statusClasses[status as keyof typeof statusClasses] || "status-pending";
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const filteredDeals = deals
    .filter(deal => {
      if (filterStatus !== "all" && deal.status !== filterStatus) return false;
      if (searchTerm && !deal.issuer.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !deal.commodity.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount": return b.amount - a.amount;
        case "rate": return b.interestRate - a.interestRate;
        case "risk": return b.riskScore - a.riskScore;
        default: return 0;
      }
    });

  const handleFundDeal = (dealId: string) => {
    console.log("Funding deal:", dealId);
    // Here you would implement the actual funding logic
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Discover and fund trade finance opportunities
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Wallet Connected</span>
              <span className="text-sm text-muted-foreground">
                Balance: ${walletBalance.toLocaleString()} MockUSD
              </span>
            </div>
          ) : (
            <Button onClick={connectWallet} className="btn-primary">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
          <Button 
            className="btn-secondary"
            onClick={() => alert('List Deal feature coming soon!\n\nSMEs will be able to:\n- Upload warehouse receipts\n- Set funding requirements\n- Define interest rates\n- Submit for verification')}
          >
            <Building2 className="w-4 h-4 mr-2" />
            List Deal
          </Button>
          <Button 
            className="btn-primary"
            onClick={() => alert('Pool Funding feature coming soon!\n\nLenders can:\n- Pool funds together\n- Diversify risk\n- Access larger deals\n- Share returns')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Pool Funding
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-billport">
        <CardHeader>
          <CardTitle className="text-lg">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by issuer or commodity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="rate">Interest Rate</SelectItem>
                <SelectItem value="risk">Risk Score</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="listed">Listed</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="btn-ghost"
              onClick={() => alert('Advanced filters coming soon!\n\nYou can filter by:\n- Risk Score Range\n- Geographic Region\n- Commodity Type\n- Funding Amount Range')}
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deals Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-2">Loading deals...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDeals.map((deal) => (
          <Card key={deal.id} className="card-glow group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{deal.issuer}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    {deal.location}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusBadge(deal.status)} px-3 py-1`}>
                  {deal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Deal Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Commodity</p>
                  <p className="font-semibold">{deal.commodity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">WR ID</p>
                  <p className="font-semibold">{deal.wrId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Collateral Value</p>
                  <p className="font-semibold">${deal.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Funding Needed</p>
                  <p className="font-semibold text-emerald-400">${deal.requestedFunding.toLocaleString()}</p>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">{deal.interestRate}%</span>
                    <span className="text-muted-foreground">APR</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold">{deal.duration}</span>
                    <span className="text-muted-foreground">days</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                  <p className={`font-bold ${getRiskColor(deal.riskScore)}`}>
                    {deal.riskScore}/10
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1 btn-primary"
                  onClick={() => fundDeal(deal.id, deal.requestedFunding)}
                  disabled={deal.status !== "listed"}
                >
                  {deal.status === "listed" ? (
                    <>Fund ${deal.requestedFunding.toLocaleString()}</>
                  ) : (
                    <>View Details</>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => viewDealDetails(deal)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Stats Summary */}
      <Card className="card-billport">
        <CardHeader>
          <CardTitle>Marketplace Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-400">{deals.length}</p>
              <p className="text-sm text-muted-foreground">Total Deals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                ${deals.reduce((sum, deal) => sum + deal.requestedFunding, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Funding Needed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">
                {(deals.reduce((sum, deal) => sum + deal.interestRate, 0) / deals.length).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Interest Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {(deals.reduce((sum, deal) => sum + deal.riskScore, 0) / deals.length).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Avg Risk Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketplace;