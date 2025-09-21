import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  FileText,
  Database,
  Lock,
  TrendingUp,
  Target,
  Lightbulb,
  Award
} from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold glow-text">Billport</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The world's first blockchain-based trade finance platform that turns warehouse receipts 
          from untrusted PDFs into cryptographic proofs everyone can trust.
        </p>
        <div className="flex justify-center gap-4">
          <Badge className="bg-emerald-500 text-white px-4 py-2 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Proof, Not PDFs
          </Badge>
          <Badge className="bg-blue-500 text-white px-4 py-2 text-sm">
            <Zap className="w-4 h-4 mr-2" />
            Instant Verification
          </Badge>
          <Badge className="bg-purple-500 text-white px-4 py-2 text-sm">
            <Globe className="w-4 h-4 mr-2" />
            Global Access
          </Badge>
        </div>
      </div>

      {/* Problem & Solution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="card-glow border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Target className="w-5 h-5" />
              The $2.5 Trillion Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              $2.5T
            </div>
            <p className="text-muted-foreground">
              Global trade finance gap leaving small and mid-sized exporters unfunded
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Banks don't trust paper warehouse receipts (too easy to fake)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Double-pledging of the same goods for multiple loans
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Manual verification processes are slow and expensive
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Limited access to working capital for real businesses
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="card-glow border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Lightbulb className="w-5 h-5" />
              Our Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              Billport
            </div>
            <p className="text-muted-foreground">
              Blockchain-based rails where exporters prove their goods exist and aren't double-pledged
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Cryptographic proofs replace untrusted PDFs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Automatic double-pledge prevention
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Decentralized verification via Flare Data Connector
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Instant, transparent escrow release
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-2xl text-center">How Billport Works</CardTitle>
          <CardDescription className="text-center">
            A hybrid Flare + XRPL architecture that combines programmable logic with fast settlement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Flare Side */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Flare Network</h3>
                  <p className="text-sm text-muted-foreground">The Brain + Lockbox</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">WR Registry</h4>
                    <p className="text-sm text-muted-foreground">Registers warehouse receipt hashes to prevent double-pledging</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Proof Registry</h4>
                    <p className="text-sm text-muted-foreground">Accepts cryptographic proofs from Flare Data Connector</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Lock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Milestone Escrow</h4>
                    <p className="text-sm text-muted-foreground">Holds lender funds and releases only on verified milestones</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">FDC (Flare Data Connector)</h4>
                    <p className="text-sm text-muted-foreground">Fetches real-world data and produces cryptographic proofs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* XRPL Side */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">XRPL Network</h3>
                  <p className="text-sm text-muted-foreground">The Badge + Receipt</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">WR-NFT</h4>
                    <p className="text-sm text-muted-foreground">Minted when WR is onboarded - visible proof of collateral</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">INV-IOU</h4>
                    <p className="text-sm text-muted-foreground">Issued to lenders when they fund, burned on repayment</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Fast Payments</h4>
                    <p className="text-sm text-muted-foreground">Instant settlement in XRPL's payment ecosystem</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">NFT Ecosystem</h4>
                    <p className="text-sm text-muted-foreground">Integration with XRPL's growing NFT marketplace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Why Billport is Revolutionary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold">Proof, Not PDFs</h3>
              <p className="text-sm text-muted-foreground">
                Replace untrusted documents with cryptographic proofs everyone can verify
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold">Decentralized Trust</h3>
              <p className="text-sm text-muted-foreground">
                Multiple validators must agree before funds are released - no single point of failure
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold">Double-Pledge Prevention</h3>
              <p className="text-sm text-muted-foreground">
                WRs are hashed and stored on-chain - impossible to reuse the same goods
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-2xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold">Automatic Escrow</h3>
              <p className="text-sm text-muted-foreground">
                Funds are locked and only released when real-world events are cryptographically proven
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="card-glow bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20">
        <CardContent className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Trade Finance?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of trade finance where warehouse receipts become trusted, 
            verifiable digital assets that unlock working capital for businesses worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-primary text-lg px-8 py-3">
              Start Trading
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;