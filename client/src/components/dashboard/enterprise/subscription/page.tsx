// app/enterprise/subscription/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Shield, 
  Users, 
  BarChart2, 
  FileCheck, 
  Lock 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PlanFeature {
  title: string;
  included: { basic: boolean; professional: boolean; enterprise: boolean };
  description?: string;
}

interface PlanDetails {
  name: string;
  id: 'basic' | 'professional' | 'enterprise';
  price: number;
  maxUsers: number;
  mainFeature: string;
  features: PlanFeature[];
}

const enterprisePlans: PlanDetails[] = [
  {
    name: 'Basic',
    id: 'basic',
    price: 199,
    maxUsers: 10,
    mainFeature: 'For small teams getting started',
    features: [
      { title: 'Team collaboration', included: { basic: true, professional: true, enterprise: true } },
      { title: 'Contract sharing', included: { basic: true, professional: true, enterprise: true } },
      { title: 'Analytics dashboard', included: { basic: true, professional: true, enterprise: true } },
      { title: 'Custom templates', included: { basic: false, professional: true, enterprise: true } },
      { title: 'Bulk uploads', included: { basic: false, professional: true, enterprise: true } },
      { title: 'API access', included: { basic: false, professional: true, enterprise: true } },
      { title: 'Advanced analytics', included: { basic: false, professional: true, enterprise: true } },
      { title: 'Single Sign-On (SSO)', included: { basic: false, professional: false, enterprise: true } },
      { title: 'Audit logs', included: { basic: false, professional: false, enterprise: true } },
      { title: 'Dedicated support', included: { basic: false, professional: false, enterprise: true } },
    ]
  },
  {
    name: 'Professional',
    id: 'professional',
    price: 499,
    maxUsers: 25,
    mainFeature: 'For growing teams with advanced needs',
    features: [
      { title: 'Team collaboration', included: { basic: true, professional: true, enterprise: true } },
      { title: 'Contract sharing', included: { basic: true, professional: true, enterprise: true } },
      { title: 'Analytics dashboard', included: { basic: true, professional: true, enterprise: true } },
      { title: 'Custom templates', included: { basic: false, professional: true, enterprise: true } },
      { title: 'Bulk uploads', included: { basic: false, professional: true, enterprise: true } },
      { title: 'API access', included: { basic: false, professional: true, enterprise: true } },
      { title: 'Advanced analytics', included: { basic: false, professional: true, enterprise: true } },
      { title: 'Single Sign-On (SSO)', included: { basic: false, professional: false, enterprise: true } },
      { title: 'Audit logs', included: { basic: false, professional: false, enterprise: true } },
      { title: 'Dedicated support', included: { basic: false, professional: false, enterprise: true } },
    ]
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    price: 999,
    maxUsers: 100,
    mainFeature: 'For large organizations with complex needs',
    features: [
      { title: 'Team collaboration', included: { basic: true, professional: true, enterprise: true } },
      { title: 'Contract sharing', included: { basic: true, professional: true, enterprise: true } },
      { title: 'Analytics dashboard', included: { basic: true, professional: true, enterprise: true } },
      { title: 'Custom templates', included: { basic: false, professional: true, enterprise: true } },
      { title: 'Bulk uploads', included: { basic: false, professional: true, enterprise: true } },
      { title: 'API access', included: { basic: false, professional: true, enterprise: true } },
      { title: 'Advanced analytics', included: { basic: false, professional: true, enterprise: true } },
      { title: 'Single Sign-On (SSO)', included: { basic: false, professional: false, enterprise: true } },
      { title: 'Audit logs', included: { basic: false, professional: false, enterprise: true } },
      { title: 'Dedicated support', included: { basic: false, professional: false, enterprise: true } },
    ]
  }
];

export default function EnterpriseSubscriptionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'professional' | 'enterprise'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubscribe = async () => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/enterprise/create-subscription', {
        planType: selectedPlan
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else if (response.data.sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({
            sessionId: response.data.sessionId,
          });
        }
      }
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      setError(err.response?.data?.error || 'Failed to create subscription. Please try again.');
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sign in Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to manage your enterprise subscription.</p>
          <Button
            onClick={() => router.push('/api/auth/signin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enterprise Subscription Plans</h1>
        <p className="text-gray-600">
          Choose the right plan for your organization's needs
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center"
        >
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {enterprisePlans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: plan.id === 'basic' ? 0.1 : plan.id === 'professional' ? 0.2 : 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className={`h-full ${
                isSelected 
                  ? 'border-blue-500 ring-2 ring-blue-500 shadow-lg' 
                  : 'border-gray-200 shadow-sm hover:shadow-md'
              } transition-all duration-200`}>
                <CardHeader className={`${isSelected ? 'bg-blue-50' : ''}`}>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.mainFeature}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {plan.maxUsers} team members included
                  </p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 my-6">
                    {plan.features.map((feature, index) => {
                      const isIncluded = feature.included[plan.id];
                      return (
                        <li key={index} className="flex items-start">
                          {isIncluded ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${isIncluded ? 'text-gray-800' : 'text-gray-400'}`}>
                            {feature.title}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <Button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
                    }`}
                    variant={isSelected ? "default" : "outline"}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Collaboration</h3>
          <p className="text-gray-600 text-sm">
            Invite team members to collaborate on contract analysis and share insights.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
          <p className="text-gray-600 text-sm">
            Gain valuable insights across all your organization's contracts.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Templates</h3>
          <p className="text-gray-600 text-sm">
            Create and share templates for frequently used contract types.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Enterprise Security</h3>
          <p className="text-gray-600 text-sm">
            SSO, audit logs, and advanced security for enterprise compliance.
          </p>
        </div>
      </motion.div>

      {/* Subscription Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Selected: {enterprisePlans.find(p => p.id === selectedPlan)?.name} Plan
            </h3>
            <p className="text-gray-600 text-sm">
              {enterprisePlans.find(p => p.id === selectedPlan)?.maxUsers} team members included
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                'Subscribe Now'
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Can I switch between plans?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your subscription at any time. 
              Changes will be effective immediately, with pro-rated charges for upgrades.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">What happens if I need more team members?</h3>
            <p className="text-gray-600">
              You can add additional team members beyond your plan's limit for $15/user/month.
              Alternatively, you can upgrade to a higher plan with more included users.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Is there a minimum commitment period?</h3>
            <p className="text-gray-600">
              No, all enterprise plans are billed monthly with no minimum commitment.
              You can cancel your subscription at any time.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="text-center">
        <p className="text-gray-600">
          Need a customized solution for your team?{' '}
          <a href="/contact" className="text-blue-600 font-medium hover:underline">
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  );
}