import axios from 'axios';
import { 
  LoginResponse, User, UserRole, Category, Ticket, PaginatedResponse, 
  ApiTicketStatus, TicketStatus, ApiTicketPriority, TicketPriority,
  Agency, StatusUpdateRequest, TransferTicketRequest, AssignAgentRequest,
  RoutingRule
} from '@/types';

// Base URL for the API
const BASE_URL = 'https://api-complaints.ishimwe.rw'; // Replace with your actual base URL

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors such as 401 (unauthorized) globally
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect to login if token expired
      localStorage.removeItem('auth');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Map API role to app role
const mapRole = (apiRole: string): UserRole => {
  switch (apiRole) {
    case 'ADMIN':
      return 'admin';
    case 'CITIZEN':
      return 'citizen';
    case 'AGENCY_STAFF':
      return 'agency';
    default:
      return 'citizen';
  }
};

// Map API status to app status
export const mapStatus = (apiStatus: ApiTicketStatus): TicketStatus => {
  switch (apiStatus) {
    case 'NEW':
      return 'new';
    case 'ASSIGNED':
      return 'assigned';
    case 'IN_PROGRESS_PENDING_AGENT':
      return 'in_progress_pending_agent';
    case 'IN_PROGRESS_PENDING_CITIZEN':
      return 'in_progress_pending_citizen';
    case 'RESOLVED':
      return 'resolved';
    case 'CLOSED':
      return 'closed';
    case 'REOPENED':
      return 'reopened';
    default:
      return 'new';
  }
};

// Map app status to API status
export const mapStatusToApi = (status: TicketStatus): ApiTicketStatus => {
  switch (status) {
    case 'new':
      return 'NEW';
    case 'assigned':
      return 'ASSIGNED';
    case 'in_progress_pending_agent':
      return 'IN_PROGRESS_PENDING_AGENT';
    case 'in_progress_pending_citizen':
      return 'IN_PROGRESS_PENDING_CITIZEN';
    case 'resolved':
      return 'RESOLVED';
    case 'closed':
      return 'CLOSED';
    case 'reopened':
      return 'REOPENED';
    default:
      return 'NEW';
  }
};

// Map API priority to app priority
export const mapPriority = (apiPriority: ApiTicketPriority): TicketPriority => {
  switch (apiPriority) {
    case 'LOW':
      return 'low';
    case 'MEDIUM':
      return 'medium';
    case 'HIGH':
      return 'high';
    case 'URGENT':
      return 'urgent';
    default:
      return 'medium';
  }
};

// Map app priority to API priority
export const mapPriorityToApi = (priority: TicketPriority): ApiTicketPriority => {
  switch (priority) {
    case 'low':
      return 'LOW';
    case 'medium':
      return 'MEDIUM';
    case 'high':
      return 'HIGH';
    case 'urgent':
      return 'URGENT';
    default:
      return 'MEDIUM';
  }
};

// Map API user to app user
const mapUser = (apiUser: any): User => {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: mapRole(apiUser.role),
    agencyId: apiUser.agencyId || undefined,
    agency: apiUser.agency,
    createdAt: new Date(apiUser.createdAt),
    lastLoginAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : undefined,
    isActive: apiUser.status === 'ACTIVE',
  };
};

// Map API agency to app agency
const mapAgency = (apiAgency: any): Agency => {
  return {
    id: apiAgency.id,
    name: apiAgency.name,
    description: apiAgency.description || '',
    contactEmail: apiAgency.contactEmail,
    contactPhone: apiAgency.contactPhone,
    status: apiAgency.status,
    createdAt: new Date(apiAgency.createdAt),
    isActive: apiAgency.status === 'ACTIVE',
  };
};

// Auth API calls
export const authApi = {
  login: async (phone: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', { phone, password });
      
      if (response.data.status === 'success') {
        const apiUser = response.data.data.user;
        const token = response.data.data.tokens.accessToken;
        
        // Convert API response to app's expected format
        const appUser = mapUser(apiUser);
        
        return {
          user: appUser,
          token: token
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
};

// Category API calls
export const categoryApi = {
  getCategories: async (): Promise<PaginatedResponse<Category>> => {
    try {
      const response = await api.get('/categories');
      
      if (response.data.status === 'success') {
        return {
          data: response.data.data.map((apiCategory: any) => ({
            id: apiCategory.id,
            name: apiCategory.name,
            description: apiCategory.description || '',
            isActive: true,  // Assuming active by default since API doesn't specify
          })),
          meta: response.data.meta
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  createCategory: async (categoryData: {
    name: string;
    description: string;
  }): Promise<Category> => {
    try {
      const response = await api.post('/categories', categoryData);
      
      if (response.data.status === 'success') {
        return {
          id: response.data.data.id,
          name: response.data.data.name,
          description: response.data.data.description || '',
          isActive: true,
        };
      } else {
        throw new Error(response.data.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },
  
  updateCategory: async (
    categoryId: string,
    categoryData: {
      name: string;
      description: string;
    }
  ): Promise<Category> => {
    try {
      const response = await api.patch(`/categories/${categoryId}`, categoryData);
      
      if (response.data.status === 'success') {
        return {
          id: response.data.data.id,
          name: response.data.data.name,
          description: response.data.data.description || '',
          isActive: true,
        };
      } else {
        throw new Error(response.data.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }
};

// Routing Rules API calls
export const routingRuleApi = {
  getRoutingRules: async (): Promise<PaginatedResponse<RoutingRule>> => {
    try {
      const response = await api.get('/routing-rules');
      
      if (response.data.status === 'success') {
        return {
          data: response.data.data.map((rule: any) => ({
            id: rule.id,
            categoryId: rule.category?.id || '',
            agencyId: rule.assignedAgency?.id || '',
            description: rule.description || '',
            isActive: rule.status === 'ACTIVE',
            createdAt: new Date(rule.createdAt),
            updatedAt: new Date(rule.updatedAt),
          })),
          meta: response.data.meta
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch routing rules');
      }
    } catch (error) {
      console.error('Error fetching routing rules:', error);
      throw error;
    }
  },
  
  createRoutingRule: async (ruleData: {
    categoryId: string;
    assignedAgencyId: string;
    description?: string;
  }): Promise<RoutingRule> => {
    try {
      const response = await api.post('/routing-rules', ruleData);
      
      if (response.data.status === 'success') {
        const rule = response.data.data;
        return {
          id: rule.id,
          categoryId: rule.category?.id || ruleData.categoryId,
          agencyId: rule.assignedAgency?.id || ruleData.assignedAgencyId,
          description: rule.description || '',
          isActive: rule.status === 'ACTIVE',
          createdAt: new Date(rule.createdAt),
          updatedAt: new Date(rule.updatedAt),
        };
      } else {
        throw new Error(response.data.message || 'Failed to create routing rule');
      }
    } catch (error) {
      console.error('Error creating routing rule:', error);
      throw error;
    }
  },
  
  updateRoutingRule: async (
    ruleId: string,
    ruleData: {
      categoryId?: string;
      assignedAgencyId?: string;
      description?: string;
      status?: string;
    }
  ): Promise<RoutingRule> => {
    try {
      const response = await api.patch(`/routing-rules/${ruleId}`, ruleData);
      
      if (response.data.status === 'success') {
        const rule = response.data.data;
        return {
          id: rule.id,
          categoryId: rule.category?.id,
          agencyId: rule.assignedAgency?.id,
          description: rule.description || '',
          isActive: rule.status === 'ACTIVE',
          createdAt: new Date(rule.createdAt),
          updatedAt: new Date(rule.updatedAt),
        };
      } else {
        throw new Error(response.data.message || 'Failed to update routing rule');
      }
    } catch (error) {
      console.error('Error updating routing rule:', error);
      throw error;
    }
  }
};

// Map API ticket to app ticket
const mapTicket = (apiTicket: any): Ticket => {
  return {
    id: apiTicket.id,
    title: apiTicket.title,
    description: apiTicket.detailedDescription || '',
    detailedDescription: apiTicket.detailedDescription,
    categoryId: apiTicket.category?.id || apiTicket.categoryId,
    submitterId: apiTicket.citizen?.id || apiTicket.userId,
    status: mapStatus(apiTicket.status as ApiTicketStatus),
    priority: mapPriority(apiTicket.priority as ApiTicketPriority),
    location: apiTicket.location,
    createdAt: new Date(apiTicket.createdAt),
    updatedAt: new Date(apiTicket.updatedAt),
    assignedAgencyId: apiTicket.assignedAgency?.id,
    assignedAgentId: apiTicket.assignedAgentId,
    category: apiTicket.category,
    assignedAgency: apiTicket.assignedAgency,
    citizen: apiTicket.citizen,
    communications: apiTicket.communications,
  };
};

// Ticket API calls
export const ticketApi = {
  createTicket: async (ticketData: {
    title: string;
    location: string;
    detailedDescription: string;
    categoryId: string;
    priority: string;
  }): Promise<Ticket> => {
    try {
      const response = await api.post('/tickets', ticketData);
      
      if (response.data.status === 'success') {
        const apiTicket = response.data.data;
        return mapTicket(apiTicket);
      } else {
        throw new Error(response.data.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },
  
  getTicket: async (ticketId: string): Promise<Ticket> => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      
      if (response.data.status === 'success') {
        const apiTicket = response.data.data;
        return mapTicket(apiTicket);
      } else {
        throw new Error(response.data.message || 'Failed to fetch ticket');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },
  
  getUserTickets: async (): Promise<PaginatedResponse<Ticket>> => {
    try {
      const response = await api.get('/tickets');
      
      if (response.data.status === 'success') {
        return {
          data: response.data.data.map((apiTicket: any) => mapTicket(apiTicket)),
          meta: response.data.meta
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },
  
  getTicketWithCommunications: async (ticketId: string): Promise<any> => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      
      if (response.data.status === 'success') {
        return mapTicket(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch ticket details');
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  },
  // Corrected sendMessage function
sendMessage: async (ticketId: string, message: string, isInternal: boolean): Promise<any> => {  // ADD isInternal as parameter
  try {
    const response = await api.post(`/tickets/${ticketId}/communications`, {
      message,
      isInternal,  // USE the isInternal parameter
    });

    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to send message');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
},
  // sendMessage: async (ticketId: string, message: string): Promise<any> => {
  //   try {
  //     const response = await api.post(`/tickets/${ticketId}/communications`, {
  //       message,
  //       isInternal: false
  //     });
      
  //     if (response.data.status === 'success') {
  //       return response.data.data;
  //     } else {
  //       throw new Error(response.data.message || 'Failed to send message');
  //     }
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //     throw error;
  //   }
  // },
  
  // New agency-specific endpoints
  updateTicketStatus: async (ticketId: string, data: StatusUpdateRequest): Promise<Ticket> => {
    try {
      const response = await api.patch(`/tickets/${ticketId}/status-update`, data);
      
      if (response.data.status === 'success') {
        return mapTicket(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to update ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },
  
  transferTicket: async (ticketId: string, data: TransferTicketRequest): Promise<Ticket> => {
    try {
      const response = await api.post(`/tickets/${ticketId}/transfer`, data);
      
      if (response.data.status === 'success') {
        return mapTicket(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to transfer ticket');
      }
    } catch (error) {
      console.error('Error transferring ticket:', error);
      throw error;
    }
  },
  
  assignAgent: async (ticketId: string, data: AssignAgentRequest): Promise<Ticket> => {
    try {
      const response = await api.patch(`/tickets/${ticketId}/assign`, data);
      
      if (response.data.status === 'success') {
        return mapTicket(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to assign agent');
      }
    } catch (error) {
      console.error('Error assigning agent:', error);
      throw error;
    }
  }
};

// Agency API calls
export const agencyApi = {
  getAgencies: async (): Promise<PaginatedResponse<Agency>> => {
    try {
      const response = await api.get('/agencies');
      
      if (response.data.status === 'success') {
        return {
          data: response.data.data.map((apiAgency: any) => mapAgency(apiAgency)),
          meta: response.data.meta
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch agencies');
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
      throw error;
    }
  },
  
  createAgency: async (agencyData: { 
    name: string; 
    description: string; 
    contactEmail: string; 
    contactPhone?: string; 
  }): Promise<Agency> => {
    try {
      const response = await api.post('/agencies', agencyData);
      
      if (response.data.status === 'success') {
        return mapAgency(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to create agency');
      }
    } catch (error) {
      console.error('Error creating agency:', error);
      throw error;
    }
  },
  
  updateAgency: async (
    agencyId: string, 
    agencyData: { 
      name?: string; 
      description?: string; 
      contactEmail?: string; 
      contactPhone?: string;
      status?: string;
    }
  ): Promise<Agency> => {
    try {
      const response = await api.patch(`/agencies/${agencyId}`, agencyData);
      
      if (response.data.status === 'success') {
        return mapAgency(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to update agency');
      }
    } catch (error) {
      console.error('Error updating agency:', error);
      throw error;
    }
  }
};

// User API calls
export const userApi = {
  getUsers: async (): Promise<PaginatedResponse<User>> => {
    try {
      const response = await api.get('/users');
      
      if (response.data.status === 'success') {
        return {
          data: response.data.data.map((apiUser: any) => mapUser(apiUser)),
          meta: response.data.meta
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  createUser: async (userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
    agencyId?: string;
  }): Promise<User> => {
    try {
      const response = await api.post('/users', userData);
      
      if (response.data.status === 'success') {
        return mapUser(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  updateUser: async (
    userId: string,
    userData: {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      password?: string;
      agencyId?: string;
    }
  ): Promise<User> => {
    try {
      const response = await api.patch(`/users/${userId}`, userData);
      
      if (response.data.status === 'success') {
        return mapUser(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

export default api;
