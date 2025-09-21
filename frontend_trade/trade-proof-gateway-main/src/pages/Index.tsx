import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BillPortLogo from "@/components/BillPortLogo";
import Dashboard from "./Dashboard";
import Marketplace from "./Marketplace";
import CopperFlow from "./CopperFlow";
import WarehouseReceipts from "./WarehouseReceipts";
import About from "./About";
import { 
  LayoutDashboard, 
  Store, 
  BarChart3, 
  Workflow, 
  Vote, 
  Info, 
  Wallet,
  TrendingUp,
  Shield,
  FileText
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isConnected, setIsConnected] = useState(false);

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "marketplace", label: "Marketplace", icon: Store },
    { id: "invoices", label: "Warehouse Receipts", icon: FileText },
    { id: "copperflow", label: "CopperFlow", icon: Workflow },
    { id: "about", label: "About", icon: Info },
  ];

  const connectWallet = () => {
    // Demo wallet connection
    setIsConnected(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <BillPortLogo 
              size={48} 
              withWordmark 
              tagline="Verified trade finance made simple"
              animate
            />
            
            <div className="flex items-center gap-4">
              <Badge className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Demo Mode
              </Badge>
              
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">0x1234...5678</p>
                    <p className="text-xs text-muted-foreground">Coston2 Testnet</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                </div>
              ) : (
                <Button className="btn-primary" onClick={connectWallet}>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation Tabs */}
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full bg-card/50 backdrop-blur-sm p-1 rounded-2xl">
            {navigation.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="nav-tab flex items-center gap-2 data-[state=active]:active"
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="dashboard" className="space-y-8">
            <Dashboard />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-8">
            <Marketplace />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-8">
            <WarehouseReceipts />
          </TabsContent>

          <TabsContent value="copperflow" className="space-y-8">
            <CopperFlow />
          </TabsContent>

          <TabsContent value="about" className="space-y-8">
            <About />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
