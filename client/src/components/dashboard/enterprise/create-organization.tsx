"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { Building2, Users, Mail, Globe, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    domain: '',
    billingEmail: session?.user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/enterprise/create-organization', formData);
      setSuccess('Organization created successfully! Redirecting to enterprise dashboard...');
      // Wait a moment before redirecting
      setTimeout(() => {
        router.push('/enterprise/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.response?.data?.error || 'Failed to create organization. Please try again.');
    } finally {
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
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Create New Organization</h1>
        <p className="text-muted-foreground mt-2">Set up your enterprise organization to manage users and resources</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => setError(null)}
          >
            <X size={16} />
          </Button>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
        >
          <CheckCircle2 className="text-green-500 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Enter information about your new organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationName">
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 size={16} />
                  <span>Organization Name</span>
                </div>
              </Label>
              <Input
                id="organizationName"
                name="organizationName"
                placeholder="Acme Corporation"
                value={formData.organizationName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">
                <div className="flex items-center gap-2 mb-1.5">
                  <Globe size={16} />
                  <span>Domain</span>
                </div>
              </Label>
              <Input
                id="domain"
                name="domain"
                placeholder="acme.com"
                value={formData.domain}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This domain will be used for automatic user provisioning
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingEmail">
                <div className="flex items-center gap-2 mb-1.5">
                  <Mail size={16} />
                  <span>Billing Email</span>
                </div>
              </Label>
              <Input
                id="billingEmail"
                name="billingEmail"
                type="email"
                placeholder="billing@acme.com"
                value={formData.billingEmail}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll send invoices and billing notifications to this email
              </p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Users size={16} />
                    <span>Create Organization</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}