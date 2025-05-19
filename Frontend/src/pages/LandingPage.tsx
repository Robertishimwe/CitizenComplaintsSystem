
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle, MapPin, Phone, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  
  // Form state for complaint submission
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("");
  
  // Categories state - fetch from API
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axios.get('https://api-complaints.ishimwe.rw/categories');
        if (response.data.status === "success") {
          setCategories(response.data.data);
        } else {
          console.error("Failed to fetch categories:", response.data);
          toast.error("Failed to load categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error loading categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !location || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare request payload
      const payload: any = {
        title,
        location,
        detailedDescription: description,
        priority,
        anonymousCreatorName: "xxx",
        anonymousCreatorContact: "xxx"
      };
      
      // Only add categoryId if a category other than "Other" was selected
      if (category && category !== "other") {
        payload.categoryId = category;
      }
      
      // Make the API call to submit anonymous complaint
      const response = await axios.post('https://api-complaints.ishimwe.rw/tickets', payload);
      
      if (response.data.status === "success") {
        toast.success("Complaint submitted successfully!");
        
        // Show the ticket ID to the user
        if (response.data?.data?.id) {
          toast.info(
            <div className="space-y-2">
              <p>Your ticket ID is:</p>
              <p className="font-bold text-lg">{response.data.data.id}</p>
              <p className="text-sm">Keep this ID to check your complaint status.</p>
            </div>
          );
        }
        
        // Reset form and close dialog
        setTitle("");
        setLocation("");
        setDescription("");
        setPriority("MEDIUM");
        setCategory("");
        setIsSubmitDialogOpen(false);
      } else {
        toast.error("Failed to submit complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!ticketId) {
      toast.error("Please enter a ticket ID");
      return;
    }
    
    setIsChecking(true);
    
    try {
      // Make the API call to check ticket status
      const response = await axios.get(`https://api-complaints.ishimwe.rw/tickets/${ticketId}`);
      
      if (response.data.status === "success") {
        setTicketDetails(response.data.data);
        setIsStatusDialogOpen(true);
      } else {
        toast.error("Failed to retrieve ticket information");
      }
    } catch (error) {
      console.error("Error checking ticket status:", error);
      toast.error("Ticket not found or an error occurred");
    } finally {
      setIsChecking(false);
    }
  };

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const features = [
    {
      title: "Easy Submission",
      description: "Submit complaints easily through our streamlined process",
      icon: <Mail className="h-6 w-6 text-primary" />,
    },
    {
      title: "Real-time Tracking",
      description: "Check the status of your complaint at any time",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
    },
    {
      title: "Direct Communication",
      description: "Get updates and communicate directly with government agencies",
      icon: <Phone className="h-6 w-6 text-primary" />,
    },
    {
      title: "Location Based",
      description: "Report issues specific to your location for faster resolution",
      icon: <MapPin className="h-6 w-6 text-primary" />,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section - Made full height and vertically centered */}
      <div className="bg-rwanda-green-500 text-white min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Citizen Engagement System
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8">
                A direct channel between citizens and government agencies to address community issues effectively.
              </p>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <Button 
                  size="lg" 
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
                  asChild
                >
                  <Link to="/login">
                    Submit a Complaint <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-rwanda-green-500 font-semibold"
                  asChild
                >
                  <Link to="/login">
                    Check Complaint Status 
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/lovable-uploads/b9cb15e5-5c0f-4646-8ab2-b35b16a23795.png" 
                alt="Rwanda Government Seal" 
                className="max-h-72 md:max-h-96" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            How the System Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md"
              >
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick access section - Updated with anonymous functionality */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Quick Access
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-lg p-8 border border-green-100">
              <h3 className="text-2xl font-bold mb-4 text-green-900">Submit a New Complaint</h3>
              <p className="mb-6 text-gray-700">
                Have an issue in your community that needs attention from government agencies? Submit a new complaint to get started.
              </p>
              <Button 
                className="w-full md:w-auto bg-green-800 hover:bg-green-900"
                size="lg"
                onClick={() => setIsSubmitDialogOpen(true)}
              >
                Submit Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="bg-blue-50 rounded-lg p-8 border border-blue-100">
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Track Your Complaint</h3>
              <p className="mb-4 text-gray-700">
                Already submitted a complaint? Enter your ticket ID to check its current status.
              </p>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Enter your ticket ID"
                    className="flex-1"
                  />
                  <Button 
                    className="bg-blue-800 hover:bg-blue-900"
                    onClick={handleCheckStatus}
                    disabled={isChecking}
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking
                      </>
                    ) : (
                      'Check'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Stay Updated</h2>
              <p className="text-gray-300">
                Receive updates about government services and community initiatives
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-l-md rounded-r-none bg-white/10 border-white/20 text-white"
                />
                <Button className="rounded-l-none bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/b9cb15e5-5c0f-4646-8ab2-b35b16a23795.png" 
                  alt="Rwanda Government Seal" 
                  className="h-12 mr-3" 
                />
                <div>
                  <h3 className="text-xl font-semibold">Citizen Engagement System</h3>
                  <p className="text-gray-400">Republic of Rwanda</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2">
                  <li><Link to="/login" className="text-gray-400 hover:text-white">Submit Complaint</Link></li>
                  <li><Link to="/login" className="text-gray-400 hover:text-white">Check Status</Link></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Contact</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-400"><Phone className="h-4 w-4 mr-2" /> +250 XXX XXX XXX</li>
                  <li className="flex items-center text-gray-400"><Mail className="h-4 w-4 mr-2" /> info@gov.rw</li>
                  <li className="flex items-center text-gray-400"><MapPin className="h-4 w-4 mr-2" /> Kigali, Rwanda</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6">
            <p className="text-center text-gray-500">
              &copy; {new Date().getFullYear()} Republic of Rwanda. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Anonymous Complaint Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Anonymous Complaint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitComplaint} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Complaint Title <span className="text-red-500">*</span></label>
              <Input
                id="title"
                placeholder="Brief title of your complaint"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location <span className="text-red-500">*</span></label>
              <Input
                id="location"
                placeholder="Location of the issue"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading categories...</span>
                    </div>
                  ) : (
                    <>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                      <SelectItem key="other" value="other">
                        Other
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Detailed Description <span className="text-red-500">*</span></label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your complaint"
                className="min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsSubmitDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complaint Status</DialogTitle>
          </DialogHeader>
          
          {ticketDetails && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-bold text-lg">{ticketDetails.title}</h3>
                <p className="text-gray-500 text-sm">ID: {ticketDetails.id}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{formatStatus(ticketDetails.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <p className="font-medium">{ticketDetails.priority.charAt(0) + ticketDetails.priority.slice(1).toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{ticketDetails.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted On</p>
                  <p className="font-medium">{formatDate(ticketDetails.createdAt)}</p>
                </div>
              </div>
              
              {ticketDetails.assignedAgency && (
                <div>
                  <p className="text-sm text-gray-500">Assigned Agency</p>
                  <p className="font-medium">{ticketDetails.assignedAgency.name}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="bg-gray-50 p-3 rounded-md mt-1">{ticketDetails.detailedDescription}</p>
              </div>
              
              {ticketDetails.communications && ticketDetails.communications.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Communications</p>
                  <div className="space-y-3">
                    {ticketDetails.communications.map((comm: any) => (
                      <div key={comm.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{comm.sender.name}</p>
                          <p className="text-xs text-gray-500">{new Date(comm.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="mt-1">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button onClick={() => setIsStatusDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
