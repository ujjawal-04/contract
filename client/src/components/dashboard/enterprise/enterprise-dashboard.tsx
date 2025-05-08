// client/src/components/dashboard/enterprise/enterprise-dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { 
  Users, 
  FileText, 
  BarChart2, 
  Settings, 
  PlusCircle, 
  Mail, 
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface TeamMember {
  _id: string;
  displayName: string;
  email: string;
  role: string;
  profilePicture?: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive?: string;
}

interface TeamContract {
  _id: string;
  contractId: {
    _id: string;
    contractType: string;
    summary: string;
    overallScore: number;
    createdAt: string;
  };
  sharedBy: {
    _id: string;
    displayName: string;
    email: string;
    profilePicture?: string;
  };
  sharedWith: string[];
  accessLevel: 'view' | 'comment' | 'edit';
  status: 'draft' | 'in-review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface Organization {
  _id: string;
  name: string;
  domain: string;
  planType: 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  features: string[];
  teamSettings: {
    allowPublicContracts: boolean;
    requireApproval: boolean;
    customTemplates: boolean;
    dataRetentionDays: number;
  };
}

const EnterpriseDashboard: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'contracts' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamContracts, setTeamContracts] = useState<TeamContract[]>([]);
  
  // UI states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'member'>('member');
  const [inviteStatus, setInviteStatus] = useState<{ success?: string; error?: string } | null>(null);
  
  // Mock data for initial UI rendering
  useEffect(() => {
    // This would be replaced with actual API calls
    const mockTeamMembers: TeamMember[] = [
      {
        _id: '1',
        displayName: 'Jane Doe',
        email: 'jane@acme.com',
        role: 'admin',
        profilePicture: '',
        status: 'active',
        lastActive: '2023-04-01T12:00:00Z',
      },
      {
        _id: '2',
        displayName: 'John Smith',
        email: 'john@acme.com',
        role: 'manager',
        profilePicture: '',
        status: 'active',
        lastActive: '2023-04-01T10:30:00Z',
      },
      {
        _id: '3',
        displayName: 'Sarah Johnson',
        email: 'sarah@acme.com',
        role: 'member',
        profilePicture: '',
        status: 'pending',
      },
    ];

    const mockOrganization: Organization = {
      _id: '1',
      name: 'Acme Corporation',
      domain: 'acme.com',
      planType: 'basic',
      maxUsers: 10,
      features: ['team-collaboration', 'contract-sharing', 'analytics-dashboard'],
      teamSettings: {
        allowPublicContracts: false,
        requireApproval: true,
        customTemplates: false,
        dataRetentionDays: 365,
      },
    };

    const mockContracts: TeamContract[] = [
      {
        _id: '1',
        contractId: {
          _id: '101',
          contractType: 'Service Agreement',
          summary: 'Agreement for IT services between Acme Corp and TechVendor Inc.',
          overallScore: 85,
          createdAt: '2023-03-15T09:00:00Z',
        },
        sharedBy: {
          _id: '1',
          displayName: 'Jane Doe',
          email: 'jane@acme.com',
        },
        sharedWith: ['2', '3'],
        accessLevel: 'view',
        status: 'approved',
        createdAt: '2023-03-15T09:30:00Z',
        updatedAt: '2023-03-20T14:00:00Z',
      },
      {
        _id: '2',
        contractId: {
          _id: '102',
          contractType: 'Employment Agreement',
          summary: 'Standard employment contract template for new hires.',
          overallScore: 92,
          createdAt: '2023-02-10T11:00:00Z',
        },
        sharedBy: {
          _id: '2',
          displayName: 'John Smith',
          email: 'john@acme.com',
        },
        sharedWith: ['1', '3'],
        accessLevel: 'edit',
        status: 'draft',
        createdAt: '2023-02-10T11:30:00Z',
        updatedAt: '2023-02-10T11:30:00Z',
      },
    ];

    // Simulate API loading delay
    setTimeout(() => {
      setTeamMembers(mockTeamMembers);
      setOrganization(mockOrganization);
      setTeamContracts(mockContracts);
      setIsLoading(false);
    }, 1000);

    // In production, you would use actual API calls:
    /*
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch organization data
        const orgResponse = await api.get('/enterprise/organization');
        setOrganization(orgResponse.data);
        
        // Fetch team members
        const teamResponse = await api.get('/enterprise/team-members');
        setTeamMembers(teamResponse.data);
        
        // Fetch shared contracts
        const contractsResponse = await api.get('/enterprise/org-contracts');
        setTeamContracts(contractsResponse.data);
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching enterprise data:', err);
        setError(err.response?.data?.error || 'Failed to load enterprise data');
        setIsLoading(false);
      }
    };
    
    fetchData();
    */
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus(null);
    
    try {
      // In production, you would use the actual API call:
      /*
      const response = await api.post('/enterprise/invite', {
        email: inviteEmail,
        role: inviteRole,
      });
      */
      
      // Mock successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInviteStatus({ success: `Invitation sent to ${inviteEmail}` });
      
      // Add mock invited user to team members
      const newMember: TeamMember = {
        _id: `temp-${Date.now()}`,
        displayName: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
      };
      
      setTeamMembers([...teamMembers, newMember]);
      
      // Reset form
      setInviteEmail('');
      setInviteRole('member');
      
      // Close modal after a delay
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteStatus(null);
      }, 2000);
    } catch (err: any) {
      console.error('Error inviting team member:', err