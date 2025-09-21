import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, DollarSign, Shield, CheckCircle, Play, Pause, RotateCcw, Eye } from "lucide-react";

interface FlowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  status: "pending" | "active" | "completed";
  value?: string;
}

const CopperFlow: React.FC = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [steps, setSteps] = useState<FlowStep[]>([
    {
      id: 1,
      title: "Invoice Creation",
      description: "Supplier creates commercial invoice for goods",
      icon: FileText,
      status: "completed",
      value: "INV-2024-001"
    },
    {
      id: 2,
      title: "Document Upload",
      description: "Upload invoice, bill of lading, and quality certificates",
      icon: FileText,
      status: "completed",
      value: "4 Documents"
    },
    {
      id: 3,
      title: "Warehouse Receipt Issuance",
      description: "Authorized warehouse issues WR for stored goods",
      icon: Shield,
      status: "completed",
      value: "WR-2024-001"
    },
    {
      id: 4,
      title: "Credit Assessment",
      description: "AI/ML system evaluates creditworthiness and risk",
      icon: Shield,
      status: "active",
      value: "Risk Score: 7.2/10"
    },
    {
      id: 5,
      title: "Deal Listing",
      description: "Deal listed on marketplace for funding",
      icon: DollarSign,
      status: "pending",
      value: "$50,000"
    },
    {
      id: 6,
      title: "Lender Funding",
      description: "Lender provides funding through escrow",
      icon: DollarSign,
      status: "pending",
      value: "$40,000"
    },
    {
      id: 7,
      title: "FDC Verification",
      description: "Flare Data Connector verifies WR authenticity",
      icon: Shield,
      status: "pending",
      value: "FDC Verified"
    },
    {
      id: 8,
      title: "Funds Release",
      description: "Escrow releases funds to supplier",
      icon: CheckCircle,
      status: "pending",
      value: "Complete"
    }
  ]);

  const capitalFlow = [
    { from: "Lender Pool", to: "Escrow Contract", amount: "$50,000", percentage: 100 },
    { from: "Escrow Contract", to: "SME Wallet", amount: "$45,000", percentage: 90 },
    { from: "Escrow Contract", to: "Platform Fee", amount: "$2,500", percentage: 5 },
    { from: "Escrow Contract", to: "Insurance", amount: "$2,500", percentage: 5 },
  ];

  useEffect(() => {
    if (isAnimating && demoMode) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = prev + 1;
          if (nextStep >= steps.length) {
            setIsAnimating(false);
            return prev;
          }
          
          setSteps(prevSteps => 
            prevSteps.map((step, index) => ({
              ...step,
              status: index < nextStep ? "completed" : 
                     index === nextStep ? "active" : "pending"
            }))
          );
          
          return nextStep;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isAnimating, demoMode, steps.length]);

  const startDemo = () => {
    setIsAnimating(true);
    setCurrentStep(0);
    setSteps(steps.map((step, index) => ({
      ...step,
      status: index === 0 ? "active" : "pending"
    })));
  };

  const resetDemo = () => {
    setIsAnimating(false);
    setCurrentStep(0);
    setSteps(steps.map(step => ({ ...step, status: "pending" })));
  };

  const getStepIcon = (step: FlowStep, index: number) => {
    const IconComponent = step.icon;
    const isActive = step.status === "active";
    const isCompleted = step.status === "completed";
    
    return (
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
        ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' :
          isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-glow' :
          'bg-muted border-2 border-border text-muted-foreground'}
      `}>
        <IconComponent className="w-6 h-6" />
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">CopperFlow Visualization</h1>
          <p className="text-muted-foreground mt-2">
            Real-time visualization of trade finance flows
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="btn-secondary"
            onClick={() => setDemoMode(!demoMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {demoMode ? "Live Mode" : "Demo Mode"}
          </Button>
          {demoMode && (
            <>
              <Button 
                className="btn-secondary"
                onClick={isAnimating ? () => setIsAnimating(false) : startDemo}
              >
                {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isAnimating ? "Pause" : "Start Demo"}
              </Button>
              <Button 
                className="btn-ghost"
                onClick={resetDemo}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Process Flow Stepper */}
      <Card className="card-billport">
        <CardHeader>
          <CardTitle>Trade Finance Process Flow</CardTitle>
          <CardDescription>
            {demoMode ? "Interactive demonstration of the complete flow" : "Live process tracking"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-6">
                {/* Step Icon */}
                {getStepIcon(step, index)}
                
                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold text-lg ${
                      step.status === "completed" ? "text-emerald-400" :
                      step.status === "active" ? "text-blue-400" : 
                      "text-muted-foreground"
                    }`}>
                      {step.title}
                    </h3>
                    {step.value && (
                      <Badge className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${step.status === "completed" ? "status-verified" :
                          step.status === "active" ? "status-funded" : 
                          "status-pending"}
                      `}>
                        {step.value}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                  
                  {/* Progress Bar for Active Step */}
                  {step.status === "active" && isAnimating && (
                    <div className="mt-3">
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Processing...</p>
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    absolute left-6 mt-12 w-0.5 h-16 transition-colors duration-500
                    ${step.status === "completed" ? "bg-gradient-to-b from-emerald-500 to-teal-500" : "bg-border"}
                  `} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capital Flow Sankey */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-billport">
          <CardHeader>
            <CardTitle>Capital Flow Distribution</CardTitle>
            <CardDescription>How funds move through the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {capitalFlow.map((flow, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{flow.from}</span>
                    <span>{flow.to}</span>
                  </div>
                  <div className="relative">
                    <div className="h-4 bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: isAnimating && currentStep > index ? `${flow.percentage}%` : '0%',
                          animationDelay: `${index * 0.5}s`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{flow.amount}</span>
                      <span>{flow.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-billport">
          <CardHeader>
            <CardTitle>Logistics vs Capital Flow</CardTitle>
            <CardDescription>Physical and financial movement tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Logistics Flow */}
              <div>
                <h4 className="font-semibold text-purple-400 mb-3">Logistics Flow</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Warehouse → Port</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-400" />
                    <span className="text-sm">Port → Ship</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-300" />
                    <span className="text-sm">Ship → Destination</span>
                  </div>
                </div>
              </div>

              {/* Capital Flow */}
              <div>
                <h4 className="font-semibold text-emerald-400 mb-3">Capital Flow</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm">Lender → Escrow</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-sm">Escrow → SME</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-300" />
                    <span className="text-sm">SME → Settlement</span>
                  </div>
                </div>
              </div>

              {/* Sync Status */}
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm font-medium text-green-400">Flows Synchronized</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Logistics and capital flows are moving in sync
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics */}
      <Card className="card-billport">
        <CardHeader>
          <CardTitle>Real-time Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-emerald-400">2.3s</p>
              <p className="text-sm text-muted-foreground">Avg Processing Time</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-400">99.8%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-purple-400">156</p>
              <p className="text-sm text-muted-foreground">Active Flows</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-400">$2.1M</p>
              <p className="text-sm text-muted-foreground">Total Volume</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CopperFlow;