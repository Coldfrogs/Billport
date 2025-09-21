import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet, DollarSign, TrendingUp, Shield, FileText, CheckCircle, Coins } from "lucide-react";

interface BalanceState {
  c2flr: number;
  mockUSD: number;
  totalRequested: number;
  totalFunded: number;
  totalVerified: number;
}

const Dashboard: React.FC = () => {
  // Wallet balances - fetched from blockchain
  const [balances, setBalances] = useState<BalanceState>({
    c2flr: 0,
    mockUSD: 0,
    totalRequested: 0,
    totalFunded: 0,
    totalVerified: 0,
  });
  const [walletAddress, setWalletAddress] = useState<string>("0xdaC0C95975eD9E9B90E99759B5e1dD5EcfCF3A46");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch wallet balances
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        console.log('Fetching balances for address:', walletAddress);
        const response = await fetch(`/api/balance/${walletAddress}`);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Balance data received:', data);
        
        setBalances({
          c2flr: parseFloat(data.c2flr),
          mockUSD: parseFloat(data.mockUSD),
          totalRequested: 255000, // Mock data
          totalFunded: 85000, // Mock data
          totalVerified: 60000, // Mock data
        });
        setIsLoading(false);
        setIsConnected(true);
      } catch (error) {
        console.error('Error fetching balances:', error);
        setIsLoading(false);
        setIsConnected(false);
      }
    };

    fetchBalances();
  }, [walletAddress]);

  const connectWallet = () => {
    setIsConnected(true);
    // Simulate wallet connection
    const newAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    setWalletAddress(newAddress);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("0xdaC0C95975eD9E9B90E99759B5e1dD5EcfCF3A46");
  };

  const fundingProgress = (balances.totalFunded / balances.totalRequested) * 100;
  const verificationProgress = (balances.totalVerified / balances.totalFunded) * 100;

  const stats = [
    {
      title: "C2FLR Balance",
      value: `${balances.c2flr.toFixed(4)} C2FLR`,
      description: "Native Token for Gas",
      icon: Coins,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "MockUSD Balance",
      value: `$${balances.mockUSD.toLocaleString()}`,
      description: "Stablecoin for Trading",
      icon: Wallet,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Total Requested",
      value: `$${balances.totalRequested.toLocaleString()}`,
      description: "Across all deals",
      icon: FileText,
      gradient: "from-blue-500 to-purple-500",
    },
    {
      title: "Total Funded",
      value: `$${balances.totalFunded.toLocaleString()}`,
      description: `${fundingProgress.toFixed(1)}% of requested`,
      icon: DollarSign,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Verified & Released",
      value: `$${balances.totalVerified.toLocaleString()}`,
      description: `${verificationProgress.toFixed(1)}% of funded`,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  // Demo activity - in production this would come from blockchain events
  const recentActivity: any[] = [
    // Activity will appear here when smart contracts are connected
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "status-pending",
      funded: "status-funded",
      verified: "status-verified",
      released: "status-released",
    };
    return statusClasses[status as keyof typeof statusClasses] || "status-pending";
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your trade finance portfolio with real blockchain data
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium">Wallet:</span> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        </div>
        <div className="flex gap-3">
          {isConnected ? (
            <Button onClick={disconnectWallet} className="btn-secondary">
              <Shield className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          ) : (
            <Button onClick={connectWallet} className="btn-primary">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
          <Button onClick={() => window.location.reload()} className="btn-primary">
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading wallet balances...</p>
          </div>
        ) : (
          stats.map((stat, index) => (
            <Card key={index} className="card-glow group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-billport">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Funding Progress
            </CardTitle>
            <CardDescription>Overall funding across all warehouse receipts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Funded</span>
                <span>{fundingProgress.toFixed(1)}%</span>
              </div>
              <Progress value={fundingProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Requested</p>
                <p className="font-semibold">${balances.totalRequested.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Funded</p>
                <p className="font-semibold text-emerald-400">${balances.totalFunded.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-billport">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Verification Progress
            </CardTitle>
            <CardDescription>Warehouse receipts verified and released</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Verified</span>
                <span>{verificationProgress.toFixed(1)}%</span>
              </div>
              <Progress value={verificationProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Funded</p>
                <p className="font-semibold">${balances.totalFunded.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Released</p>
                <p className="font-semibold text-green-400">${balances.totalVerified.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="card-billport">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest transactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No Activity Yet</p>
                <p className="text-sm">Connect smart contracts to see real transaction activity</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                      {activity.id.split('-')[1]}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.id} • {activity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{activity.amount}</span>
                    <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(activity.status)}`}>
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;