import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Agency,
  Category,
  Ticket,
  Message,
  RoutingRule,
  TicketStatus,
  TicketPriority,
  UserRole,
  LoginResponse
} from '../types';

// Create mock citizens
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Citizen',
    email: 'john@example.com',
    role: 'citizen',
    createdAt: new Date('2023-01-15'),
    isActive: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'citizen',
    createdAt: new Date('2023-02-20'),
    isActive: true,
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@gov.org',
    role: 'admin',
    createdAt: new Date('2022-12-01'),
    isActive: true,
  },
  {
    id: '4',
    name: 'Transportation Agent',
    email: 'transport@gov.org',
    role: 'agency',
    agencyId: '1',
    createdAt: new Date('2022-12-15'),
    isActive: true,
  },
  {
    id: '5',
    name: 'Water Services Agent',
    email: 'water@gov.org',
    role: 'agency',
    agencyId: '2',
    createdAt: new Date('2022-12-10'),
    isActive: true,
  },
  {
    id: '6',
    name: 'Power Services Agent',
    email: 'power@gov.org',
    role: 'agency',
    agencyId: '3',
    createdAt: new Date('2023-01-05'),
    isActive: true,
  },
];

// Create mock agencies
export const mockAgencies: Agency[] = [
  {
    id: '1',
    name: 'City Transportation Department',
    description: 'Manages all transportation-related services and infrastructure in the city.',
    contactEmail: 'transport@gov.org',
    contactPhone: '555-1234',
    createdAt: new Date('2022-01-01'),
    isActive: true,
  },
  {
    id: '2',
    name: 'Water Services Authority',
    description: 'Manages water supply and sewage systems across the city.',
    contactEmail: 'water@gov.org',
    contactPhone: '555-2345',
    createdAt: new Date('2022-01-01'),
    isActive: true,
  },
  {
    id: '3',
    name: 'Power Distribution Corporation',
    description: 'Responsible for electricity distribution and related services.',
    contactEmail: 'power@gov.org',
    contactPhone: '555-3456',
    createdAt: new Date('2022-01-01'),
    isActive: true,
  },
];

// Create mock categories
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Roads and Transportation',
    description: 'Issues related to roads, transportation, and traffic',
    isActive: true,
  },
  {
    id: '11',
    name: 'Road Damage',
    description: 'Potholes, cracks, and other road surface issues',
    parentId: '1',
    isActive: true,
  },
  {
    id: '12',
    name: 'Traffic Signals',
    description: 'Issues with traffic lights and signals',
    parentId: '1',
    isActive: true,
  },
  {
    id: '13',
    name: 'Public Transportation',
    description: 'Issues with buses, trains, and other public transport',
    parentId: '1',
    isActive: true,
  },
  {
    id: '2',
    name: 'Water and Sewage',
    description: 'Issues related to water supply and sewage systems',
    isActive: true,
  },
  {
    id: '21',
    name: 'Water Supply',
    description: 'Issues with water supply, quality, or pressure',
    parentId: '2',
    isActive: true,
  },
  {
    id: '22',
    name: 'Sewage',
    description: 'Issues with sewage systems or drains',
    parentId: '2',
    isActive: true,
  },
  {
    id: '3',
    name: 'Electricity',
    description: 'Issues related to power supply',
    isActive: true,
  },
  {
    id: '31',
    name: 'Power Outage',
    description: 'Reports of power failures or intermittent supply',
    parentId: '3',
    isActive: true,
  },
  {
    id: '32',
    name: 'Street Lighting',
    description: 'Issues with street lights or public area lighting',
    parentId: '3',
    isActive: true,
  },
  {
    id: '4',
    name: 'Waste Management',
    description: 'Issues related to garbage collection and waste disposal',
    isActive: true,
  },
];

// Create mock routing rules
export const mockRoutingRules: RoutingRule[] = [
  {
    id: '1',
    categoryId: '1', // Roads and Transportation
    agencyId: '1', // City Transportation Department
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
  {
    id: '2',
    categoryId: '11', // Road Damage
    agencyId: '1', // City Transportation Department
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
  {
    id: '3',
    categoryId: '12', // Traffic Signals
    agencyId: '1', // City Transportation Department
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
  {
    id: '4',
    categoryId: '13', // Public Transportation
    agencyId: '1', // City Transportation Department
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
  {
    id: '5',
    categoryId: '2', // Water and Sewage
    agencyId: '2', // Water Services Authority
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
  {
    id: '6',
    categoryId: '21', // Water Supply
    agencyId: '2', // Water Services Authority
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
  {
    id: '7',
    categoryId: '22', // Sewage
    agencyId: '2', // Water Services Authority
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
  {
    id: '8',
    categoryId: '3', // Electricity
    agencyId: '3', // Power Distribution Corporation
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
  {
    id: '9',
    categoryId: '31', // Power Outage
    agencyId: '3', // Power Distribution Corporation
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
  {
    id: '10',
    categoryId: '32', // Street Lighting
    agencyId: '3', // Power Distribution Corporation
    isActive: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2022-01-10'),
  },
];

// Create mock tickets
export const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Large pothole on Main Street',
    description: 'There is a large pothole on Main Street near the intersection with Oak Road. It is causing damage to vehicles.',
    categoryId: '11', // Road Damage
    submitterId: '1', // John Citizen
    assignedAgencyId: '1', // City Transportation Department
    assignedAgentId: '4', // Transportation Agent
    status: 'in_progress_pending_agent',
    priority: 'high',
    location: '123 Main St, Anytown',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-12'),
  },
  {
    id: '2',
    title: 'Traffic light not working',
    description: 'The traffic light at the corner of Pine and Maple is not functioning. It is stuck on red in all directions.',
    categoryId: '12', // Traffic Signals
    submitterId: '2', // Jane Smith
    assignedAgencyId: '1', // City Transportation Department
    assignedAgentId: '4', // Transportation Agent
    status: 'assigned',
    priority: 'urgent',
    location: 'Pine and Maple St, Anytown',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
  },
  {
    id: '3',
    title: 'No water pressure',
    description: 'We have very low water pressure in our building since yesterday morning.',
    categoryId: '21', // Water Supply
    submitterId: '1', // John Citizen
    assignedAgencyId: '2', // Water Services Authority
    assignedAgentId: '5', // Water Services Agent
    status: 'resolved',
    priority: 'medium',
    location: '456 Oak Ave, Anytown',
    createdAt: new Date('2023-04-08'),
    updatedAt: new Date('2023-04-13'),
    closedAt: new Date('2023-04-13'),
  },
  {
    id: '4',
    title: 'Power outage in Cedar neighborhood',
    description: 'The entire Cedar Hill neighborhood has been without power for 3 hours.',
    categoryId: '31', // Power Outage
    submitterId: '2', // Jane Smith
    assignedAgencyId: '3', // Power Distribution Corporation
    assignedAgentId: '6', // Power Services Agent
    status: 'new',
    priority: 'urgent',
    location: 'Cedar Hill neighborhood, Anytown',
    createdAt: new Date('2023-04-17'),
    updatedAt: new Date('2023-04-17'),
  },
  {
    id: '5',
    title: 'Street light out',
    description: 'The street light outside 789 Elm Street has been out for over a week.',
    categoryId: '32', // Street Lighting
    submitterId: '1', // John Citizen
    assignedAgencyId: '3', // Power Distribution Corporation
    status: 'new',
    priority: 'low',
    location: '789 Elm St, Anytown',
    createdAt: new Date('2023-04-16'),
    updatedAt: new Date('2023-04-16'),
  },
];

// Create mock messages
export const mockMessages: Message[] = [
  {
    id: '1',
    ticketId: '1', // Large pothole on Main Street
    senderId: '1', // John Citizen
    content: 'I hit this pothole yesterday and it damaged my tire. Please fix it as soon as possible.',
    createdAt: new Date('2023-04-10T10:30:00'),
    isInternal: false,
  },
  {
    id: '2',
    ticketId: '1', // Large pothole on Main Street
    senderId: '4', // Transportation Agent
    content: 'Thank you for reporting this issue. We have scheduled a repair team to fix this pothole.',
    createdAt: new Date('2023-04-12T09:15:00'),
    isInternal: false,
  },
  {
    id: '3',
    ticketId: '1', // Large pothole on Main Street
    senderId: '4', // Transportation Agent
    content: 'Repair team will be on site tomorrow morning.',
    createdAt: new Date('2023-04-12T14:20:00'),
    isInternal: true, // Internal note not visible to citizen
  },
  {
    id: '4',
    ticketId: '2', // Traffic light not working
    senderId: '2', // Jane Smith
    content: 'This is causing significant traffic congestion and is dangerous. Please address immediately.',
    createdAt: new Date('2023-04-15T11:45:00'),
    isInternal: false,
  },
  {
    id: '5',
    ticketId: '3', // No water pressure
    senderId: '1', // John Citizen
    content: 'We cannot take showers or do laundry with such low water pressure.',
    createdAt: new Date('2023-04-08T08:30:00'),
    isInternal: false,
  },
  {
    id: '6',
    ticketId: '3', // No water pressure
    senderId: '5', // Water Services Agent
    content: 'We are aware of a main supply issue in your area. Crews are working to resolve it.',
    createdAt: new Date('2023-04-10T10:00:00'),
    isInternal: false,
  },
  {
    id: '7',
    ticketId: '3', // No water pressure
    senderId: '1', // John Citizen
    content: 'When do you expect the issue to be fixed?',
    createdAt: new Date('2023-04-10T14:20:00'),
    isInternal: false,
  },
  {
    id: '8',
    ticketId: '3', // No water pressure
    senderId: '5', // Water Services Agent
    content: 'We expect the repairs to be completed by tomorrow afternoon.',
    createdAt: new Date('2023-04-11T09:10:00'),
    isInternal: false,
  },
  {
    id: '9',
    ticketId: '3', // No water pressure
    senderId: '5', // Water Services Agent
    content: 'The issue has been resolved. Please let us know if you still experience problems.',
    createdAt: new Date('2023-04-13T16:00:00'),
    isInternal: false,
  },
  {
    id: '10',
    ticketId: '4', // Power outage in Cedar neighborhood
    senderId: '2', // Jane Smith
    content: 'This is affecting the entire neighborhood including elderly residents who need power for medical devices.',
    createdAt: new Date('2023-04-17T15:30:00'),
    isInternal: false,
  },
];

// UUID generator function
function generateId(): string {
  return uuidv4();
}

// Mock data service
export const mockDataService = {
  // Auth functions
  login: (phone: string, password: string): LoginResponse => {
    // Mock admin user
    if (phone === "0000000000" && password === "yourSuperStrongAdminPassword123!") {
      return {
        user: {
          id: "cmas7iljm00006a030upqqoay",
          name: "Default Admin",
          email: "admin@example.com",
          role: "admin",
          createdAt: new Date(),
          lastLoginAt: new Date(),
          isActive: true
        },
        token: "mock-admin-token"
      };
    }
    
    // Mock agency user
    else if (phone === "1111111111" && password === "password") {
      return {
        user: {
          id: "agency123",
          name: "Agency User",
          email: "agency@gov.org",
          role: "agency",
          agencyId: "agency1",
          createdAt: new Date(),
          lastLoginAt: new Date(),
          isActive: true
        },
        token: "mock-agency-token"
      };
    }
    
    // Mock citizen user
    else if (phone === "2222222222" && password === "password") {
      return {
        user: {
          id: "citizen123",
          name: "John Citizen",
          email: "john@example.com",
          role: "citizen",
          createdAt: new Date(),
          lastLoginAt: new Date(),
          isActive: true
        },
        token: "mock-citizen-token"
      };
    }
    
    // Legacy email-based login (for compatibility)
    else if (phone.includes('@')) {
      if (phone === "admin@gov.org" && password === "password") {
        return {
          user: {
            id: "admin123",
            name: "Admin User",
            email: "admin@gov.org",
            role: "admin",
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isActive: true
          },
          token: "mock-admin-token"
        };
      } else if (phone === "transport@gov.org" && password === "password") {
        return {
          user: {
            id: "agency123",
            name: "Transport Agency",
            email: "transport@gov.org",
            role: "agency",
            agencyId: "agency1",
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isActive: true
          },
          token: "mock-agency-token"
        };
      } else if (phone === "john@example.com" && password === "password") {
        return {
          user: {
            id: "citizen123",
            name: "John Doe",
            email: "john@example.com",
            role: "citizen",
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isActive: true
          },
          token: "mock-citizen-token"
        };
      }
    }
    
    throw new Error("Invalid credentials");
  },
  
  // User functions
  getUsers: () => [...mockUsers],
  getUserById: (id: string) => mockUsers.find(u => u.id === id),
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser = {
      ...userData,
      id: generateId(),
      createdAt: new Date(),
    };
    mockUsers.push(newUser);
    return newUser;
  },
  updateUser: (id: string, userData: Partial<User>) => {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...userData };
      return mockUsers[index];
    }
    return null;
  },
  
  // Agency functions
  getAgencies: () => [...mockAgencies],
  getAgencyById: (id: string) => mockAgencies.find(a => a.id === id),
  createAgency: (agencyData: Omit<Agency, 'id' | 'createdAt'>) => {
    const newAgency = {
      ...agencyData,
      id: generateId(),
      createdAt: new Date(),
    };
    mockAgencies.push(newAgency);
    return newAgency;
  },
  updateAgency: (id: string, agencyData: Partial<Agency>) => {
    const index = mockAgencies.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAgencies[index] = { ...mockAgencies[index], ...agencyData };
      return mockAgencies[index];
    }
    return null;
  },
  
  // Category functions
  getCategories: () => [...mockCategories],
  getCategoryById: (id: string) => mockCategories.find(c => c.id === id),
  createCategory: (categoryData: Omit<Category, 'id'>) => {
    const newCategory = {
      ...categoryData,
      id: generateId(),
    };
    mockCategories.push(newCategory);
    return newCategory;
  },
  updateCategory: (id: string, categoryData: Partial<Category>) => {
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories[index] = { ...mockCategories[index], ...categoryData };
      return mockCategories[index];
    }
    return null;
  },
  
  // Routing rule functions
  getRoutingRules: () => [...mockRoutingRules],
  getRoutingRuleById: (id: string) => mockRoutingRules.find(r => r.id === id),
  getRoutingRuleByCategory: (categoryId: string) => mockRoutingRules.find(r => r.categoryId === categoryId && r.isActive),
  createRoutingRule: (ruleData: Omit<RoutingRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule = {
      ...ruleData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockRoutingRules.push(newRule);
    return newRule;
  },
  updateRoutingRule: (id: string, ruleData: Partial<RoutingRule>) => {
    const index = mockRoutingRules.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRoutingRules[index] = { 
        ...mockRoutingRules[index], 
        ...ruleData, 
        updatedAt: new Date() 
      };
      return mockRoutingRules[index];
    }
    return null;
  },
  
  // Ticket functions
  getTickets: () => [...mockTickets],
  getTicketById: (id: string) => mockTickets.find(t => t.id === id),
  getTicketsBySubmitter: (submitterId: string) => mockTickets.filter(t => t.submitterId === submitterId),
  getTicketsByAgency: (agencyId: string) => mockTickets.filter(t => t.assignedAgencyId === agencyId),
  getTicketsByStatus: (status: TicketStatus) => mockTickets.filter(t => t.status === status),
  createTicket: (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Find routing rule for the category
    const rule = mockRoutingRules.find(
      r => r.categoryId === ticketData.categoryId && r.isActive
    );
    
    const newTicket = {
      ...ticketData,
      id: generateId(),
      assignedAgencyId: rule?.agencyId || undefined,
      status: ticketData.status || 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockTickets.push(newTicket);
    return newTicket;
  },
  updateTicket: (id: string, ticketData: Partial<Ticket>) => {
    const index = mockTickets.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTickets[index] = { 
        ...mockTickets[index], 
        ...ticketData, 
        updatedAt: new Date() 
      };
      return mockTickets[index];
    }
    return null;
  },
  
  // Message functions
  getMessagesByTicket: (ticketId: string) => mockMessages.filter(m => m.ticketId === ticketId),
  createMessage: (messageData: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage = {
      ...messageData,
      id: generateId(),
      createdAt: new Date(),
    };
    mockMessages.push(newMessage);
    
    // Update ticket updated time
    const ticketIndex = mockTickets.findIndex(t => t.id === messageData.ticketId);
    if (ticketIndex !== -1) {
      mockTickets[ticketIndex].updatedAt = new Date();
    }
    
    return newMessage;
  },
  
  // Dashboard statistics
  getDashboardStats: () => {
    const stats = {
      totalTickets: mockTickets.length,
      openTickets: mockTickets.filter(t => ['new', 'assigned', 'in_progress_pending_agent', 'in_progress_pending_citizen', 'reopened'].includes(t.status)).length,
      closedTickets: mockTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
      averageResolutionTime: 48, // Mocked value in hours
      
      // Tickets by category
      ticketsByCategory: mockCategories
        .filter(c => !c.parentId) // Get only parent categories
        .map(c => ({
          categoryName: c.name,
          count: mockTickets.filter(t => {
            const ticket_category = mockCategories.find(cat => cat.id === t.categoryId);
            return ticket_category && (ticket_category.id === c.id || ticket_category.parentId === c.id);
          }).length
        }))
        .filter(c => c.count > 0),
      
      // Tickets by status
      ticketsByStatus: [
        { status: 'new', count: mockTickets.filter(t => t.status === 'new').length },
        { status: 'assigned', count: mockTickets.filter(t => t.status === 'assigned').length },
        { status: 'in_progress_pending_agent', count: mockTickets.filter(t => t.status === 'in_progress_pending_agent').length },
        { status: 'in_progress_pending_citizen', count: mockTickets.filter(t => t.status === 'in_progress_pending_citizen').length },
        { status: 'resolved', count: mockTickets.filter(t => t.status === 'resolved').length },
        { status: 'closed', count: mockTickets.filter(t => t.status === 'closed').length },
        { status: 'reopened', count: mockTickets.filter(t => t.status === 'reopened').length },
      ],
      
      // Tickets by priority
      ticketsByPriority: [
        { priority: 'low', count: mockTickets.filter(t => t.priority === 'low').length },
        { priority: 'medium', count: mockTickets.filter(t => t.priority === 'medium').length },
        { priority: 'high', count: mockTickets.filter(t => t.priority === 'high').length },
        { priority: 'urgent', count: mockTickets.filter(t => t.priority === 'urgent').length },
      ],
      
      // Ticket trend (last 7 days)
      ticketTrend: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        return {
          date: dateString,
          count: Math.floor(Math.random() * 5) + 1, // Random count between 1-5 for demo
        };
      }).reverse(),
    };
    
    return stats;
  },
};

// Helper to generate status text for display
export const getStatusText = (status: TicketStatus): string => {
  const statusMap: Record<TicketStatus, string> = {
    new: 'New',
    assigned: 'Assigned',
    in_progress_pending_agent: 'In Progress (Agent)',
    in_progress_pending_citizen: 'In Progress (Citizen)',
    resolved: 'Resolved',
    closed: 'Closed',
    reopened: 'Reopened'
  };
  
  return statusMap[status] || status;
};

// Helper to generate priority text for display
export const getPriorityText = (priority: TicketPriority): string => {
  const priorityMap: Record<TicketPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };
  
  return priorityMap[priority] || priority;
};

// Helper to get user name by ID
export const getUserNameById = (userId: string): string => {
  const user = mockUsers.find(u => u.id === userId);
  return user ? user.name : 'Unknown User';
};

// Helper to get agency name by ID
export const getAgencyNameById = (agencyId: string): string => {
  const agency = mockAgencies.find(a => a.id === agencyId);
  return agency ? agency.name : 'Unassigned';
};

// Helper to get category name by ID
export const getCategoryNameById = (categoryId: string): string => {
  const category = mockCategories.find(c => c.id === categoryId);
  return category ? category.name : 'Uncategorized';
};

// Helper to get full category path
export const getCategoryPath = (categoryId: string): string => {
  const category = mockCategories.find(c => c.id === categoryId);
  if (!category) return 'Unknown Category';
  
  if (category.parentId) {
    const parentCategory = mockCategories.find(c => c.id === category.parentId);
    if (parentCategory) {
      return `${parentCategory.name} > ${category.name}`;
    }
  }
  
  return category.name;
};

// Helper to get formatted date
export const getFormattedDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper to get time elapsed since a date
export const getTimeElapsed = (date: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
};
