import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Car, 
  FileText, 
  Calculator, 
  CheckSquare, 
  Calendar, 
  Package, 
  Settings,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  Home,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  Camera,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  Filter,
  BarChart3,
  TrendingUp,
  Star,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { ProductsContent } from "@/components/ProductsContent";
import Logo from "@/components/Logo";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import WebsiteContent from '../website';
import { getSession, signOut } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';

// Types
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  vehicleId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: Date;
  dueDate: Date;
  notes: string;
  serviceCheckId?: string;
}

interface Estimate {
  id: string;
  estimateNumber: string;
  customerId: string;
  vehicleId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'declined' | 'expired';
  createdAt: Date;
  validUntil: Date;
  notes: string;
  convertedToInvoice?: boolean;
  invoiceId?: string;
}

interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  date: Date;
  time: string;
  service: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
}

interface ServiceCheckItem {
  id: string;
  name: string;
  status: 'good' | 'needs-attention' | 'replace';
  notes: string;
  photos: string[];
}

interface ServiceCheck {
  id: string;
  customerId: string;
  vehicleId: string;
  items: ServiceCheckItem[];
  createdAt: Date;
  technician: string;
}

interface MotTest {
  completedDate: string;
  testResult: string;
  expiryDate?: string;
  odometerValue: string;
  odometerUnit: string;
  motTestNumber: string;
  rfrAndComments: {
    text: string;
    type: 'ADVISORY' | 'MINOR' | 'MAJOR' | 'DANGEROUS' | 'FAIL' | 'PRS';
  }[];
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Ave, City, State 12345',
    createdAt: new Date('2024-02-20')
  }
];

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    customerId: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '1HGBH41JXMN109186',
    licensePlate: 'ABC123',
    color: 'Silver'
  },
  {
    id: '2',
    customerId: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    vin: '2HGFC2F59KH542891',
    licensePlate: 'XYZ789',
    color: 'Blue'
  }
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Oil Change Service',
    description: 'Full synthetic oil change with filter',
    price: 49.99,
    category: 'Service',
    stock: 100
  },
  {
    id: '2',
    name: 'Brake Pads',
    description: 'Premium ceramic brake pads',
    price: 89.99,
    category: 'Parts',
    stock: 25
  },
  {
    id: '3',
    name: 'Air Filter',
    description: 'Engine air filter replacement',
    price: 24.99,
    category: 'Parts',
    stock: 50
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    customerId: '1',
    vehicleId: '1',
    date: new Date('2024-06-26'),
    time: '10:00 AM',
    service: 'Oil Change',
    status: 'scheduled',
    notes: 'Customer requested synthetic oil'
  },
  {
    id: '2',
    customerId: '2',
    vehicleId: '2',
    date: new Date('2024-06-27'),
    time: '2:00 PM',
    service: 'Brake Inspection',
    status: 'scheduled',
    notes: 'Customer reports squeaking noise'
  }
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-202407-0001',
    customerId: '1',
    vehicleId: '1',
    items: [
      {
        id: 'item-1',
        productId: '1',
        name: 'Oil Change Service',
        description: 'Full synthetic oil change with filter',
        quantity: 1,
        price: 49.99,
        total: 49.99
      },
      {
        id: 'item-2',
        productId: '3',
        name: 'Air Filter',
        description: 'Engine air filter replacement',
        quantity: 1,
        price: 24.99,
        total: 24.99
      }
    ],
    subtotal: 74.98,
    tax: 6.37,
    taxRate: 8.5,
    total: 81.35,
    status: 'paid',
    createdAt: new Date('2024-06-20'),
    dueDate: new Date('2024-07-20'),
    notes: 'Thank you for your business!'
  },
  {
    id: '2',
    invoiceNumber: 'INV-202407-0002',
    customerId: '2',
    vehicleId: '2',
    items: [
      {
        id: 'item-3',
        productId: '2',
        name: 'Brake Pads',
        description: 'Premium ceramic brake pads',
        quantity: 1,
        price: 89.99,
        total: 89.99
      }
    ],
    subtotal: 89.99,
    tax: 7.65,
    taxRate: 8.5,
    total: 97.64,
    status: 'sent',
    createdAt: new Date('2024-06-22'),
    dueDate: new Date('2024-07-22'),
    notes: 'Brake pads replacement completed. Please schedule follow-up inspection in 6 months.'
  },
  {
    id: '3',
    invoiceNumber: 'INV-202407-0003',
    customerId: '1',
    vehicleId: '1',
    items: [
      {
        id: 'item-4',
        productId: '1',
        name: 'Oil Change Service',
        description: 'Full synthetic oil change with filter',
        quantity: 1,
        price: 49.99,
        total: 49.99
      },
      {
        id: 'item-5',
        productId: '2',
        name: 'Brake Pads',
        description: 'Premium ceramic brake pads',
        quantity: 2,
        price: 89.99,
        total: 179.98
      }
    ],
    subtotal: 229.97,
    tax: 19.55,
    taxRate: 8.5,
    total: 249.52,
    status: 'overdue',
    createdAt: new Date('2024-06-15'),
    dueDate: new Date('2024-07-15'),
    notes: 'Complete brake service package with oil change.'
  }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentInvoice, setCurrentInvoice] = useState<Partial<Invoice> | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
  const [isAddInvoiceDialogOpen, setIsAddInvoiceDialogOpen] = useState(false);
  const [isAddServiceCheckDialogOpen, setIsAddServiceCheckDialogOpen] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    host: 'smtp.example.com',
    port: 587,
    user: 'your_email@example.com',
    pass: 'your_email_password',
    secure: false,
    from: 'your_business@example.com'
  });
  const [smsSettings, setSmsSettings] = useState({
    accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    authToken: 'your_twilio_auth_token',
    phoneNumber: '+15017122661'
  });
  const [googleCalendarSettings, setGoogleCalendarSettings] = useState({
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET'
  });
  const [motApiSettings, setMotApiSettings] = useState({
    apiKey: "",
    clientId: "",
    clientSecret: "",
    scopeUrl: "",
    tokenUrl: "",
  });
  const [isSavingMotApiKey, setIsSavingMotApiKey] = useState(false);

  const handleSaveMotApiKey = async () => {
    setIsSavingMotApiKey(true);
    try {
      const response = await fetch('/api/settings/mot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(motApiSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save MOT API settings');
      }

      alert('MOT API Settings saved successfully!');
      setMotApiSettings({ apiKey: '', clientId: '', clientSecret: '', scopeUrl: '', tokenUrl: '' }); // Clear the inputs for security
    } catch (error) {
      console.error('Error saving MOT API settings:', error);
      alert('Error saving MOT API settings. Please try again.');
    } finally {
      setIsSavingMotApiKey(false);
    }
  };

  // Invoice management states
  const [isInvoiceViewDialogOpen, setIsInvoiceViewDialogOpen] = useState(false);
  const [isInvoiceEditDialogOpen, setIsInvoiceEditDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'sent' | 'draft' | 'overdue'>('all');

  // Estimate management states
  const [isEstimateViewDialogOpen, setIsEstimateViewDialogOpen] = useState(false);
  const [isEstimateEditDialogOpen, setIsEstimateEditDialogOpen] = useState(false);
  const [viewingEstimate, setViewingEstimate] = useState<Estimate | null>(null);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [estimateSearchTerm, setEstimateSearchTerm] = useState('');
  const [estimateFilter, setEstimateFilter] = useState<'all' | 'draft' | 'sent' | 'approved' | 'declined' | 'expired'>('all');

  // Vehicle management states
  const [isVehicleViewDialogOpen, setIsVehicleViewDialogOpen] = useState(false);
  const [isVehicleEditDialogOpen, setIsVehicleEditDialogOpen] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Appointment management states
  const [isAppointmentViewDialogOpen, setIsAppointmentViewDialogOpen] = useState(false);
  const [isAppointmentEditDialogOpen, setIsAppointmentEditDialogOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'today' | 'past'>('all');

  // Invoice management functions
  const handleEditInvoice = () => {
    if (!editingInvoice || !editingInvoice.customerId || !editingInvoice.vehicleId || editingInvoice.items.length === 0) {
      alert('Please fill in all required fields and add at least one item.');
      return;
    }

    // Recalculate totals
    const totals = calculateInvoiceTotals(editingInvoice.items, editingInvoice.taxRate);
    const updatedInvoice = {
      ...editingInvoice,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total
    };

    setInvoices(prev => prev.map(invoice => 
      invoice.id === editingInvoice.id ? updatedInvoice : invoice
    ));
    setEditingInvoice(null);
    setIsInvoiceEditDialogOpen(false);
    alert('Invoice updated successfully!');
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      alert('Invoice deleted successfully!');
    }
  };

  const getInvoiceStats = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return null;

    const customer = customers.find(c => c.id === invoice.customerId);
    const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
    const relatedAppointments = appointments.filter(a => 
      a.customerId === invoice.customerId && a.vehicleId === invoice.vehicleId
    );

    return {
      customer,
      vehicle,
      relatedAppointments: relatedAppointments.length,
      isOverdue: invoice.status === 'overdue' || (invoice.status !== 'paid' && invoice.dueDate < new Date()),
      daysSinceCreated: Math.floor((new Date().getTime() - invoice.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  // Vehicle management functions
  const handleEditVehicle = () => {
    if (!editingVehicle || !editingVehicle.make || !editingVehicle.model || !editingVehicle.year) {
      alert('Please fill in all required fields.');
      return;
    }

    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === editingVehicle.id ? editingVehicle : vehicle
    ));
    setEditingVehicle(null);
    setIsVehicleEditDialogOpen(false);
    alert('Vehicle updated successfully!');
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      // Check if vehicle has associated appointments or invoices
      const hasAppointments = appointments.some(a => a.vehicleId === vehicleId);
      const hasInvoices = invoices.some(i => i.vehicleId === vehicleId);

      if (hasAppointments || hasInvoices) {
        alert('Cannot delete vehicle with existing appointments or invoices. Please remove associated records first.');
        return;
      }

      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
      alert('Vehicle deleted successfully!');
    }
  };

  const getVehicleStats = (vehicleId: string) => {
    const vehicleAppointments = appointments.filter(a => a.vehicleId === vehicleId);
    const vehicleInvoices = invoices.filter(i => i.vehicleId === vehicleId);
    const totalSpent = vehicleInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);

    return {
      appointmentCount: vehicleAppointments.length,
      invoiceCount: vehicleInvoices.length,
      totalSpent,
      lastService: vehicleAppointments.length > 0 
        ? new Date(Math.max(...vehicleAppointments.map(a => a.date.getTime())))
        : null
    };
  };

  // Appointment management functions
  const handleEditAppointment = () => {
    if (!editingAppointment || !editingAppointment.customerId || !editingAppointment.vehicleId || !editingAppointment.service) {
      alert('Please fill in all required fields.');
      return;
    }

    setAppointments(prev => prev.map(appointment => 
      appointment.id === editingAppointment.id ? editingAppointment : appointment
    ));
    setEditingAppointment(null);
    setIsAppointmentEditDialogOpen(false);
    alert('Appointment updated successfully!');
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
      alert('Appointment deleted successfully!');
    }
  };

  const getAppointmentStats = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return null;

    const customer = customers.find(c => c.id === appointment.customerId);
    const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
    const relatedInvoices = invoices.filter(i => i.customerId === appointment.customerId && i.vehicleId === appointment.vehicleId);

    return {
      customer,
      vehicle,
      relatedInvoices: relatedInvoices.length,
      isUpcoming: appointment.date >= new Date(),
      daysSinceCreated: Math.floor((new Date().getTime() - appointment.date.getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  // Google Calendar integration
  const {
    isConnected: isCalendarConnected,
    isLoading: isCalendarLoading,
    error: calendarError,
    connectToGoogle,
    createCalendarEvent,
    disconnect: disconnectCalendar,
    checkConnectionStatus
  } = useGoogleCalendar();

  // Check for calendar connection status on URL params (after OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('calendar_connected') === 'true') {
      checkConnectionStatus();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (urlParams.get('calendar_error')) {
      console.error('Calendar connection error:', urlParams.get('calendar_error'));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkConnectionStatus]);

  // Function to handle appointment creation with calendar sync
  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      // Create appointment locally (in a real app, this would be an API call)
      const newAppointment: Appointment = {
        id: (appointments.length + 1).toString(),
        customerId: appointmentData.customerId,
        vehicleId: appointmentData.vehicleId,
        date: appointmentData.date,
        time: appointmentData.time,
        service: appointmentData.service,
        status: 'scheduled',
        notes: appointmentData.notes || ''
      };

      setAppointments(prev => [...prev, newAppointment]);

      // If calendar is connected, create calendar event
      if (isCalendarConnected) {
        const customer = customers.find(c => c.id === appointmentData.customerId);
        const vehicle = vehicles.find(v => v.id === appointmentData.vehicleId);
        
        if (customer && vehicle) {
          const startDateTime = new Date(appointmentData.date);
          const [hours, minutes] = appointmentData.time.split(':');
          startDateTime.setHours(parseInt(hours), parseInt(minutes));
          
          const endDateTime = new Date(startDateTime);
          endDateTime.setHours(startDateTime.getHours() + 1); // 1 hour appointment

          await createCalendarEvent({
            summary: `${appointmentData.service} - ${customer.name}`,
            description: `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}\nCustomer: ${customer.name}\nPhone: ${customer.phone}\nNotes: ${appointmentData.notes || 'None'}`,
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            customerEmail: customer.email
          });
        }
      }

      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  // Invoice management functions
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const invoiceCount = invoices.length + 1;
    return `INV-${year}${month}-${String(invoiceCount).padStart(4, '0')}`;
  };

  // Estimate management functions
  const generateEstimateNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const estimateCount = estimates.length + 1;
    return `EST-${year}${month}-${String(estimateCount).padStart(4, '0')}`;
  };

  const createEstimate = (estimateData: Partial<Estimate>) => {
    const newEstimate: Estimate = {
      id: (estimates.length + 1).toString(),
      estimateNumber: generateEstimateNumber(),
      customerId: estimateData.customerId || '',
      vehicleId: estimateData.vehicleId || '',
      items: estimateData.items || [],
      subtotal: 0,
      tax: 0,
      taxRate: 8.5,
      total: 0,
      status: 'draft',
      createdAt: new Date(),
      validUntil: estimateData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: estimateData.notes || '',
      convertedToInvoice: false
    };

    // Calculate totals
    const totals = calculateInvoiceTotals(newEstimate.items, newEstimate.taxRate);
    newEstimate.subtotal = totals.subtotal;
    newEstimate.tax = totals.tax;
    newEstimate.total = totals.total;

    setEstimates(prev => [...prev, newEstimate]);
    return newEstimate;
  };

  const updateEstimateStatus = (estimateId: string, status: Estimate['status']) => {
    setEstimates(prev => prev.map(estimate => 
      estimate.id === estimateId ? { ...estimate, status } : estimate
    ));
  };

  const convertEstimateToInvoice = (estimate: Estimate) => {
    const newInvoice = createInvoice({
      customerId: estimate.customerId,
      vehicleId: estimate.vehicleId,
      items: estimate.items,
      notes: `Converted from estimate ${estimate.estimateNumber}. ${estimate.notes}`,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Mark estimate as converted
    setEstimates(prev => prev.map(est => 
      est.id === estimate.id 
        ? { ...est, convertedToInvoice: true, invoiceId: newInvoice.id, status: 'approved' }
        : est
    ));

    return newInvoice;
  };

  const sendEstimateEmail = async (estimate: Estimate) => {
    try {
      const customer = customers.find(c => c.id === estimate.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // In a real implementation, this would call an email API
      console.log(`Sending estimate ${estimate.estimateNumber} to ${customer.email}`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update estimate status to sent
      updateEstimateStatus(estimate.id, 'sent');
      
      return true;
    } catch (error) {
      console.error('Error sending estimate email:', error);
      throw error;
    }
  };

  const handleEditEstimate = () => {
    if (!editingEstimate || !editingEstimate.customerId || !editingEstimate.vehicleId || editingEstimate.items.length === 0) {
      alert('Please fill in all required fields and add at least one item.');
      return;
    }

    // Recalculate totals
    const totals = calculateInvoiceTotals(editingEstimate.items, editingEstimate.taxRate);
    const updatedEstimate = {
      ...editingEstimate,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total
    };

    setEstimates(prev => prev.map(estimate => 
      estimate.id === editingEstimate.id ? updatedEstimate : estimate
    ));
    setEditingEstimate(null);
    setIsEstimateEditDialogOpen(false);
    alert('Estimate updated successfully!');
  };

  const handleDeleteEstimate = (estimateId: string) => {
    if (confirm('Are you sure you want to delete this estimate? This action cannot be undone.')) {
      setEstimates(prev => prev.filter(estimate => estimate.id !== estimateId));
      alert('Estimate deleted successfully!');
    }
  };

  const getEstimateStats = (estimateId: string) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (!estimate) return null;

    const customer = customers.find(c => c.id === estimate.customerId);
    const vehicle = vehicles.find(v => v.id === estimate.vehicleId);
    const relatedAppointments = appointments.filter(a => 
      a.customerId === estimate.customerId && a.vehicleId === estimate.vehicleId
    );

    return {
      customer,
      vehicle,
      relatedAppointments: relatedAppointments.length,
      isExpired: estimate.status !== 'approved' && estimate.validUntil < new Date(),
      daysSinceCreated: Math.floor((new Date().getTime() - estimate.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  const generateEstimatePDF = async (estimate: Estimate) => {
    // This would integrate with jsPDF to generate a PDF
    // For now, we'll simulate the process
    try {
      const customer = customers.find(c => c.id === estimate.customerId);
      const vehicle = vehicles.find(v => v.id === estimate.vehicleId);
      
      if (!customer || !vehicle) {
        throw new Error('Customer or vehicle not found');
      }

      // In a real implementation, you would use jsPDF here
      console.log('Generating PDF for estimate:', estimate.estimateNumber);
      
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a blob URL for download (simulated)
      return `data:application/pdf;base64,simulated-pdf-content-for-${estimate.estimateNumber}`;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const calculateInvoiceTotals = (items: InvoiceItem[], taxRate: number = 8.5) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const createInvoice = (invoiceData: Partial<Invoice>) => {
    const newInvoice: Invoice = {
      id: (invoices.length + 1).toString(),
      invoiceNumber: generateInvoiceNumber(),
      customerId: invoiceData.customerId || '',
      vehicleId: invoiceData.vehicleId || '',
      items: invoiceData.items || [],
      subtotal: 0,
      tax: 0,
      taxRate: 8.5,
      total: 0,
      status: 'draft',
      createdAt: new Date(),
      dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: invoiceData.notes || '',
      serviceCheckId: invoiceData.serviceCheckId
    };

    // Calculate totals
    const totals = calculateInvoiceTotals(newInvoice.items, newInvoice.taxRate);
    newInvoice.subtotal = totals.subtotal;
    newInvoice.tax = totals.tax;
    newInvoice.total = totals.total;

    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, status } : invoice
    ));
  };

  const generateInvoicePDF = async (invoice: Invoice) => {
    // This would integrate with jsPDF to generate a PDF
    // For now, we'll simulate the process
    try {
      const customer = customers.find(c => c.id === invoice.customerId);
      const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
      
      if (!customer || !vehicle) {
        throw new Error('Customer or vehicle not found');
      }

      // In a real implementation, you would use jsPDF here
      console.log('Generating PDF for invoice:', invoice.invoiceNumber);
      
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a blob URL for download (simulated)
      return `data:application/pdf;base64,simulated-pdf-content-for-${invoice.invoiceNumber}`;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const sendInvoiceEmail = async (invoice: Invoice) => {
    try {
      const customer = customers.find(c => c.id === invoice.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // In a real implementation, this would call an email API
      console.log(`Sending invoice ${invoice.invoiceNumber} to ${customer.email}`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update invoice status to sent
      updateInvoiceStatus(invoice.id, 'sent');
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'appointments', label: 'Appointments', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'estimates', label: 'Estimates', icon: Calculator },
    { id: 'service-checks', label: 'Service Checks', icon: CheckSquare },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'website', label: 'Website', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut, action: () => signOut({ callbackUrl: '/admin' }) }
  ];

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-blue-600' },
    { label: 'Appointments Today', value: appointments.filter(apt => 
      apt.date.toDateString() === new Date().toDateString()
    ).length, icon: Calendar, color: 'text-green-600' },
    { label: 'Pending Invoices', value: 5, icon: FileText, color: 'text-orange-600' },
    { label: 'Monthly Revenue', value: formatCurrency(12450), icon: DollarSign, color: 'text-purple-600' }
  ];

  const Sidebar = () => (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 lg:relative lg:translate-x-0"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-20px)]"> {/* Adjusted height to ensure logout button is visible */}
          <nav className="space-y-2 p-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </motion.div>
  );

  const DashboardContent = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-3xl font-bold text-primary mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Upcoming appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.slice(0, 3).map((appointment) => {
                  const customer = customers.find(c => c.id === appointment.customerId);
                  const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
                  return (
                    <div key={appointment.id} className="flex items-center space-x-4 p-3 rounded-lg bg-accent/20">
                      <Avatar>
                        <AvatarFallback>{customer?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{customer?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle?.year} {vehicle?.make} {vehicle?.model} - {appointment.service}
                        </p>
                        <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      </div>
                      <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex-col space-y-2" variant="outline" onClick={() => { setActiveTab('customers'); setIsAddCustomerDialogOpen(true); }}>
                  <Plus className="h-6 w-6" />
                  <span>New Customer</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline" onClick={() => { setActiveTab('appointments'); setIsAddAppointmentDialogOpen(true); }}>
                  <Calendar className="h-6 w-6" />
                  <span>Schedule</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline" onClick={() => { setActiveTab('invoices'); setIsAddInvoiceDialogOpen(true); }}>
                  <FileText className="h-6 w-6" />
                  <span>Create Invoice</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline" onClick={() => { setActiveTab('service-checks'); setIsAddServiceCheckDialogOpen(true); }}>
                  <CheckSquare className="h-6 w-6" />
                  <span>Service Check</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );

  const CustomersContent = () => {
    const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [customerFilter, setCustomerFilter] = useState('all');

    const filteredCustomers = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      
      if (customerFilter === 'recent') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return matchesSearch && customer.createdAt >= thirtyDaysAgo;
      }
      
      return matchesSearch;
    });

    const handleAddCustomer = () => {
      if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
        alert('Please fill in all required fields.');
        return;
      }

      const customer: Customer = {
        id: (customers.length + 1).toString(),
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        createdAt: new Date()
      };

      setCustomers(prev => [...prev, customer]);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      setIsAddCustomerDialogOpen(false);
      alert('Customer added successfully!');
    };

    const handleEditCustomer = () => {
      if (!editingCustomer || !editingCustomer.name || !editingCustomer.email || !editingCustomer.phone) {
        alert('Please fill in all required fields.');
        return;
      }

      setCustomers(prev => prev.map(customer => 
        customer.id === editingCustomer.id ? editingCustomer : customer
      ));
      setEditingCustomer(null);
      setIsEditDialogOpen(false);
      alert('Customer updated successfully!');
    };

    const handleDeleteCustomer = (customerId: string) => {
      if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        // Check if customer has associated vehicles or appointments
        const hasVehicles = vehicles.some(v => v.customerId === customerId);
        const hasAppointments = appointments.some(a => a.customerId === customerId);
        const hasInvoices = invoices.some(i => i.customerId === customerId);

        if (hasVehicles || hasAppointments || hasInvoices) {
          alert('Cannot delete customer with existing vehicles, appointments, or invoices. Please remove associated records first.');
          return;
        }

        setCustomers(prev => prev.filter(customer => customer.id !== customerId));
        alert('Customer deleted successfully!');
      }
    };

    const getCustomerStats = (customerId: string) => {
      const customerVehicles = vehicles.filter(v => v.customerId === customerId);
      const customerAppointments = appointments.filter(a => a.customerId === customerId);
      const customerInvoices = invoices.filter(i => i.customerId === customerId);
      const totalSpent = customerInvoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total, 0);

      return {
        vehicleCount: customerVehicles.length,
        appointmentCount: customerAppointments.length,
        invoiceCount: customerInvoices.length,
        totalSpent,
        lastVisit: customerAppointments.length > 0 
          ? new Date(Math.max(...customerAppointments.map(a => a.date.getTime())))
          : null
      };
    };

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Customers</h2>
            <p className="text-muted-foreground">Manage your customer database</p>
          </div>
          <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Enter customer information below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="add-name">Full Name *</Label>
                  <Input 
                    id="add-name" 
                    placeholder="John Smith" 
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="add-email">Email *</Label>
                  <Input 
                    id="add-email" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="add-phone">Phone *</Label>
                  <Input 
                    id="add-phone" 
                    placeholder="+1 (555) 123-4567" 
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="add-address">Address</Label>
                  <Textarea 
                    id="add-address" 
                    placeholder="123 Main St, City, State 12345" 
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={handleAddCustomer}>Add Customer</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsAddCustomerDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <div className="flex space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, or phone..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="recent">Recent (30 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                return (
                  <Card key={customer.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{customer.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Mail className="mr-1 h-3 w-3" />
                                {customer.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-3 w-3" />
                                {customer.phone}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="mr-1 h-3 w-3" />
                              {customer.address || 'No address provided'}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                              <span>{stats.vehicleCount} vehicle{stats.vehicleCount !== 1 ? 's' : ''}</span>
                              <span>{stats.appointmentCount} appointment{stats.appointmentCount !== 1 ? 's' : ''}</span>
                              <span>{formatCurrency(stats.totalSpent)} total spent</span>
                              {stats.lastVisit && (
                                <span>Last visit: {format(stats.lastVisit, "MMM dd, yyyy")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setViewingCustomer(customer);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingCustomer({ ...customer });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm ? 'No customers found' : 'No customers yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search terms or filters.'
                      : 'Add your first customer to get started with managing your business.'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsAddCustomerDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Customer
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>Update customer information</DialogDescription>
            </DialogHeader>
            {editingCustomer && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input 
                    id="edit-name" 
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input 
                    id="edit-email" 
                    type="email" 
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input 
                    id="edit-phone" 
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address">Address</Label>
                  <Textarea 
                    id="edit-address" 
                    value={editingCustomer.address}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, address: e.target.value } : null)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={handleEditCustomer}>Save Changes</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Customer Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>Complete customer information and history</DialogDescription>
            </DialogHeader>
            {viewingCustomer && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {viewingCustomer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{viewingCustomer.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{viewingCustomer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{viewingCustomer.phone}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{viewingCustomer.address || 'No address provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Customer since {format(viewingCustomer.createdAt, "MMMM dd, yyyy")}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const stats = getCustomerStats(viewingCustomer.id);
                        return (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-accent/20 rounded-lg">
                              <p className="text-2xl font-bold text-primary">{stats.vehicleCount}</p>
                              <p className="text-sm text-muted-foreground">Vehicle{stats.vehicleCount !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-center p-3 bg-accent/20 rounded-lg">
                              <p className="text-2xl font-bold text-primary">{stats.appointmentCount}</p>
                              <p className="text-sm text-muted-foreground">Appointment{stats.appointmentCount !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-center p-3 bg-accent/20 rounded-lg">
                              <p className="text-2xl font-bold text-primary">{stats.invoiceCount}</p>
                              <p className="text-sm text-muted-foreground">Invoice{stats.invoiceCount !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-center p-3 bg-accent/20 rounded-lg">
                              <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalSpent)}</p>
                              <p className="text-sm text-muted-foreground">Total Spent</p>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Vehicles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const customerVehicles = vehicles.filter(v => v.customerId === viewingCustomer.id);
                      return customerVehicles.length > 0 ? (
                        <div className="grid gap-3">
                          {customerVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <Car className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {vehicle.color} • {vehicle.licensePlate} • VIN: {vehicle.vin}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No vehicles registered</p>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Recent Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const customerAppointments = appointments
                        .filter(a => a.customerId === viewingCustomer.id)
                        .sort((a, b) => b.date.getTime() - a.date.getTime())
                        .slice(0, 5);
                      
                      return customerAppointments.length > 0 ? (
                        <div className="space-y-3">
                          {customerAppointments.map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{appointment.service}</p>
                                <p className="text-sm text-muted-foreground">
                                  {vehicle?.year} {vehicle?.make} {vehicle?.model} • {format(appointment.date, "MMM dd, yyyy")} at {appointment.time}
                                </p>
                              </div>
                              <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No appointments found</p>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Recent Invoices */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const customerInvoices = invoices
                        .filter(i => i.customerId === viewingCustomer.id)
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                        .slice(0, 5);
                      
                      return customerInvoices.length > 0 ? (
                        <div className="space-y-3">
                          {customerInvoices.map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{invoice.invoiceNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(invoice.createdAt, "MMM dd, yyyy")} • Due: {format(invoice.dueDate, "MMM dd, yyyy")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                                <Badge variant={
                                  invoice.status === 'paid' ? 'default' : 
                                  invoice.status === 'overdue' ? 'destructive' : 'secondary'
                                }>
                                  {invoice.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No invoices found</p>
                      );
                    })()}
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingCustomer({ ...viewingCustomer });
                      setIsViewDialogOpen(false);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Customer
                  </Button>
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  };

  const VehiclesContent = () => {
    const [newVehicle, setNewVehicle] = useState({
      customerId: '',
      make: '',
      model: '',
      year: '',
      color: '',
      vin: '',
      licensePlate: '',
      registration: ''
    });
    const [isLookingUpVehicle, setIsLookingUpVehicle] = useState(false);
    const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false);
    const [motHistory, setMotHistory] = useState<MotTest[] | null>(null);
    const [viewingVehicleMot, setViewingVehicleMot] = useState<MotTest[] | null>(null);

    const handleVehicleLookup = async (registration?: string) => {
      const reg = registration || newVehicle.registration;
      if (!reg) {
        alert('Please enter a registration number.');
        return;
      }
      setIsLookingUpVehicle(true);
      setMotHistory(null);
      try {
        const response = await fetch(`/api/mot?registration=${reg}`);
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.details?.errors?.[0]?.detail || 'Failed to fetch vehicle data. Check the registration number.';
          throw new Error(errorMessage);
        }
        const data = await response.json();
        const vehicleData = data[0];
        if (vehicleData) {
          if (registration) { // This is a lookup from the view dialog
            setViewingVehicleMot(vehicleData.motTests || []);
          } else { // This is from the add vehicle form
            setNewVehicle(prev => ({
              ...prev,
              make: vehicleData.make || '',
              model: vehicleData.model || '',
              year: vehicleData.firstUsedDate ? new Date(vehicleData.firstUsedDate).getFullYear().toString() : '',
              color: vehicleData.primaryColour || '',
              licensePlate: vehicleData.registration || prev.registration,
              vin: vehicleData.vin || ''
            }));
            setMotHistory(vehicleData.motTests || []);
            alert('Vehicle details populated successfully.');
          }
        } else {
          alert('No vehicle found for this registration number.');
        }
      } catch (error: any) {
        console.error('Error fetching vehicle data:', error);
        alert(`Error: ${error.message}`);
      } finally {
        setIsLookingUpVehicle(false);
      }
    };

    const handleLegacyVehicleLookup = async () => {
      handleVehicleLookup();
    }

    const handleAddVehicle = () => {
      if (!newVehicle.customerId || !newVehicle.make || !newVehicle.model || !newVehicle.year || !newVehicle.licensePlate) {
        alert('Please fill in all required fields.');
        return;
      }

      const vehicle: Vehicle = {
        id: (vehicles.length + 1).toString(),
        customerId: newVehicle.customerId,
        make: newVehicle.make,
        model: newVehicle.model,
        year: parseInt(newVehicle.year),
        vin: newVehicle.vin,
        licensePlate: newVehicle.licensePlate,
        color: newVehicle.color
      };

      setVehicles(prev => [...prev, vehicle]);
      setNewVehicle({ customerId: '', make: '', model: '', year: '', color: '', vin: '', licensePlate: '', registration: '' });
      setIsAddVehicleDialogOpen(false);
      alert('Vehicle added successfully!');
    };

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Vehicles</h2>
            <p className="text-muted-foreground">Manage customer vehicles</p>
          </div>
          <Dialog open={isAddVehicleDialogOpen} onOpenChange={setIsAddVehicleDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddVehicleDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>Enter vehicle registration to look up details, or fill them in manually.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="registration">Registration Number</Label>
                    <Input 
                      id="registration" 
                      placeholder="e.g. AB12 CDE" 
                      value={newVehicle.registration}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, registration: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <Button onClick={handleLegacyVehicleLookup} disabled={isLookingUpVehicle}>
                    {isLookingUpVehicle ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Looking up...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Look up
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="customer-select">Customer *</Label>
                  <Select value={newVehicle.customerId} onValueChange={(value) => setNewVehicle(prev => ({ ...prev, customerId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make *</Label>
                    <Input id="make" placeholder="Toyota" value={newVehicle.make} onChange={(e) => setNewVehicle(prev => ({ ...prev, make: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input id="model" placeholder="Camry" value={newVehicle.model} onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input id="year" type="number" placeholder="2020" value={newVehicle.year} onChange={(e) => setNewVehicle(prev => ({ ...prev, year: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" placeholder="Silver" value={newVehicle.color} onChange={(e) => setNewVehicle(prev => ({ ...prev, color: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="vin">VIN</Label>
                  <Input id="vin" placeholder="1HGBH41JXMN109186" value={newVehicle.vin} onChange={(e) => setNewVehicle(prev => ({ ...prev, vin: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="license">License Plate *</Label>
                  <Input id="license" placeholder="ABC123" value={newVehicle.licensePlate} onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value }))} />
                </div>
                <Button className="w-full" onClick={handleAddVehicle}>Add Vehicle</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <div className="flex space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles by make, model, or license plate..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            {vehicles.filter(vehicle => {
              const customer = customers.find(c => c.id === vehicle.customerId);
              const searchLower = searchTerm.toLowerCase();
              return vehicle.make.toLowerCase().includes(searchLower) ||
                    vehicle.model.toLowerCase().includes(searchLower) ||
                    vehicle.licensePlate.toLowerCase().includes(searchLower) ||
                    vehicle.vin.toLowerCase().includes(searchLower) ||
                    (customer && customer.name.toLowerCase().includes(searchLower));
            }).map((vehicle) => {
              const customer = customers.find(c => c.id === vehicle.customerId);
              const stats = getVehicleStats(vehicle.id);
              return (
                <Card key={vehicle.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Car className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">Owner: {customer?.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>VIN: {vehicle.vin}</span>
                            <span>Plate: {vehicle.licensePlate}</span>
                            <span>Color: {vehicle.color}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                            <span>{stats.appointmentCount} appointment{stats.appointmentCount !== 1 ? 's' : ''}</span>
                            <span>{formatCurrency(stats.totalSpent)} total spent</span>
                            {stats.lastService && (
                              <span>Last service: {format(stats.lastService, "MMM dd, yyyy")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setViewingVehicle(vehicle);
                            setIsVehicleViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingVehicle({ ...vehicle });
                            setIsVehicleEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Edit Vehicle Dialog */}
        <Dialog open={isVehicleEditDialogOpen} onOpenChange={setIsVehicleEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
              <DialogDescription>Update vehicle information</DialogDescription>
            </DialogHeader>
            {editingVehicle && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-customer">Customer</Label>
                  <Select 
                    value={editingVehicle.customerId} 
                    onValueChange={(value) => setEditingVehicle(prev => prev ? { ...prev, customerId: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-make">Make *</Label>
                    <Input 
                      id="edit-make" 
                      value={editingVehicle.make}
                      onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, make: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-model">Model *</Label>
                    <Input 
                      id="edit-model" 
                      value={editingVehicle.model}
                      onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, model: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-year">Year *</Label>
                    <Input 
                      id="edit-year" 
                      type="number" 
                      value={editingVehicle.year}
                      onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, year: parseInt(e.target.value) || 0 } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-color">Color</Label>
                    <Input 
                      id="edit-color" 
                      value={editingVehicle.color}
                      onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, color: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-vin">VIN</Label>
                  <Input 
                    id="edit-vin" 
                    value={editingVehicle.vin}
                    onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, vin: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-license">License Plate</Label>
                  <Input 
                    id="edit-license" 
                    value={editingVehicle.licensePlate}
                    onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, licensePlate: e.target.value } : null)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={handleEditVehicle}>Save Changes</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsVehicleEditDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Vehicle Dialog */}
        <Dialog open={isVehicleViewDialogOpen} onOpenChange={setIsVehicleViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vehicle Details</DialogTitle>
              <DialogDescription>Complete vehicle information and service history</DialogDescription>
            </DialogHeader>
            {viewingVehicle && (
              <div className="space-y-6">
                {/* Vehicle Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Car className="h-4 w-4 text-white" />
                        </div>
                        <span>{viewingVehicle.year} {viewingVehicle.make} {viewingVehicle.model}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Owner: {customers.find(c => c.id === viewingVehicle.customerId)?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">VIN:</span>
                        <span className="text-sm">{viewingVehicle.vin}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">License Plate:</span>
                        <span className="text-sm">{viewingVehicle.licensePlate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Color:</span>
                        <span className="text-sm">{viewingVehicle.color}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Service Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const stats = getVehicleStats(viewingVehicle.id);
                        return (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-accent/20 rounded-lg">
                              <p className="text-2xl font-bold text-primary">{stats.appointmentCount}</p>
                              <p className="text-sm text-muted-foreground">Appointment{stats.appointmentCount !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-center p-3 bg-accent/20 rounded-lg">
                              <p className="text-2xl font-bold text-primary">{stats.invoiceCount}</p>
                              <p className="text-sm text-muted-foreground">Invoice{stats.invoiceCount !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-center p-3 bg-accent/20 rounded-lg">
                              <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalSpent)}</p>
                              <p className="text-sm text-muted-foreground">Total Spent</p>
                            </div>
                            <div className="text-center p-3 bg-accent/20 rounded-lg">
                              <p className="text-2xl font-bold text-primary">
                                {stats.lastService ? format(stats.lastService, "MMM dd") : 'Never'}
                              </p>
                              <p className="text-sm text-muted-foreground">Last Service</p>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>

                {/* MOT History */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>MOT History</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVehicleLookup(viewingVehicle?.licensePlate)}
                        disabled={isLookingUpVehicle}
                      >
                        {isLookingUpVehicle ? 'Fetching...' : 'Fetch MOT History'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {viewingVehicleMot ? (
                      viewingVehicleMot.length > 0 ? (
                        (() => {
                          const latestTest = viewingVehicleMot[0];
                          const advisories = latestTest.rfrAndComments.filter(
                            (rfr) => rfr.type === 'ADVISORY'
                          );
                          return (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                                <div>
                                  <p className="font-medium">Most Recent MOT</p>
                                  <p className="text-sm text-muted-foreground">
                                    Test Date: {format(new Date(latestTest.completedDate), "PPP")}
                                  </p>
                                  {latestTest.expiryDate && (
                                    <p className="text-sm text-muted-foreground">
                                      Expiry Date: {format(new Date(latestTest.expiryDate), "PPP")}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={latestTest.testResult === 'PASSED' ? 'default' : 'destructive'}>
                                  {latestTest.testResult}
                                </Badge>
                              </div>
                              {advisories.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Advisories:</h4>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    {advisories.map((advisory, index) => (
                                      <li key={index}>{advisory.text}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {advisories.length === 0 && (
                                <p className="text-sm text-muted-foreground">No advisories on the latest test.</p>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No MOT history found for this vehicle.</p>
                      )
                    ) : (
                      <p className="text-muted-foreground text-center py-4">Click "Fetch MOT History" to view details.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Service History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const vehicleAppointments = appointments
                        .filter(a => a.vehicleId === viewingVehicle.id)
                        .sort((a, b) => b.date.getTime() - a.date.getTime())
                        .slice(0, 10);
                      
                      return vehicleAppointments.length > 0 ? (
                        <div className="space-y-3">
                          {vehicleAppointments.map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{appointment.service}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(appointment.date, "MMM dd, yyyy")} at {appointment.time}
                                </p>
                                {appointment.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Notes: {appointment.notes}
                                  </p>
                                )}
                              </div>
                              <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No service history found</p>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Invoice History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const vehicleInvoices = invoices
                        .filter(i => i.vehicleId === viewingVehicle.id)
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                        .slice(0, 10);
                      
                      return vehicleInvoices.length > 0 ? (
                        <div className="space-y-3">
                          {vehicleInvoices.map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{invoice.invoiceNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(invoice.createdAt, "MMM dd, yyyy")} • Due: {format(invoice.dueDate, "MMM dd, yyyy")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                                <Badge variant={
                                  invoice.status === 'paid' ? 'default' : 
                                  invoice.status === 'overdue' ? 'destructive' : 'secondary'
                                }>
                                  {invoice.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No invoices found</p>
                      );
                    })()}
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingVehicle({ ...viewingVehicle });
                      setIsVehicleViewDialogOpen(false);
                      setIsVehicleEditDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Vehicle
                  </Button>
                  <Button variant="outline" onClick={() => setIsVehicleViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  };

  const AppointmentsContent = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredAppointments = appointments.filter(appointment => {
      const customer = customers.find(c => c.id === appointment.customerId);
      const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
      
      const matchesSearch = appointmentSearchTerm === '' || 
        appointment.service.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
        customer?.name.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
        vehicle?.make.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
        vehicle?.model.toLowerCase().includes(appointmentSearchTerm.toLowerCase());

      if (appointmentFilter === 'today') {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return matchesSearch && appointmentDate.getTime() === today.getTime();
      } else if (appointmentFilter === 'upcoming') {
        return matchesSearch && appointment.date >= today;
      } else if (appointmentFilter === 'past') {
        return matchesSearch && appointment.date < today;
      }
      
      return matchesSearch;
    });

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Appointments</h2>
            <p className="text-muted-foreground">Schedule and manage appointments</p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddAppointmentDialogOpen} onOpenChange={setIsAddAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>Book a service appointment</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apt-customer">Customer</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apt-vehicle">Vehicle</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apt-service">Service Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oil-change">Oil Change</SelectItem>
                        <SelectItem value="brake-service">Brake Service</SelectItem>
                        <SelectItem value="tire-rotation">Tire Rotation</SelectItem>
                        <SelectItem value="inspection">General Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apt-date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="apt-time">Time</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apt-notes">Notes</Label>
                    <Textarea id="apt-notes" placeholder="Special instructions or concerns..." />
                  </div>
                  <Button className="w-full">Schedule Appointment</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <>
              <div className="flex space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments by service, customer, or vehicle..."
                    className="pl-10"
                    value={appointmentSearchTerm}
                    onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={appointmentFilter} onValueChange={(value) => setAppointmentFilter(value as 'all' | 'upcoming' | 'today' | 'past')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter appointments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Appointments</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => {
                    const customer = customers.find(c => c.id === appointment.customerId);
                    const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
                    const isUpcoming = appointment.date >= today;
                    
                    return (
                      <Card key={appointment.id} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Calendar className="h-8 w-8 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{appointment.service}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {customer?.name} - {vehicle?.year} {vehicle?.make} {vehicle?.model}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                  <span>{format(appointment.date, "PPP")}</span>
                                  <span>{appointment.time}</span>
                                  {!isUpcoming && (
                                    <span className="text-orange-600">Past</span>
                                  )}
                                </div>
                                {appointment.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Notes: {appointment.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                appointment.status === 'completed' ? 'default' : 
                                appointment.status === 'in-progress' ? 'secondary' :
                                appointment.status === 'cancelled' ? 'destructive' : 'outline'
                              }>
                                {appointment.status}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setViewingAppointment(appointment);
                                  setIsAppointmentViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingAppointment({ ...appointment });
                                  setIsAppointmentEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        {appointmentSearchTerm || appointmentFilter !== 'all' ? 'No appointments found' : 'No appointments yet'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {appointmentSearchTerm || appointmentFilter !== 'all'
                          ? 'Try adjusting your search terms or filters.'
                          : 'Schedule your first appointment to get started.'
                        }
                      </p>
                      {!appointmentSearchTerm && appointmentFilter === 'all' && (
                        <Button onClick={() => setIsAddAppointmentDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Schedule First Appointment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
        </motion.div>

        {/* Edit Appointment Dialog */}
        <Dialog open={isAppointmentEditDialogOpen} onOpenChange={setIsAppointmentEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>Update appointment information</DialogDescription>
            </DialogHeader>
            {editingAppointment && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-apt-customer">Customer *</Label>
                  <Select 
                    value={editingAppointment.customerId} 
                    onValueChange={(value) => setEditingAppointment(prev => prev ? { ...prev, customerId: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-apt-vehicle">Vehicle *</Label>
                  <Select 
                    value={editingAppointment.vehicleId} 
                    onValueChange={(value) => setEditingAppointment(prev => prev ? { ...prev, vehicleId: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.filter(v => v.customerId === editingAppointment.customerId).map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-apt-service">Service Type *</Label>
                  <Select 
                    value={editingAppointment.service} 
                    onValueChange={(value) => setEditingAppointment(prev => prev ? { ...prev, service: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oil Change">Oil Change</SelectItem>
                      <SelectItem value="Brake Service">Brake Service</SelectItem>
                      <SelectItem value="Tire Rotation">Tire Rotation</SelectItem>
                      <SelectItem value="General Inspection">General Inspection</SelectItem>
                      <SelectItem value="Brake Inspection">Brake Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-apt-date">Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(editingAppointment.date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={editingAppointment.date}
                        onSelect={(date) => setEditingAppointment(prev => prev && date ? { ...prev, date } : prev)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="edit-apt-time">Time *</Label>
                  <Select 
                    value={editingAppointment.time} 
                    onValueChange={(value) => setEditingAppointment(prev => prev ? { ...prev, time: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                      <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                      <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                      <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                      <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                      <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                      <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-apt-status">Status</Label>
                  <Select 
                    value={editingAppointment.status} 
                    onValueChange={(value: any) => setEditingAppointment(prev => prev ? { ...prev, status: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-apt-notes">Notes</Label>
                  <Textarea 
                    id="edit-apt-notes" 
                    value={editingAppointment.notes}
                    onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    placeholder="Special instructions or concerns..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={handleEditAppointment}>Save Changes</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsAppointmentEditDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Appointment Dialog */}
        <Dialog open={isAppointmentViewDialogOpen} onOpenChange={setIsAppointmentViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>Complete appointment information</DialogDescription>
            </DialogHeader>
            {viewingAppointment && (
              <div className="space-y-6">
                {/* Appointment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <span>{viewingAppointment.service}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Customer: {customers.find(c => c.id === viewingAppointment.customerId)?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>Vehicle: {(() => {
                          const vehicle = vehicles.find(v => v.id === viewingAppointment.vehicleId);
                          return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
                        })()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(viewingAppointment.date, "MMMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{viewingAppointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={
                          viewingAppointment.status === 'completed' ? 'default' : 
                          viewingAppointment.status === 'in-progress' ? 'secondary' :
                          viewingAppointment.status === 'cancelled' ? 'destructive' : 'outline'
                        }>
                          {viewingAppointment.status}
                        </Badge>
                      </div>
                      {viewingAppointment.notes && (
                        <div className="mt-4">
                          <span className="text-sm font-medium">Notes:</span>
                          <p className="text-sm text-muted-foreground mt-1">{viewingAppointment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const customer = customers.find(c => c.id === viewingAppointment.customerId);
                        return customer ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{customer.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{customer.phone}</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm">{customer.address || 'No address provided'}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Customer information not found</p>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>

                {/* Related Records */}
                <Card>
                  <CardHeader>
                    <CardTitle>Related Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const relatedInvoices = invoices.filter(i => 
                        i.customerId === viewingAppointment.customerId && 
                        i.vehicleId === viewingAppointment.vehicleId
                      );
                      
                      return relatedInvoices.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-medium">Related Invoices:</h4>
                          {relatedInvoices.slice(0, 3).map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{invoice.invoiceNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(invoice.createdAt, "MMM dd, yyyy")} • ${invoice.total.toFixed(2)}
                                </p>
                              </div>
                              <Badge variant={
                                invoice.status === 'paid' ? 'default' : 
                                invoice.status === 'overdue' ? 'destructive' : 'secondary'
                              }>
                                {invoice.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No related invoices found</p>
                      );
                    })()}
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingAppointment({ ...viewingAppointment });
                      setIsAppointmentViewDialogOpen(false);
                      setIsAppointmentEditDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Appointment
                  </Button>
                  <Button variant="outline" onClick={() => setIsAppointmentViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  };

  const CalendarContent = () => {
    const calendarEvents = appointments.map(appointment => {
      const customer = customers.find(c => c.id === appointment.customerId);
      const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
      const start = new Date(appointment.date);
      const [hours, minutes] = appointment.time.split(/:| /);
      let hour = parseInt(hours);
      if (appointment.time.includes('PM') && hour !== 12) {
        hour += 12;
      }
      if (appointment.time.includes('AM') && hour === 12) {
        hour = 0;
      }
      start.setHours(hour, parseInt(minutes) || 0);

      return {
        id: appointment.id,
        title: `${appointment.service} - ${customer?.name}`,
        start,
        extendedProps: {
          ...appointment,
          customer,
          vehicle
        }
      };
    });

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Calendar</h2>
            <p className="text-muted-foreground">View and manage appointments in a calendar view</p>
          </div>
          <Dialog open={isAddAppointmentDialogOpen} onOpenChange={setIsAddAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>Book a service appointment</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apt-customer">Customer</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apt-vehicle">Vehicle</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apt-service">Service Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oil-change">Oil Change</SelectItem>
                        <SelectItem value="brake-service">Brake Service</SelectItem>
                        <SelectItem value="tire-rotation">Tire Rotation</SelectItem>
                        <SelectItem value="inspection">General Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apt-date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="apt-time">Time</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apt-notes">Notes</Label>
                    <Textarea id="apt-notes" placeholder="Special instructions or concerns..." />
                  </div>
                  <Button className="w-full">Schedule Appointment</Button>
                </div>
              </DialogContent>
            </Dialog>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Card className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={calendarEvents}
              eventClick={(info) => {
                const appointment = appointments.find(a => a.id === info.event.id);
                if (appointment) {
                  setViewingAppointment(appointment);
                  setIsAppointmentViewDialogOpen(true);
                }
              }}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
            />
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  const InvoicesContent = () => {
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [invoiceNotes, setInvoiceNotes] = useState('');
    const [invoiceDueDate, setInvoiceDueDate] = useState<Date>();
    const [isCreating, setIsCreating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });

    const handleCreateAndAddProduct = () => {
      const price = parseFloat(newProduct.price);
      if (!newProduct.name || !newProduct.price || isNaN(price) || price <= 0) {
        alert('Please provide a valid product name and price.');
        return;
      }
      const createdProduct: Product = {
        id: `prod-${Date.now()}`,
        name: newProduct.name,
        description: newProduct.description,
        price: price,
        category: 'Service',
        stock: 999,
      };
      setProducts(prev => [...prev, createdProduct]);
      addInvoiceItem(createdProduct);
      setNewProduct({ name: '', description: '', price: '' });
    };

    const addInvoiceItem = (product: Product, quantity: number = 1) => {
      const existingItem = invoiceItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        setInvoiceItems(prev => prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
            : item
        ));
      } else {
        const newItem: InvoiceItem = {
          id: `item-${Date.now()}`,
          productId: product.id,
          name: product.name,
          description: product.description,
          quantity,
          price: product.price,
          total: product.price * quantity
        };
        setInvoiceItems(prev => [...prev, newItem]);
      }
    };

    const removeInvoiceItem = (itemId: string) => {
      setInvoiceItems(prev => prev.filter(item => item.id !== itemId));
    };

    const updateItemQuantity = (itemId: string, quantity: number) => {
      setInvoiceItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity, total: quantity * item.price }
          : item
      ));
    };

    const updateItemPrice = (itemId: string, price: number) => {
      setInvoiceItems(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, price, total: item.quantity * price }
          : item
      ));
    };

    const resetInvoiceForm = () => {
      setSelectedCustomerId('');
      setSelectedVehicleId('');
      setInvoiceItems([]);
      setInvoiceNotes('');
      setInvoiceDueDate(undefined);
    };

    const handleCreateInvoice = async (sendImmediately: boolean = false) => {
      if (!selectedCustomerId || !selectedVehicleId || invoiceItems.length === 0) {
        alert('Please fill in all required fields and add at least one item.');
        return;
      }

      setIsCreating(true);
      try {
        const newInvoice = createInvoice({
          customerId: selectedCustomerId,
          vehicleId: selectedVehicleId,
          items: invoiceItems,
          notes: invoiceNotes,
          dueDate: invoiceDueDate
        });

        if (sendImmediately) {
          setIsSending(true);
          await sendInvoiceEmail(newInvoice);
        }

        resetInvoiceForm();
        setIsAddInvoiceDialogOpen(false);
        alert(`Invoice ${newInvoice.invoiceNumber} ${sendImmediately ? 'created and sent' : 'created'} successfully!`);
      } catch (error) {
        console.error('Error creating invoice:', error);
        alert('Error creating invoice. Please try again.');
      } finally {
        setIsCreating(false);
        setIsSending(false);
      }
    };

    const handleDownloadPDF = async (invoice: Invoice) => {
      setIsGeneratingPDF(true);
      try {
        const pdfUrl = await generateInvoicePDF(invoice);
        // In a real implementation, this would trigger a download
        console.log('PDF generated:', pdfUrl);
        alert('PDF generated successfully!');
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      } finally {
        setIsGeneratingPDF(false);
      }
    };

    const handleSendEmail = async (invoice: Invoice) => {
      setIsSending(true);
      try {
        await sendInvoiceEmail(invoice);
        alert('Invoice sent successfully!');
      } catch (error) {
        console.error('Error sending invoice:', error);
        alert('Error sending invoice. Please try again.');
      } finally {
        setIsSending(false);
      }
    };

    const filteredVehicles = vehicles.filter(vehicle => vehicle.customerId === selectedCustomerId);
    const totals = calculateInvoiceTotals(invoiceItems);

    const filteredInvoices = invoices.filter(invoice => {
      const customer = customers.find(c => c.id === invoice.customerId);
      const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
      
      const matchesSearch = invoiceSearchTerm === '' || 
        invoice.invoiceNumber.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        customer?.name.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        vehicle?.make.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        vehicle?.model.toLowerCase().includes(invoiceSearchTerm.toLowerCase());

      if (invoiceFilter === 'all') {
        return matchesSearch;
      }
      
      return matchesSearch && invoice.status === invoiceFilter;
    });

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Invoices</h2>
            <p className="text-muted-foreground">Create and manage invoices</p>
          </div>
          <Dialog open={isAddInvoiceDialogOpen} onOpenChange={setIsAddInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Generate an invoice for services and parts</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Customer and Vehicle Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inv-customer">Customer *</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="inv-vehicle">Vehicle *</Label>
                    <Select 
                      value={selectedVehicleId} 
                      onValueChange={setSelectedVehicleId}
                      disabled={!selectedCustomerId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Invoice Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-semibold">Invoice Items *</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Add Invoice Item</DialogTitle>
                          <DialogDescription>Select an existing product or create a new one.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Existing Products</h4>
                            <ScrollArea className="h-96">
                              <div className="space-y-2 pr-4">
                                {products.map((product) => (
                                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                                    <div className="flex-1">
                                      <h5 className="font-medium">{product.name}</h5>
                                      <p className="text-sm text-muted-foreground">{product.description}</p>
                                      <p className="text-sm font-semibold text-primary">{formatCurrency(product.price)}</p>
                                    </div>
                                    <Button size="sm" onClick={() => addInvoiceItem(product)}>Add</Button>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Create New Product</h4>
                            <div className="space-y-4 p-4 border rounded-lg">
                              <div>
                                <Label htmlFor="new-prod-name">Product Name *</Label>
                                <Input
                                  id="new-prod-name"
                                  value={newProduct.name}
                                  onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                  placeholder="e.g., Full Synthetic Oil"
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-prod-desc">Description</Label>
                                <Textarea
                                  id="new-prod-desc"
                                  value={newProduct.description}
                                  onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                  placeholder="e.g., 5 quarts of premium oil"
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-prod-price">Price *</Label>
                                <Input
                                  id="new-prod-price"
                                  type="number"
                                  value={newProduct.price}
                                  onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))}
                                  placeholder="e.g., 49.99"
                                />
                              </div>
                              <Button onClick={handleCreateAndAddProduct} className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Create & Add to Invoice
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {invoiceItems.length > 0 ? (
                    <div className="space-y-3">
                      {invoiceItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`qty-${item.id}`} className="text-sm">Qty</Label>
                              <Input
                                id={`qty-${item.id}`}
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-16"
                                min="1"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`price-${item.id}`} className="text-sm">Price (£)</Label>
                              <Input
                                id={`price-${item.id}`}
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-24"
                                step="0.01"
                              />
                            </div>
                            <div className="text-right w-24">
                              <p className="font-semibold">{formatCurrency(item.total)}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeInvoiceItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No items added yet. Click "Add Item" to get started.
                    </div>
                  )}
                </div>

                {/* Invoice Totals */}
                {invoiceItems.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 max-w-sm ml-auto">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8.5%):</span>
                        <span>{formatCurrency(totals.tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inv-notes">Notes & Recommendations</Label>
                    <Textarea 
                      id="inv-notes" 
                      placeholder="Additional notes, recommendations, or terms..."
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inv-due">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !invoiceDueDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {invoiceDueDate ? format(invoiceDueDate, "PPP") : "Pick due date (default: 30 days)"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={invoiceDueDate}
                          onSelect={setInvoiceDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleCreateInvoice(true)}
                    disabled={isCreating || isSending}
                  >
                    {isSending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Create & Send Invoice
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleCreateInvoice(false)}
                    disabled={isCreating || isSending}
                  >
                    {isCreating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      'Save as Draft'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Invoice List */}
        <motion.div variants={fadeInUp}>
          <div className="flex space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-10"
                value={invoiceSearchTerm}
                onChange={(e) => setInvoiceSearchTerm(e.target.value)}
              />
            </div>
            <Select value={invoiceFilter} onValueChange={(value) => setInvoiceFilter(value as 'all' | 'paid' | 'sent' | 'draft' | 'overdue')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => {
                const customer = customers.find(c => c.id === invoice.customerId);
                const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
                
                return (
                  <Card key={invoice.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                            <FileText className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              {customer?.name} - {vehicle?.year} {vehicle?.make} {vehicle?.model}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span>Created: {format(invoice.createdAt, "MMM dd, yyyy")}</span>
                              <span>Due: {format(invoice.dueDate, "MMM dd, yyyy")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{formatCurrency(invoice.total)}</p>
                            <Badge variant={
                              invoice.status === 'paid' ? 'default' : 
                              invoice.status === 'overdue' ? 'destructive' : 
                              invoice.status === 'sent' ? 'secondary' : 'outline'
                            }>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadPDF(invoice)}
                              disabled={isGeneratingPDF}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSendEmail(invoice)}
                              disabled={isSending || invoice.status === 'paid'}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setViewingInvoice(invoice);
                                setIsInvoiceViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingInvoice({ ...invoice });
                                setIsInvoiceEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {invoiceSearchTerm || invoiceFilter !== 'all' ? 'No invoices found' : 'No Invoices Yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {invoiceSearchTerm || invoiceFilter !== 'all'
                      ? 'Try adjusting your search terms or filters.'
                      : 'Create your first invoice to get started with billing your customers.'
                    }
                  </p>
                  {!invoiceSearchTerm && invoiceFilter === 'all' && (
                    <Button onClick={() => setIsAddInvoiceDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Invoice
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* View Invoice Dialog */}
        <Dialog open={isInvoiceViewDialogOpen} onOpenChange={setIsInvoiceViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>Complete invoice information</DialogDescription>
            </DialogHeader>
            {viewingInvoice && (
              <div className="space-y-6">
                {/* Invoice Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <span>{viewingInvoice.invoiceNumber}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Customer: {customers.find(c => c.id === viewingInvoice.customerId)?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>Vehicle: {(() => {
                          const vehicle = vehicles.find(v => v.id === viewingInvoice.vehicleId);
                          return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
                        })()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Created: {format(viewingInvoice.createdAt, "MMMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Due: {format(viewingInvoice.dueDate, "MMMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={
                          viewingInvoice.status === 'paid' ? 'default' : 
                          viewingInvoice.status === 'overdue' ? 'destructive' : 
                          viewingInvoice.status === 'sent' ? 'secondary' : 'outline'
                        }>
                          {viewingInvoice.status.charAt(0).toUpperCase() + viewingInvoice.status.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Invoice Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(viewingInvoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax ({viewingInvoice.taxRate}%):</span>
                          <span>{formatCurrency(viewingInvoice.tax)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-primary">{formatCurrency(viewingInvoice.total)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Invoice Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {viewingInvoice.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {formatCurrency(item.price)}
                            </p>
                            <p className="font-semibold">{formatCurrency(item.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {viewingInvoice.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{viewingInvoice.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => handleDownloadPDF(viewingInvoice)}
                    disabled={isGeneratingPDF}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingInvoice({ ...viewingInvoice });
                      setIsInvoiceViewDialogOpen(false);
                      setIsInvoiceEditDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Invoice
                  </Button>
                  <Button variant="outline" onClick={() => setIsInvoiceViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Invoice Dialog */}
        <Dialog open={isInvoiceEditDialogOpen} onOpenChange={setIsInvoiceEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
              <DialogDescription>Update invoice information</DialogDescription>
            </DialogHeader>
            {editingInvoice && (
              <div className="space-y-6">
                {/* Customer and Vehicle Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-inv-customer">Customer *</Label>
                    <Select 
                      value={editingInvoice.customerId} 
                      onValueChange={(value) => setEditingInvoice(prev => prev ? { ...prev, customerId: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-inv-vehicle">Vehicle *</Label>
                    <Select 
                      value={editingInvoice.vehicleId} 
                      onValueChange={(value) => setEditingInvoice(prev => prev ? { ...prev, vehicleId: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.filter(v => v.customerId === editingInvoice.customerId).map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <Label className="text-base font-semibold">Invoice Items *</Label>
                  <div className="space-y-3 mt-2">
                    {editingInvoice.items.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">Qty:</Label>
                            <Input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                setEditingInvoice(prev => prev ? {
                                  ...prev,
                                  items: prev.items.map((i, idx) => 
                                    idx === index 
                                      ? { ...i, quantity: newQuantity, total: newQuantity * i.price }
                                      : i
                                  )
                                } : null);
                              }}
                              className="w-16" 
                              min="1"
                            />
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                            <p className="font-semibold">{formatCurrency(item.total)}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingInvoice(prev => prev ? {
                                ...prev,
                                items: prev.items.filter((_, idx) => idx !== index)
                              } : null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoice Totals */}
                {editingInvoice.items.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 max-w-sm ml-auto">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(editingInvoice.items.reduce((sum, item) => sum + item.total, 0))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({editingInvoice.taxRate}%):</span>
                        <span>{formatCurrency(editingInvoice.items.reduce((sum, item) => sum + item.total, 0) * (editingInvoice.taxRate / 100))}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(editingInvoice.items.reduce((sum, item) => sum + item.total, 0) * (1 + editingInvoice.taxRate / 100))}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-inv-status">Status</Label>
                    <Select 
                      value={editingInvoice.status} 
                      onValueChange={(value: any) => setEditingInvoice(prev => prev ? { ...prev, status: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-inv-notes">Notes & Recommendations</Label>
                    <Textarea 
                      id="edit-inv-notes" 
                      value={editingInvoice.notes}
                      onChange={(e) => setEditingInvoice(prev => prev ? { ...prev, notes: e.target.value } : null)}
                      placeholder="Additional notes, recommendations, or terms..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-inv-due">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(editingInvoice.dueDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={editingInvoice.dueDate}
                          onSelect={(date) => setEditingInvoice(prev => prev && date ? { ...prev, dueDate: date } : prev)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={handleEditInvoice}>Save Changes</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsInvoiceEditDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  };

  const ServiceChecksContent = () => {
    const [serviceChecks, setServiceChecks] = useState<ServiceCheck[]>([
      {
        id: '1',
        customerId: '1',
        vehicleId: '1',
        technician: 'Mike Johnson',
        createdAt: new Date('2024-06-25'),
        items: [
          { id: '1', name: 'Engine Oil Level', status: 'good', notes: 'Oil level is adequate', photos: [] },
          { id: '2', name: 'Brake Fluid', status: 'needs-attention', notes: 'Fluid level slightly low', photos: [] },
          { id: '3', name: 'Tire Condition', status: 'good', notes: 'Tires in good condition', photos: [] },
          { id: '4', name: 'Battery', status: 'replace', notes: 'Battery showing signs of corrosion', photos: [] },
          { id: '5', name: 'Air Filter', status: 'good', notes: 'Clean air filter', photos: [] }
        ]
      },
      {
        id: '2',
        customerId: '2',
        vehicleId: '2',
        technician: 'Sarah Davis',
        createdAt: new Date('2024-06-24'),
        items: [
          { id: '6', name: 'Engine Oil Level', status: 'good', notes: 'Fresh oil change', photos: [] },
          { id: '7', name: 'Brake Pads', status: 'needs-attention', notes: 'Front pads at 30% remaining', photos: [] },
          { id: '8', name: 'Lights & Signals', status: 'good', notes: 'All lights functioning', photos: [] }
        ]
      }
    ]);

    const [isServiceCheckViewDialogOpen, setIsServiceCheckViewDialogOpen] = useState(false);
    const [isServiceCheckEditDialogOpen, setIsServiceCheckEditDialogOpen] = useState(false);
    const [viewingServiceCheck, setViewingServiceCheck] = useState<ServiceCheck | null>(null);
    const [editingServiceCheck, setEditingServiceCheck] = useState<ServiceCheck | null>(null);
    const [serviceCheckSearchTerm, setServiceCheckSearchTerm] = useState('');
    const [serviceCheckFilter, setServiceCheckFilter] = useState<'all' | 'recent' | 'needs-attention'>('all');

    // New service check form state
    const [newServiceCheck, setNewServiceCheck] = useState({
      customerId: '',
      vehicleId: '',
      technician: '',
      items: [
        { id: '1', name: 'Engine Oil Level', status: 'good' as const, notes: '', photos: [] },
        { id: '2', name: 'Brake Fluid', status: 'good' as const, notes: '', photos: [] },
        { id: '3', name: 'Tire Condition', status: 'good' as const, notes: '', photos: [] },
        { id: '4', name: 'Battery', status: 'good' as const, notes: '', photos: [] },
        { id: '5', name: 'Air Filter', status: 'good' as const, notes: '', photos: [] },
        { id: '6', name: 'Brake Pads', status: 'good' as const, notes: '', photos: [] },
        { id: '7', name: 'Lights & Signals', status: 'good' as const, notes: '', photos: [] },
        { id: '8', name: 'Belts & Hoses', status: 'good' as const, notes: '', photos: [] }
      ]
    });

    const handleCreateServiceCheck = () => {
      if (!newServiceCheck.customerId || !newServiceCheck.vehicleId || !newServiceCheck.technician) {
        alert('Please fill in all required fields.');
        return;
      }

      const serviceCheck: ServiceCheck = {
        id: (serviceChecks.length + 1).toString(),
        customerId: newServiceCheck.customerId,
        vehicleId: newServiceCheck.vehicleId,
        technician: newServiceCheck.technician,
        createdAt: new Date(),
        items: newServiceCheck.items.map(item => ({
          ...item,
          id: `${Date.now()}-${item.id}`
        }))
      };

      setServiceChecks(prev => [...prev, serviceCheck]);
      setNewServiceCheck({
        customerId: '',
        vehicleId: '',
        technician: '',
        items: [
          { id: '1', name: 'Engine Oil Level', status: 'good', notes: '', photos: [] },
          { id: '2', name: 'Brake Fluid', status: 'good', notes: '', photos: [] },
          { id: '3', name: 'Tire Condition', status: 'good', notes: '', photos: [] },
          { id: '4', name: 'Battery', status: 'good', notes: '', photos: [] },
          { id: '5', name: 'Air Filter', status: 'good', notes: '', photos: [] },
          { id: '6', name: 'Brake Pads', status: 'good', notes: '', photos: [] },
          { id: '7', name: 'Lights & Signals', status: 'good', notes: '', photos: [] },
          { id: '8', name: 'Belts & Hoses', status: 'good', notes: '', photos: [] }
        ]
      });
      setIsAddServiceCheckDialogOpen(false);
      alert('Service check created successfully!');
    };

    const handleEditServiceCheck = () => {
      if (!editingServiceCheck || !editingServiceCheck.customerId || !editingServiceCheck.vehicleId || !editingServiceCheck.technician) {
        alert('Please fill in all required fields.');
        return;
      }

      setServiceChecks(prev => prev.map(check => 
        check.id === editingServiceCheck.id ? editingServiceCheck : check
      ));
      setEditingServiceCheck(null);
      setIsServiceCheckEditDialogOpen(false);
      alert('Service check updated successfully!');
    };

    const handleDeleteServiceCheck = (serviceCheckId: string) => {
      if (confirm('Are you sure you want to delete this service check? This action cannot be undone.')) {
        setServiceChecks(prev => prev.filter(check => check.id !== serviceCheckId));
        alert('Service check deleted successfully!');
      }
    };

    const addNewServiceCheckItem = () => {
      const newItem = {
        id: Date.now().toString(),
        name: '',
        status: 'good' as const,
        notes: '',
        photos: []
      };
      setNewServiceCheck(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    };

    const removeServiceCheckItem = (itemId: string) => {
      setNewServiceCheck(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    };

    const updateServiceCheckItem = (itemId: string, field: string, value: any) => {
      setNewServiceCheck(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, [field]: value } : item
        )
      }));
    };

    const addEditingServiceCheckItem = () => {
      if (!editingServiceCheck) return;
      
      const newItem = {
        id: Date.now().toString(),
        name: '',
        status: 'good' as const,
        notes: '',
        photos: []
      };
      setEditingServiceCheck(prev => prev ? ({
        ...prev,
        items: [...prev.items, newItem]
      }) : null);
    };

    const removeEditingServiceCheckItem = (itemId: string) => {
      setEditingServiceCheck(prev => prev ? ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }) : null);
    };

    const updateEditingServiceCheckItem = (itemId: string, field: string, value: any) => {
      setEditingServiceCheck(prev => prev ? ({
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, [field]: value } : item
        )
      }) : null);
    };

    const getServiceCheckSummary = (serviceCheck: ServiceCheck) => {
      const summary = serviceCheck.items.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        good: summary.good || 0,
        needsAttention: summary['needs-attention'] || 0,
        replace: summary.replace || 0,
        total: serviceCheck.items.length
      };
    };

    const filteredServiceChecks = serviceChecks.filter(serviceCheck => {
      const customer = customers.find(c => c.id === serviceCheck.customerId);
      const vehicle = vehicles.find(v => v.id === serviceCheck.vehicleId);
      
      const matchesSearch = serviceCheckSearchTerm === '' || 
        customer?.name.toLowerCase().includes(serviceCheckSearchTerm.toLowerCase()) ||
        vehicle?.make.toLowerCase().includes(serviceCheckSearchTerm.toLowerCase()) ||
        vehicle?.model.toLowerCase().includes(serviceCheckSearchTerm.toLowerCase()) ||
        serviceCheck.technician.toLowerCase().includes(serviceCheckSearchTerm.toLowerCase());

      if (serviceCheckFilter === 'recent') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return matchesSearch && serviceCheck.createdAt >= sevenDaysAgo;
      } else if (serviceCheckFilter === 'needs-attention') {
        const hasIssues = serviceCheck.items.some(item => item.status === 'needs-attention' || item.status === 'replace');
        return matchesSearch && hasIssues;
      }
      
      return matchesSearch;
    });

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Service Checks</h2>
            <p className="text-muted-foreground">Digital inspection forms with comprehensive vehicle checks</p>
          </div>
          <Dialog open={isAddServiceCheckDialogOpen} onOpenChange={setIsAddServiceCheckDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Service Check
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Create Service Check</DialogTitle>
                <DialogDescription>Digital vehicle inspection form</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sc-customer">Customer *</Label>
                      <Select 
                        value={newServiceCheck.customerId} 
                        onValueChange={(value) => setNewServiceCheck(prev => ({ ...prev, customerId: value, vehicleId: '' }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sc-vehicle">Vehicle *</Label>
                      <Select 
                        value={newServiceCheck.vehicleId} 
                        onValueChange={(value) => setNewServiceCheck(prev => ({ ...prev, vehicleId: value }))}
                        disabled={!newServiceCheck.customerId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.filter(v => v.customerId === newServiceCheck.customerId).map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sc-technician">Technician *</Label>
                    <Input 
                      id="sc-technician" 
                      placeholder="Technician name" 
                      value={newServiceCheck.technician}
                      onChange={(e) => setNewServiceCheck(prev => ({ ...prev, technician: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-base font-semibold">Inspection Items</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addNewServiceCheckItem}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {newServiceCheck.items.map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <div className="flex-1">
                            <Input
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => updateServiceCheckItem(item.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="w-40">
                            <Select 
                              value={item.status} 
                              onValueChange={(value) => updateServiceCheckItem(item.id, 'status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="needs-attention">Needs Attention</SelectItem>
                                <SelectItem value="replace">Replace</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-48">
                            <Input
                              placeholder="Notes"
                              value={item.notes}
                              onChange={(e) => updateServiceCheckItem(item.id, 'notes', e.target.value)}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeServiceCheckItem(item.id)}
                            disabled={newServiceCheck.items.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1" onClick={handleCreateServiceCheck}>
                      Complete Service Check
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setIsAddServiceCheckDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <div className="flex space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search service checks by customer, vehicle, or technician..."
                className="pl-10"
                value={serviceCheckSearchTerm}
                onChange={(e) => setServiceCheckSearchTerm(e.target.value)}
              />
            </div>
            <Select value={serviceCheckFilter} onValueChange={(value) => setServiceCheckFilter(value as 'all' | 'recent' | 'needs-attention')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter service checks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Checks</SelectItem>
                <SelectItem value="recent">Recent (7 days)</SelectItem>
                <SelectItem value="needs-attention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredServiceChecks.length > 0 ? (
              filteredServiceChecks.map((serviceCheck) => {
                const customer = customers.find(c => c.id === serviceCheck.customerId);
                const vehicle = vehicles.find(v => v.id === serviceCheck.vehicleId);
                const summary = getServiceCheckSummary(serviceCheck);
                
                return (
                  <Card key={serviceCheck.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <CheckSquare className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Service Check #{serviceCheck.id.padStart(4, '0')}</h3>
                            <p className="text-sm text-muted-foreground">
                              {customer?.name} - {vehicle?.year} {vehicle?.make} {vehicle?.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Technician: {serviceCheck.technician} | Date: {format(serviceCheck.createdAt, "MMM dd, yyyy")}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                              <span className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                                {summary.good} Good
                              </span>
                              {summary.needsAttention > 0 && (
                                <span className="flex items-center">
                                  <AlertCircle className="h-3 w-3 text-orange-600 mr-1" />
                                  {summary.needsAttention} Attention
                                </span>
                              )}
                              {summary.replace > 0 && (
                                <span className="flex items-center">
                                  <X className="h-3 w-3 text-red-600 mr-1" />
                                  {summary.replace} Replace
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {(summary.needsAttention > 0 || summary.replace > 0) && (
                            <Badge variant="destructive">Needs Attention</Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setViewingServiceCheck(serviceCheck);
                              setIsServiceCheckViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingServiceCheck({ ...serviceCheck });
                              setIsServiceCheckEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteServiceCheck(serviceCheck.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {serviceCheckSearchTerm || serviceCheckFilter !== 'all' ? 'No service checks found' : 'No Service Checks Yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {serviceCheckSearchTerm || serviceCheckFilter !== 'all'
                      ? 'Try adjusting your search terms or filters.'
                      : 'Create your first service check to start digital vehicle inspections.'
                    }
                  </p>
                  {!serviceCheckSearchTerm && serviceCheckFilter === 'all' && (
                    <Button onClick={() => setIsAddServiceCheckDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Service Check
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* View Service Check Dialog */}
        <Dialog open={isServiceCheckViewDialogOpen} onOpenChange={setIsServiceCheckViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Service Check Details</DialogTitle>
              <DialogDescription>Complete service check information and inspection results</DialogDescription>
            </DialogHeader>
            {viewingServiceCheck && (
              <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                <div className="space-y-6">
                  {/* Service Check Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <CheckSquare className="h-4 w-4 text-white" />
                          </div>
                          <span>Service Check #{viewingServiceCheck.id.padStart(4, '0')}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Customer: {customers.find(c => c.id === viewingServiceCheck.customerId)?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>Vehicle: {(() => {
                            const vehicle = vehicles.find(v => v.id === viewingServiceCheck.vehicleId);
                            return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
                          })()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Technician: {viewingServiceCheck.technician}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Date: {format(viewingServiceCheck.createdAt, "MMMM dd, yyyy")}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Inspection Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const summary = getServiceCheckSummary(viewingServiceCheck);
                          return (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{summary.good}</p>
                                <p className="text-sm text-muted-foreground">Good</p>
                              </div>
                              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                <p className="text-2xl font-bold text-orange-600">{summary.needsAttention}</p>
                                <p className="text-sm text-muted-foreground">Needs Attention</p>
                              </div>
                              <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                                <p className="text-2xl font-bold text-red-600">{summary.replace}</p>
                                <p className="text-sm text-muted-foreground">Replace</p>
                              </div>
                              <div className="text-center p-3 bg-accent/20 rounded-lg">
                                <p className="text-2xl font-bold text-primary">{summary.total}</p>
                                <p className="text-sm text-muted-foreground">Total Items</p>
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Inspection Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Inspection Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {viewingServiceCheck.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              {item.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                item.status === 'good' ? 'default' : 
                                item.status === 'needs-attention' ? 'secondary' : 'destructive'
                              }>
                                {item.status === 'good' ? 'Good' : 
                                 item.status === 'needs-attention' ? 'Needs Attention' : 'Replace'}
                              </Badge>
                              {item.status !== 'good' && (
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditingServiceCheck({ ...viewingServiceCheck });
                        setIsServiceCheckViewDialogOpen(false);
                        setIsServiceCheckEditDialogOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Service Check
                    </Button>
                    <Button variant="outline" onClick={() => setIsServiceCheckViewDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Service Check Dialog */}
        <Dialog open={isServiceCheckEditDialogOpen} onOpenChange={setIsServiceCheckEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Service Check</DialogTitle>
              <DialogDescription>Update service check information and inspection items</DialogDescription>
            </DialogHeader>
            {editingServiceCheck && (
              <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-sc-customer">Customer *</Label>
                      <Select 
                        value={editingServiceCheck.customerId} 
                        onValueChange={(value) => setEditingServiceCheck(prev => prev ? { ...prev, customerId: value } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-sc-vehicle">Vehicle *</Label>
                      <Select 
                        value={editingServiceCheck.vehicleId} 
                        onValueChange={(value) => setEditingServiceCheck(prev => prev ? { ...prev, vehicleId: value } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.filter(v => v.customerId === editingServiceCheck.customerId).map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-sc-technician">Technician *</Label>
                    <Input 
                      id="edit-sc-technician" 
                      value={editingServiceCheck.technician}
                      onChange={(e) => setEditingServiceCheck(prev => prev ? { ...prev, technician: e.target.value } : null)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-base font-semibold">Inspection Items</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addEditingServiceCheckItem}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {editingServiceCheck.items.map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <div className="flex-1">
                            <Input
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => updateEditingServiceCheckItem(item.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="w-40">
                            <Select 
                              value={item.status} 
                              onValueChange={(value) => updateEditingServiceCheckItem(item.id, 'status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="needs-attention">Needs Attention</SelectItem>
                                <SelectItem value="replace">Replace</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-48">
                            <Input
                              placeholder="Notes"
                              value={item.notes}
                              onChange={(e) => updateEditingServiceCheckItem(item.id, 'notes', e.target.value)}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeEditingServiceCheckItem(item.id)}
                            disabled={editingServiceCheck.items.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1" onClick={handleEditServiceCheck}>Save Changes</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setIsServiceCheckEditDialogOpen(false)}>Cancel</Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  };

  const EstimatesContent = () => {
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [estimateItems, setEstimateItems] = useState<InvoiceItem[]>([]);
    const [estimateNotes, setEstimateNotes] = useState('');
    const [estimateValidUntil, setEstimateValidUntil] = useState<Date>();
    const [isCreating, setIsCreating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });

    const handleCreateAndAddProduct = () => {
      const price = parseFloat(newProduct.price);
      if (!newProduct.name || !newProduct.price || isNaN(price) || price <= 0) {
        alert('Please provide a valid product name and price.');
        return;
      }
      const createdProduct: Product = {
        id: `prod-${Date.now()}`,
        name: newProduct.name,
        description: newProduct.description,
        price: price,
        category: 'Service',
        stock: 999,
      };
      setProducts(prev => [...prev, createdProduct]);
      addEstimateItem(createdProduct);
      setNewProduct({ name: '', description: '', price: '' });
    };

    const addEstimateItem = (product: Product, quantity: number = 1) => {
      const existingItem = estimateItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        setEstimateItems(prev => prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
            : item
        ));
      } else {
        const newItem: InvoiceItem = {
          id: `item-${Date.now()}`,
          productId: product.id,
          name: product.name,
          description: product.description,
          quantity,
          price: product.price,
          total: product.price * quantity
        };
        setEstimateItems(prev => [...prev, newItem]);
      }
    };

    const removeEstimateItem = (itemId: string) => {
      setEstimateItems(prev => prev.filter(item => item.id !== itemId));
    };

    const updateItemQuantity = (itemId: string, quantity: number) => {
      setEstimateItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity, total: quantity * item.price }
          : item
      ));
    };

    const updateItemPrice = (itemId: string, price: number) => {
      setEstimateItems(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, price, total: item.quantity * price }
          : item
      ));
    };

    const resetEstimateForm = () => {
      setSelectedCustomerId('');
      setSelectedVehicleId('');
      setEstimateItems([]);
      setEstimateNotes('');
      setEstimateValidUntil(undefined);
    };

    const handleCreateEstimate = async (sendImmediately: boolean = false) => {
      if (!selectedCustomerId || !selectedVehicleId || estimateItems.length === 0) {
        alert('Please fill in all required fields and add at least one item.');
        return;
      }

      setIsCreating(true);
      try {
        const newEstimate = createEstimate({
          customerId: selectedCustomerId,
          vehicleId: selectedVehicleId,
          items: estimateItems,
          notes: estimateNotes,
          validUntil: estimateValidUntil
        });

        if (sendImmediately) {
          setIsSending(true);
          await sendEstimateEmail(newEstimate);
        }

        resetEstimateForm();
        alert(`Estimate ${newEstimate.estimateNumber} ${sendImmediately ? 'created and sent' : 'created'} successfully!`);
      } catch (error) {
        console.error('Error creating estimate:', error);
        alert('Error creating estimate. Please try again.');
      } finally {
        setIsCreating(false);
        setIsSending(false);
      }
    };

    const handleConvertToInvoice = async (estimate: Estimate) => {
      setIsConverting(true);
      try {
        const newInvoice = convertEstimateToInvoice(estimate);
        alert(`Estimate ${estimate.estimateNumber} converted to invoice ${newInvoice.invoiceNumber} successfully!`);
      } catch (error) {
        console.error('Error converting estimate:', error);
        alert('Error converting estimate to invoice. Please try again.');
      } finally {
        setIsConverting(false);
      }
    };

    const handleSendEstimateEmail = async (estimate: Estimate) => {
      setIsSending(true);
      try {
        await sendEstimateEmail(estimate);
        alert('Estimate sent successfully!');
      } catch (error) {
        console.error('Error sending estimate:', error);
        alert('Error sending estimate. Please try again.');
      } finally {
        setIsSending(false);
      }
    };

    const filteredVehicles = vehicles.filter(vehicle => vehicle.customerId === selectedCustomerId);
    const totals = calculateInvoiceTotals(estimateItems);

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Estimates</h2>
            <p className="text-muted-foreground">Create and manage service estimates</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Estimate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Estimate</DialogTitle>
                <DialogDescription>Generate an estimate for potential services and parts</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Customer and Vehicle Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="est-customer">Customer *</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="est-vehicle">Vehicle *</Label>
                    <Select 
                      value={selectedVehicleId} 
                      onValueChange={setSelectedVehicleId}
                      disabled={!selectedCustomerId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Estimate Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-semibold">Estimate Items *</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Add Estimate Item</DialogTitle>
                          <DialogDescription>Select an existing product or create a new one.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Existing Products</h4>
                            <ScrollArea className="h-96">
                              <div className="space-y-2 pr-4">
                                {products.map((product) => (
                                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                                    <div className="flex-1">
                                      <h5 className="font-medium">{product.name}</h5>
                                      <p className="text-sm text-muted-foreground">{product.description}</p>
                                      <p className="text-sm font-semibold text-primary">{formatCurrency(product.price)}</p>
                                    </div>
                                    <Button size="sm" onClick={() => addEstimateItem(product)}>Add</Button>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Create New Product</h4>
                            <div className="space-y-4 p-4 border rounded-lg">
                              <div>
                                <Label htmlFor="new-prod-name-est">Product Name *</Label>
                                <Input
                                  id="new-prod-name-est"
                                  value={newProduct.name}
                                  onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                  placeholder="e.g., Full Synthetic Oil"
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-prod-desc-est">Description</Label>
                                <Textarea
                                  id="new-prod-desc-est"
                                  value={newProduct.description}
                                  onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                  placeholder="e.g., 5 quarts of premium oil"
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-prod-price-est">Price *</Label>
                                <Input
                                  id="new-prod-price-est"
                                  type="number"
                                  value={newProduct.price}
                                  onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))}
                                  placeholder="e.g., 49.99"
                                />
                              </div>
                              <Button onClick={handleCreateAndAddProduct} className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Create & Add to Estimate
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {estimateItems.length > 0 ? (
                    <div className="space-y-3">
                      {estimateItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`qty-est-${item.id}`} className="text-sm">Qty</Label>
                              <Input
                                id={`qty-est-${item.id}`}
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-16"
                                min="1"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`price-est-${item.id}`} className="text-sm">Price (£)</Label>
                              <Input
                                id={`price-est-${item.id}`}
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-24"
                                step="0.01"
                              />
                            </div>
                            <div className="text-right w-24">
                              <p className="font-semibold">{formatCurrency(item.total)}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeEstimateItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No items added yet. Click "Add Item" to get started.
                    </div>
                  )}
                </div>

                {/* Estimate Totals */}
                {estimateItems.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 max-w-sm ml-auto">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8.5%):</span>
                        <span>{formatCurrency(totals.tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="est-notes">Notes & Recommendations</Label>
                    <Textarea 
                      id="est-notes" 
                      placeholder="Additional notes, recommendations, or terms..."
                      value={estimateNotes}
                      onChange={(e) => setEstimateNotes(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="est-valid">Valid Until</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !estimateValidUntil && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {estimateValidUntil ? format(estimateValidUntil, "PPP") : "Pick valid until date (default: 30 days)"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={estimateValidUntil}
                          onSelect={setEstimateValidUntil}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleCreateEstimate(true)}
                    disabled={isCreating || isSending}
                  >
                    {isSending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Create & Send Estimate
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleCreateEstimate(false)}
                    disabled={isCreating || isSending}
                  >
                    {isCreating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      'Save as Draft'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Estimate List */}
        <motion.div variants={fadeInUp}>
          <div className="flex space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search estimates..."
                className="pl-10"
                value={estimateSearchTerm}
                onChange={(e) => setEstimateSearchTerm(e.target.value)}
              />
            </div>
            <Select value={estimateFilter} onValueChange={(value) => setEstimateFilter(value as 'all' | 'draft' | 'sent' | 'approved' | 'declined' | 'expired')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {(() => {
              const filteredEstimates = estimates.filter(estimate => {
                const customer = customers.find(c => c.id === estimate.customerId);
                const vehicle = vehicles.find(v => v.id === estimate.vehicleId);
                
                const matchesSearch = estimateSearchTerm === '' || 
                  estimate.estimateNumber.toLowerCase().includes(estimateSearchTerm.toLowerCase()) ||
                  customer?.name.toLowerCase().includes(estimateSearchTerm.toLowerCase()) ||
                  vehicle?.make.toLowerCase().includes(estimateSearchTerm.toLowerCase()) ||
                  vehicle?.model.toLowerCase().includes(estimateSearchTerm.toLowerCase());

                if (estimateFilter === 'all') {
                  return matchesSearch;
                }
                
                return matchesSearch && estimate.status === estimateFilter;
              });

              return filteredEstimates.length > 0 ? (
                filteredEstimates.map((estimate) => {
                  const customer = customers.find(c => c.id === estimate.customerId);
                  const vehicle = vehicles.find(v => v.id === estimate.vehicleId);
                  
                  return (
                    <Card key={estimate.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                              <Calculator className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{estimate.estimateNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {customer?.name} - {vehicle?.year} {vehicle?.make} {vehicle?.model}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                <span>Created: {format(estimate.createdAt, "MMM dd, yyyy")}</span>
                                <span>Valid Until: {format(estimate.validUntil, "MMM dd, yyyy")}</span>
                              </div>
                              {estimate.convertedToInvoice && (
                                <p className="text-sm text-green-600 mt-1">
                                  ✓ Converted to Invoice
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{formatCurrency(estimate.total)}</p>
                              <Badge variant={
                                estimate.status === 'approved' ? 'default' : 
                                estimate.status === 'declined' ? 'destructive' : 
                                estimate.status === 'expired' ? 'destructive' :
                                estimate.status === 'sent' ? 'secondary' : 'outline'
                              }>
                                {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSendEstimateEmail(estimate)}
                                disabled={isSending || estimate.convertedToInvoice}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              {estimate.status === 'approved' && !estimate.convertedToInvoice && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleConvertToInvoice(estimate)}
                                  disabled={isConverting}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setViewingEstimate(estimate);
                                  setIsEstimateViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingEstimate({ ...estimate });
                                  setIsEstimateEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteEstimate(estimate.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {estimateSearchTerm || estimateFilter !== 'all' ? 'No estimates found' : 'No Estimates Yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {estimateSearchTerm || estimateFilter !== 'all'
                        ? 'Try adjusting your search terms or filters.'
                        : 'Create your first estimate to provide quotes to potential customers.'
                      }
                    </p>
                    {!estimateSearchTerm && estimateFilter === 'all' && (
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Estimate
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </motion.div>

        {/* View Estimate Dialog */}
        <Dialog open={isEstimateViewDialogOpen} onOpenChange={setIsEstimateViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Estimate Details</DialogTitle>
              <DialogDescription>Complete estimate information</DialogDescription>
            </DialogHeader>
            {viewingEstimate && (
              <div className="space-y-6">
                {/* Estimate Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <Calculator className="h-4 w-4 text-white" />
                        </div>
                        <span>{viewingEstimate.estimateNumber}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Customer: {customers.find(c => c.id === viewingEstimate.customerId)?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>Vehicle: {(() => {
                          const vehicle = vehicles.find(v => v.id === viewingEstimate.vehicleId);
                          return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
                        })()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Created: {format(viewingEstimate.createdAt, "MMMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Valid Until: {format(viewingEstimate.validUntil, "MMMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={
                          viewingEstimate.status === 'approved' ? 'default' : 
                          viewingEstimate.status === 'declined' ? 'destructive' : 
                          viewingEstimate.status === 'expired' ? 'destructive' :
                          viewingEstimate.status === 'sent' ? 'secondary' : 'outline'
                        }>
                          {viewingEstimate.status.charAt(0).toUpperCase() + viewingEstimate.status.slice(1)}
                        </Badge>
                      </div>
                      {viewingEstimate.convertedToInvoice && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Converted to Invoice</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Estimate Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(viewingEstimate.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax ({viewingEstimate.taxRate}%):</span>
                          <span>{formatCurrency(viewingEstimate.tax)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-primary">{formatCurrency(viewingEstimate.total)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Estimate Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estimate Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {viewingEstimate.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {formatCurrency(item.price)}
                            </p>
                            <p className="font-semibold">{formatCurrency(item.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {viewingEstimate.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{viewingEstimate.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingEstimate({ ...viewingEstimate });
                      setIsEstimateViewDialogOpen(false);
                      setIsEstimateEditDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Estimate
                  </Button>
                  <Button variant="outline" onClick={() => setIsEstimateViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Estimate Dialog */}
        <Dialog open={isEstimateEditDialogOpen} onOpenChange={setIsEstimateEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Estimate</DialogTitle>
              <DialogDescription>Update estimate information</DialogDescription>
            </DialogHeader>
            {editingEstimate && (
              <div className="space-y-6">
                {/* Customer and Vehicle Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-est-customer">Customer *</Label>
                    <Select 
                      value={editingEstimate.customerId} 
                      onValueChange={(value) => setEditingEstimate(prev => prev ? { ...prev, customerId: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-est-vehicle">Vehicle *</Label>
                    <Select 
                      value={editingEstimate.vehicleId} 
                      onValueChange={(value) => setEditingEstimate(prev => prev ? { ...prev, vehicleId: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.filter(v => v.customerId === editingEstimate.customerId).map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Estimate Items */}
                <div>
                  <Label className="text-base font-semibold">Estimate Items *</Label>
                  <div className="space-y-3 mt-2">
                    {editingEstimate.items.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">Qty:</Label>
                            <Input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                setEditingEstimate(prev => prev ? {
                                  ...prev,
                                  items: prev.items.map((i, idx) => 
                                    idx === index 
                                      ? { ...i, quantity: newQuantity, total: newQuantity * i.price }
                                      : i
                                  )
                                } : null);
                              }}
                              className="w-16" 
                              min="1"
                            />
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                            <p className="font-semibold">{formatCurrency(item.total)}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingEstimate(prev => prev ? {
                                ...prev,
                                items: prev.items.filter((_, idx) => idx !== index)
                              } : null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estimate Totals */}
                {editingEstimate.items.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 max-w-sm ml-auto">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(editingEstimate.items.reduce((sum, item) => sum + item.total, 0))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({editingEstimate.taxRate}%):</span>
                        <span>{formatCurrency(editingEstimate.items.reduce((sum, item) => sum + item.total, 0) * (editingEstimate.taxRate / 100))}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(editingEstimate.items.reduce((sum, item) => sum + item.total, 0) * (1 + editingEstimate.taxRate / 100))}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-est-status">Status</Label>
                    <Select 
                      value={editingEstimate.status} 
                      onValueChange={(value: any) => setEditingEstimate(prev => prev ? { ...prev, status: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-est-notes">Notes & Recommendations</Label>
                    <Textarea 
                      id="edit-est-notes" 
                      value={editingEstimate.notes}
                      onChange={(e) => setEditingEstimate(prev => prev ? { ...prev, notes: e.target.value } : null)}
                      placeholder="Additional notes, recommendations, or terms..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-est-valid">Valid Until</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(editingEstimate.validUntil, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={editingEstimate.validUntil}
                          onSelect={(date) => setEditingEstimate(prev => prev && date ? { ...prev, validUntil: date } : prev)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={handleEditEstimate}>Save Changes</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsEstimateEditDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  };

  const TemplatesContent = () => {
    const [activeTemplateTab, setActiveTemplateTab] = useState('invoice');
    const [templates, setTemplates] = useState({
      invoice: {
        id: 'invoice-template',
        name: 'Invoice Template',
        header: {
          businessName: 'AutoPro Service Center',
          businessAddress: '123 Service St, Auto City, AC 12345',
          businessPhone: '+1 (555) 123-4567',
          businessEmail: 'info@autopro.com',
          logo: 'https://assets.co.dev/f04d1c9e-1c8e-4e1f-a9f2-8889d85dd7b5/file-8b0eaf8.png',
          logoWidth: 40,
          logoHeight: 40,
          showLogo: true
        },
        layout: {
          primaryColor: '#2563eb',
          accentColor: '#f3f4f6',
          fontFamily: 'Inter',
          fontSize: 'medium',
          showBorder: true,
          borderColor: '#e5e7eb'
        },
        sections: {
          showCustomerInfo: true,
          showVehicleInfo: true,
          showItemsTable: true,
          showTotals: true,
          showNotes: true,
          showTerms: true,
          showBankDetails: true,
          showRecommendations: true
        },
        footer: {
          thankYouMessage: 'Thank you for your business!',
          paymentTerms: 'Payment due within 30 days',
          bankDetails: {
            bankName: 'First National Bank',
            accountNumber: '****1234',
            routingNumber: '123456789'
          },
          recommendations: 'We recommend regular maintenance every 6 months for optimal vehicle performance.'
        }
      },
      estimate: {
        id: 'estimate-template',
        name: 'Estimate Template',
        header: {
          businessName: 'AutoPro Service Center',
          businessAddress: '123 Service St, Auto City, AC 12345',
          businessPhone: '+1 (555) 123-4567',
          businessEmail: 'info@autopro.com',
          logo: 'https://assets.co.dev/f04d1c9e-1c8e-4e1f-a9f2-8889d85dd7b5/file-8b0eaf8.png',
          logoWidth: 40,
          logoHeight: 40,
          showLogo: true
        },
        layout: {
          primaryColor: '#059669',
          accentColor: '#f0fdf4',
          fontFamily: 'Inter',
          fontSize: 'medium',
          showBorder: true,
          borderColor: '#d1fae5'
        },
        sections: {
          showCustomerInfo: true,
          showVehicleInfo: true,
          showItemsTable: true,
          showTotals: true,
          showNotes: true,
          showValidUntil: true,
          showTerms: true,
          showRecommendations: true
        },
        footer: {
          validityMessage: 'This estimate is valid for 30 days from the date of issue.',
          terms: 'Prices subject to change based on actual parts and labor required.',
          recommendations: 'We recommend addressing high-priority items first for safety and performance.'
        }
      },
      serviceCheck: {
        id: 'service-check-template',
        name: 'Service Check Template',
        header: {
          businessName: 'AutoPro Service Center',
          businessAddress: '123 Service St, Auto City, AC 12345',
          businessPhone: '+1 (555) 123-4567',
          businessEmail: 'info@autopro.com',
          logo: 'https://assets.co.dev/f04d1c9e-1c8e-4e1f-a9f2-8889d85dd7b5/file-8b0eaf8.png',
          logoWidth: 40,
          logoHeight: 40,
          showLogo: true
        },
        layout: {
          primaryColor: '#7c3aed',
          accentColor: '#faf5ff',
          fontFamily: 'Inter',
          fontSize: 'medium',
          showBorder: true,
          borderColor: '#e9d5ff'
        },
        sections: {
          showCustomerInfo: true,
          showVehicleInfo: true,
          showTechnicianInfo: true,
          showInspectionItems: true,
          showSummary: true,
          showPhotos: true,
          showRecommendations: true,
          showSignature: true
        },
        footer: {
          disclaimer: 'This inspection reflects the condition of the vehicle at the time of service.',
          recommendations: 'Please address items marked as "Needs Attention" or "Replace" promptly.',
          nextServiceReminder: 'Schedule your next service in 6 months or 5,000 miles.'
        }
      }
    });

    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const handleSaveTemplate = () => {
      if (!editingTemplate) return;
      
      setTemplates(prev => ({
        ...prev,
        [activeTemplateTab]: editingTemplate
      }));
      setEditingTemplate(null);
      setIsEditDialogOpen(false);
      alert('Template saved successfully!');
    };

    const handleResetTemplate = () => {
      if (confirm('Are you sure you want to reset this template to default settings? This action cannot be undone.')) {
        // Reset to default template based on type
        const defaultTemplate = {
          invoice: templates.invoice,
          estimate: templates.estimate,
          serviceCheck: templates.serviceCheck
        }[activeTemplateTab];
        
        setTemplates(prev => ({
          ...prev,
          [activeTemplateTab]: defaultTemplate
        }));
        alert('Template reset to default settings!');
      }
    };

    const currentTemplate = templates[activeTemplateTab as keyof typeof templates];

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp}>
          <h2 className="text-3xl font-bold text-primary mb-2">Templates</h2>
          <p className="text-muted-foreground">Customize your invoice, estimate, and service check templates</p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Tabs value={activeTemplateTab} onValueChange={setActiveTemplateTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="invoice" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Invoice Template</span>
              </TabsTrigger>
              <TabsTrigger value="estimate" className="flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Estimate Template</span>
              </TabsTrigger>
              <TabsTrigger value="serviceCheck" className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4" />
                <span>Service Check Template</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invoice" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Invoice Template</CardTitle>
                      <CardDescription>Customize how your invoices look and what information they include</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {previewMode ? 'Edit' : 'Preview'}
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditingTemplate({ ...currentTemplate });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {previewMode ? (
                    <div className="border rounded-lg p-6 bg-white text-black" style={{ color: currentTemplate.layout.primaryColor }}>
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-4">
                          <div className="flex items-center gap-4">
                            {currentTemplate.header.showLogo && (
                              <Logo 
                                src={currentTemplate.header.logo} 
                                showText={false} 
                                width={currentTemplate.header.logoWidth}
                                height={currentTemplate.header.logoHeight}
                              />
                            )}
                            <div>
                              <h1 className="text-2xl font-bold">{currentTemplate.header.businessName}</h1>
                              <p className="text-sm">{currentTemplate.header.businessAddress}</p>
                              <p className="text-sm">{currentTemplate.header.businessPhone}</p>
                              <p className="text-sm">{currentTemplate.header.businessEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <h2 className="text-xl font-bold">INVOICE</h2>
                            <p className="text-sm">INV-202407-0001</p>
                            <p className="text-sm">Date: July 8, 2024</p>
                          </div>
                        </div>

                        {/* Customer & Vehicle Info */}
                        {(currentTemplate.sections.showCustomerInfo || currentTemplate.sections.showVehicleInfo) && (
                          <div className="grid grid-cols-2 gap-6">
                            {currentTemplate.sections.showCustomerInfo && (
                              <div>
                                <h3 className="font-semibold mb-2">Bill To:</h3>
                                <p>John Smith</p>
                                <p>john@example.com</p>
                                <p>+1 (555) 123-4567</p>
                                <p>123 Main St, City, State 12345</p>
                              </div>
                            )}
                            {currentTemplate.sections.showVehicleInfo && (
                              <div>
                                <h3 className="font-semibold mb-2">Vehicle:</h3>
                                <p>2020 Toyota Camry</p>
                                <p>VIN: 1HGBH41JXMN109186</p>
                                <p>License: ABC123</p>
                                <p>Color: Silver</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Items Table */}
                        {currentTemplate.sections.showItemsTable && (
                          <div>
                            <table className="w-full border-collapse border">
                              <thead>
                                <tr style={{ backgroundColor: currentTemplate.layout.accentColor }}>
                                  <th className="border p-2 text-left">Description</th>
                                  <th className="border p-2 text-center">Qty</th>
                                  <th className="border p-2 text-right">Price</th>
                                  <th className="border p-2 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border p-2">Oil Change Service</td>
                                  <td className="border p-2 text-center">1</td>
                                  <td className="border p-2 text-right">$49.99</td>
                                  <td className="border p-2 text-right">$49.99</td>
                                </tr>
                                <tr>
                                  <td className="border p-2">Air Filter</td>
                                  <td className="border p-2 text-center">1</td>
                                  <td className="border p-2 text-right">$24.99</td>
                                  <td className="border p-2 text-right">$24.99</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Totals */}
                        {currentTemplate.sections.showTotals && (
                          <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(totals.subtotal)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax (8.5%):</span>
                                <span>{formatCurrency(totals.tax)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(totals.total)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {currentTemplate.sections.showNotes && (
                          <div>
                            <h3 className="font-semibold mb-2">Notes:</h3>
                            <p className="text-sm">Thank you for your business!</p>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="border-t pt-4 space-y-4">
                          {currentTemplate.sections.showBankDetails && (
                            <div>
                              <h3 className="font-semibold mb-2">Payment Information:</h3>
                              <p className="text-sm">Bank: {currentTemplate.footer.bankDetails.bankName}</p>
                              <p className="text-sm">Account: {currentTemplate.footer.bankDetails.accountNumber}</p>
                              <p className="text-sm">Routing: {currentTemplate.footer.bankDetails.routingNumber}</p>
                            </div>
                          )}
                          {currentTemplate.sections.showRecommendations && (
                            <div>
                              <h3 className="font-semibold mb-2">Recommendations:</h3>
                              <p className="text-sm">{currentTemplate.footer.recommendations}</p>
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-sm font-semibold">{currentTemplate.footer.thankYouMessage}</p>
                            <p className="text-xs">{currentTemplate.footer.paymentTerms}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Header Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Business:</strong> {currentTemplate.header.businessName}</p>
                            <p><strong>Address:</strong> {currentTemplate.header.businessAddress}</p>
                            <p><strong>Phone:</strong> {currentTemplate.header.businessPhone}</p>
                            <p><strong>Email:</strong> {currentTemplate.header.businessEmail}</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Layout & Design</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Primary Color:</strong> <span className="inline-block w-4 h-4 rounded ml-2" style={{ backgroundColor: currentTemplate.layout.primaryColor }}></span></p>
                            <p><strong>Font:</strong> {currentTemplate.layout.fontFamily}</p>
                            <p><strong>Size:</strong> {currentTemplate.layout.fontSize}</p>
                            <p><strong>Border:</strong> {currentTemplate.layout.showBorder ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Sections</h4>
                          <div className="space-y-1 text-sm">
                            {Object.entries(currentTemplate.sections).map(([key, value]) => (
                              <p key={key}>
                                <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value ? 'Yes' : 'No'}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estimate" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Estimate Template</CardTitle>
                      <CardDescription>Customize how your estimates look and what information they include</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {previewMode ? 'Edit' : 'Preview'}
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditingTemplate({ ...currentTemplate });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {previewMode ? (
                    <div className="border rounded-lg p-6 bg-white text-black" style={{ color: currentTemplate.layout.primaryColor }}>
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-4">
                          <div className="flex items-center gap-4">
                            {currentTemplate.header.showLogo && (
                              <Logo 
                                src={currentTemplate.header.logo} 
                                showText={false} 
                                width={currentTemplate.header.logoWidth}
                                height={currentTemplate.header.logoHeight}
                              />
                            )}
                            <div>
                              <h1 className="text-2xl font-bold">{currentTemplate.header.businessName}</h1>
                              <p className="text-sm">{currentTemplate.header.businessAddress}</p>
                              <p className="text-sm">{currentTemplate.header.businessPhone}</p>
                              <p className="text-sm">{currentTemplate.header.businessEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <h2 className="text-xl font-bold">ESTIMATE</h2>
                            <p className="text-sm">EST-202407-0001</p>
                            <p className="text-sm">Date: July 8, 2024</p>
                            <p className="text-sm">Valid Until: August 7, 2024</p>
                          </div>
                        </div>

                        {/* Customer & Vehicle Info */}
                        {(currentTemplate.sections.showCustomerInfo || currentTemplate.sections.showVehicleInfo) && (
                          <div className="grid grid-cols-2 gap-6">
                            {currentTemplate.sections.showCustomerInfo && (
                              <div>
                                <h3 className="font-semibold mb-2">Estimate For:</h3>
                                <p>John Smith</p>
                                <p>john@example.com</p>
                                <p>+1 (555) 123-4567</p>
                                <p>123 Main St, City, State 12345</p>
                              </div>
                            )}
                            {currentTemplate.sections.showVehicleInfo && (
                              <div>
                                <h3 className="font-semibold mb-2">Vehicle:</h3>
                                <p>2020 Toyota Camry</p>
                                <p>VIN: 1HGBH41JXMN109186</p>
                                <p>License: ABC123</p>
                                <p>Color: Silver</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Items Table */}
                        {currentTemplate.sections.showItemsTable && (
                          <div>
                            <table className="w-full border-collapse border">
                              <thead>
                                <tr style={{ backgroundColor: currentTemplate.layout.accentColor }}>
                                  <th className="border p-2 text-left">Description</th>
                                  <th className="border p-2 text-center">Qty</th>
                                  <th className="border p-2 text-right">Price</th>
                                  <th className="border p-2 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border p-2">Brake Service</td>
                                  <td className="border p-2 text-center">1</td>
                                  <td className="border p-2 text-right">$129.99</td>
                                  <td className="border p-2 text-right">$129.99</td>
                                </tr>
                                <tr>
                                  <td className="border p-2">Brake Pads</td>
                                  <td className="border p-2 text-center">1</td>
                                  <td className="border p-2 text-right">$89.99</td>
                                  <td className="border p-2 text-right">$89.99</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Totals */}
                        {currentTemplate.sections.showTotals && (
                          <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>$219.98</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax (8.5%):</span>
                                <span>$18.70</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total:</span>
                                <span>$238.68</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="border-t pt-4 space-y-4">
                          {currentTemplate.sections.showRecommendations && (
                            <div>
                              <h3 className="font-semibold mb-2">Recommendations:</h3>
                              <p className="text-sm">{currentTemplate.footer.recommendations}</p>
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-sm font-semibold">{currentTemplate.footer.validityMessage}</p>
                            <p className="text-xs">{currentTemplate.footer.terms}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Header Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Business:</strong> {currentTemplate.header.businessName}</p>
                            <p><strong>Address:</strong> {currentTemplate.header.businessAddress}</p>
                            <p><strong>Phone:</strong> {currentTemplate.header.businessPhone}</p>
                            <p><strong>Email:</strong> {currentTemplate.header.businessEmail}</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Layout & Design</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Primary Color:</strong> <span className="inline-block w-4 h-4 rounded ml-2" style={{ backgroundColor: currentTemplate.layout.primaryColor }}></span></p>
                            <p><strong>Font:</strong> {currentTemplate.layout.fontFamily}</p>
                            <p><strong>Size:</strong> {currentTemplate.layout.fontSize}</p>
                            <p><strong>Border:</strong> {currentTemplate.layout.showBorder ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Sections</h4>
                          <div className="space-y-1 text-sm">
                            {Object.entries(currentTemplate.sections).map(([key, value]) => (
                              <p key={key}>
                                <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value ? 'Yes' : 'No'}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="serviceCheck" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Service Check Template</CardTitle>
                      <CardDescription>Customize how your service check reports look and what information they include</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {previewMode ? 'Edit' : 'Preview'}
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditingTemplate({ ...currentTemplate });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {previewMode ? (
                    <div className="border rounded-lg p-6 bg-white text-black" style={{ color: currentTemplate.layout.primaryColor }}>
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-4">
                          <div className="flex items-center gap-4">
                            {currentTemplate.header.showLogo && (
                              <Logo 
                                src={currentTemplate.header.logo} 
                                showText={false} 
                                width={currentTemplate.header.logoWidth}
                                height={currentTemplate.header.logoHeight}
                              />
                            )}
                            <div>
                              <h1 className="text-2xl font-bold">{currentTemplate.header.businessName}</h1>
                              <p className="text-sm">{currentTemplate.header.businessAddress}</p>
                              <p className="text-sm">{currentTemplate.header.businessPhone}</p>
                              <p className="text-sm">{currentTemplate.header.businessEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <h2 className="text-xl font-bold">SERVICE CHECK</h2>
                            <p className="text-sm">SC-0001</p>
                            <p className="text-sm">Date: July 8, 2024</p>
                          </div>
                        </div>

                        {/* Customer, Vehicle & Technician Info */}
                        <div className="grid grid-cols-3 gap-6">
                          {currentTemplate.sections.showCustomerInfo && (
                            <div>
                              <h3 className="font-semibold mb-2">Customer:</h3>
                              <p>John Smith</p>
                              <p>john@example.com</p>
                              <p>+1 (555) 123-4567</p>
                            </div>
                          )}
                          {currentTemplate.sections.showVehicleInfo && (
                            <div>
                              <h3 className="font-semibold mb-2">Vehicle:</h3>
                              <p>2020 Toyota Camry</p>
                              <p>VIN: 1HGBH41JXMN109186</p>
                              <p>License: ABC123</p>
                            </div>
                          )}
                          {currentTemplate.sections.showTechnicianInfo && (
                            <div>
                              <h3 className="font-semibold mb-2">Technician:</h3>
                              <p>Mike Johnson</p>
                              <p>Certified Mechanic</p>
                              <p>License: #12345</p>
                            </div>
                          )}
                        </div>

                        {/* Inspection Items */}
                        {currentTemplate.sections.showInspectionItems && (
                          <div>
                            <h3 className="font-semibold mb-4">Inspection Results:</h3>
                            <table className="w-full border-collapse border">
                              <thead>
                                <tr style={{ backgroundColor: currentTemplate.layout.accentColor }}>
                                  <th className="border p-2 text-left">Item</th>
                                  <th className="border p-2 text-center">Status</th>
                                  <th className="border p-2 text-left">Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border p-2">Engine Oil Level</td>
                                  <td className="border p-2 text-center">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Good</span>
                                  </td>
                                  <td className="border p-2">Oil level is adequate</td>
                                </tr>
                                <tr>
                                  <td className="border p-2">Brake Fluid</td>
                                  <td className="border p-2 text-center">
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Attention</span>
                                  </td>
                                  <td className="border p-2">Fluid level slightly low</td>
                                </tr>
                                <tr>
                                  <td className="border p-2">Battery</td>
                                  <td className="border p-2 text-center">
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Replace</span>
                                  </td>
                                  <td className="border p-2">Battery showing signs of corrosion</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Summary */}
                        {currentTemplate.sections.showSummary && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <p className="text-2xl font-bold text-green-600">5</p>
                              <p className="text-sm">Good</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <p className="text-2xl font-bold text-orange-600">1</p>
                              <p className="text-sm">Needs Attention</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <p className="text-2xl font-bold text-red-600">1</p>
                              <p className="text-sm">Replace</p>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="border-t pt-4 space-y-4">
                          {currentTemplate.sections.showRecommendations && (
                            <div>
                              <h3 className="font-semibold mb-2">Recommendations:</h3>
                              <p className="text-sm">{currentTemplate.footer.recommendations}</p>
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-xs">{currentTemplate.footer.disclaimer}</p>
                            <p className="text-sm font-semibold mt-2">{currentTemplate.footer.nextServiceReminder}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Header Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Business:</strong> {currentTemplate.header.businessName}</p>
                            <p><strong>Address:</strong> {currentTemplate.header.businessAddress}</p>
                            <p><strong>Phone:</strong> {currentTemplate.header.businessPhone}</p>
                            <p><strong>Email:</strong> {currentTemplate.header.businessEmail}</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Layout & Design</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Primary Color:</strong> <span className="inline-block w-4 h-4 rounded ml-2" style={{ backgroundColor: currentTemplate.layout.primaryColor }}></span></p>
                            <p><strong>Font:</strong> {currentTemplate.layout.fontFamily}</p>
                            <p><strong>Size:</strong> {currentTemplate.layout.fontSize}</p>
                            <p><strong>Border:</strong> {currentTemplate.layout.showBorder ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Sections</h4>
                          <div className="space-y-1 text-sm">
                            {Object.entries(currentTemplate.sections).map(([key, value]) => (
                              <p key={key}>
                                <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value ? 'Yes' : 'No'}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Template Editor Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit {currentTemplate.name}</DialogTitle>
              <DialogDescription>Customize your template settings and appearance</DialogDescription>
            </DialogHeader>
            {editingTemplate && (
              <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                <div className="space-y-6">
                  <Tabs defaultValue="header" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="header">Header</TabsTrigger>
                      <TabsTrigger value="layout">Layout</TabsTrigger>
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                      <TabsTrigger value="footer">Footer</TabsTrigger>
                    </TabsList>

                    <TabsContent value="header" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="business-name">Business Name</Label>
                          <Input 
                            id="business-name" 
                            value={editingTemplate.header.businessName}
                            onChange={(e) => setEditingTemplate(prev => ({
                              ...prev,
                              header: { ...prev.header, businessName: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="business-phone">Phone</Label>
                          <Input 
                            id="business-phone" 
                            value={editingTemplate.header.businessPhone}
                            onChange={(e) => setEditingTemplate(prev => ({
                              ...prev,
                              header: { ...prev.header, businessPhone: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="business-address">Address</Label>
                        <Textarea 
                          id="business-address" 
                          value={editingTemplate.header.businessAddress}
                          onChange={(e) => setEditingTemplate(prev => ({
                            ...prev,
                            header: { ...prev.header, businessAddress: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="business-email">Email</Label>
                        <Input 
                          id="business-email" 
                          value={editingTemplate.header.businessEmail}
                          onChange={(e) => setEditingTemplate(prev => ({
                            ...prev,
                            header: { ...prev.header, businessEmail: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="logo-url">Logo URL</Label>
                        <Input 
                          id="logo-url" 
                          placeholder="https://..."
                          value={editingTemplate.header.logo}
                          onChange={(e) => setEditingTemplate(prev => ({
                            ...prev,
                            header: { ...prev.header, logo: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="logo-width">Logo Width (px)</Label>
                          <Input 
                            id="logo-width" 
                            type="number"
                            value={editingTemplate.header.logoWidth}
                            onChange={(e) => setEditingTemplate(prev => ({
                              ...prev,
                              header: { ...prev.header, logoWidth: parseInt(e.target.value) || 0 }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="logo-height">Logo Height (px)</Label>
                          <Input 
                            id="logo-height" 
                            type="number"
                            value={editingTemplate.header.logoHeight}
                            onChange={(e) => setEditingTemplate(prev => ({
                              ...prev,
                              header: { ...prev.header, logoHeight: parseInt(e.target.value) || 0 }
                            }))}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-logo"
                          checked={editingTemplate.header.showLogo}
                          onChange={(e) => setEditingTemplate(prev => ({
                            ...prev,
                            header: { ...prev.header, showLogo: e.target.checked }
                          }))}
                          className="rounded"
                        />
                        <Label htmlFor="show-logo" className="text-sm">
                          Show Logo
                        </Label>
                      </div>
                    </TabsContent>

                    <TabsContent value="layout" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primary-color">Primary Color</Label>
                          <Input 
                            id="primary-color" 
                            type="color"
                            value={editingTemplate.layout.primaryColor}
                            onChange={(e) => setEditingTemplate(prev => ({
                              ...prev,
                              layout: { ...prev.layout, primaryColor: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="accent-color">Accent Color</Label>
                          <Input 
                            id="accent-color" 
                            type="color"
                            value={editingTemplate.layout.accentColor}
                            onChange={(e) => setEditingTemplate(prev => ({
                              ...prev,
                              layout: { ...prev.layout, accentColor: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="font-family">Font Family</Label>
                          <Select 
                            value={editingTemplate.layout.fontFamily}
                            onValueChange={(value) => setEditingTemplate(prev => ({
                              ...prev,
                              layout: { ...prev.layout, fontFamily: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="font-size">Font Size</Label>
                          <Select 
                            value={editingTemplate.layout.fontSize}
                            onValueChange={(value) => setEditingTemplate(prev => ({
                              ...prev,
                              layout: { ...prev.layout, fontSize: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="sections" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(editingTemplate.sections).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={key}
                              checked={value as boolean}
                              onChange={(e) => setEditingTemplate(prev => ({
                                ...prev,
                                sections: { ...prev.sections, [key]: e.target.checked }
                              }))}
                              className="rounded"
                            />
                            <Label htmlFor={key} className="text-sm">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="footer" className="space-y-4">
                      {Object.entries(editingTemplate.footer).map(([key, value]) => {
                        if (typeof value === 'object') {
                          return (
                            <div key={key}>
                              <Label className="text-base font-semibold">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </Label>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                {Object.entries(value).map(([subKey, subValue]) => (
                                  <div key={subKey}>
                                    <Label htmlFor={`${key}-${subKey}`} className="text-sm">
                                      {subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </Label>
                                    <Input 
                                      id={`${key}-${subKey}`}
                                      value={subValue as string}
                                      onChange={(e) => setEditingTemplate(prev => ({
                                        ...prev,
                                        footer: { 
                                          ...prev.footer, 
                                          [key]: { ...prev.footer[key], [subKey]: e.target.value }
                                        }
                                      }))}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={key}>
                            <Label htmlFor={key}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Label>
                            <Textarea 
                              id={key}
                              value={value as string}
                              onChange={(e) => setEditingTemplate(prev => ({
                                ...prev,
                                footer: { ...prev.footer, [key]: e.target.value }
                              }))}
                            />
                          </div>
                        );
                      })}
                    </TabsContent>
                  </Tabs>

                  <div className="flex space-x-2">
                    <Button className="flex-1" onClick={handleSaveTemplate}>
                      Save Template
                    </Button>
                    <Button variant="outline" onClick={handleResetTemplate}>
                      Reset to Default
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  };

  const WebsiteContent = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-3xl font-bold text-primary mb-2">Website Frontend</h2>
        <p className="text-muted-foreground">Customer-facing website with booking functionality</p>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="homepage" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="servicing">Servicing</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Preview</CardTitle>
                <CardDescription>Your customer-facing homepage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 p-8 rounded-lg">
                  <div className="text-center space-y-6">
                    <img 
                      src="https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&h=400&fit=crop" 
                      alt="Auto Service" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div>
                      <h1 className="text-4xl font-bold text-primary mb-4">Professional Auto Service</h1>
                      <p className="text-xl text-muted-foreground mb-6">
                        Expert automotive care with state-of-the-art equipment and certified technicians
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button size="lg">Book Service</Button>
                        <Button variant="outline" size="lg">Learn More</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Page</CardTitle>
                <CardDescription>Showcase your automotive services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Oil Change', price: 49.99, image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=300&h=200&fit=crop' },
                    { name: 'Brake Service', price: 129.99, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop' },
                    { name: 'Tire Rotation', price: 39.99, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop' }
                  ].map((service, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <img src={service.image} alt={service.name} className="w-full h-32 object-cover rounded mb-4" />
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(service.price)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Us Page</CardTitle>
                <CardDescription>Tell your story and build trust</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <img 
                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=300&fit=crop" 
                    alt="Auto Shop Team" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-primary">Our Story</h3>
                    <p className="text-muted-foreground">
                      With over 20 years of experience in automotive service, AutoPro has been serving the community 
                      with honest, reliable, and professional car care. Our certified technicians use the latest 
                      diagnostic equipment and genuine parts to ensure your vehicle runs at its best.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="h-8 w-8 text-blue-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Expert Service</h4>
                        <p className="text-sm text-muted-foreground">Certified technicians with years of experience</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Fast Turnaround</h4>
                        <p className="text-sm text-muted-foreground">Quick and efficient service to get you back on the road</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                          <DollarSign className="h-8 w-8 text-purple-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Fair Pricing</h4>
                        <p className="text-sm text-muted-foreground">Transparent pricing with no hidden fees</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="servicing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Servicing Information</CardTitle>
                <CardDescription>Maintenance schedules and service intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <img 
                    src="https://images.unsplash.com/photo-1632823471565-1ecdf7a5e0b5?w=800&h=300&fit=crop" 
                    alt="Car Maintenance" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Regular Maintenance</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                          <span>Oil Change</span>
                          <span className="text-sm text-muted-foreground">Every 5,000 miles</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                          <span>Tire Rotation</span>
                          <span className="text-sm text-muted-foreground">Every 7,500 miles</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                          <span>Brake Inspection</span>
                          <span className="text-sm text-muted-foreground">Every 12,000 miles</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Major Services</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                          <span>Transmission Service</span>
                          <span className="text-sm text-muted-foreground">Every 30,000 miles</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                          <span>Coolant Flush</span>
                          <span className="text-sm text-muted-foreground">Every 50,000 miles</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                          <span>Timing Belt</span>
                          <span className="text-sm text-muted-foreground">Every 60,000 miles</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact & Booking Form</CardTitle>
                <CardDescription>Customer booking interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Book Your Service</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customer-name">Full Name</Label>
                        <Input id="customer-name" placeholder="Your name" />
                      </div>
                      <div>
                        <Label htmlFor="customer-email">Email</Label>
                        <Input id="customer-email" type="email" placeholder="your@email.com" />
                      </div>
                      <div>
                        <Label htmlFor="customer-phone">Phone</Label>
                        <Input id="customer-phone" placeholder="Your phone number" />
                      </div>
                      <div>
                        <Label htmlFor="vehicle-info">Vehicle Information</Label>
                        <Input id="vehicle-info" placeholder="Year Make Model" />
                      </div>
                      <div>
                        <Label htmlFor="service-type">Service Needed</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oil-change">Oil Change</SelectItem>
                            <SelectItem value="brake-service">Brake Service</SelectItem>
                            <SelectItem value="tire-rotation">Tire Rotation</SelectItem>
                            <SelectItem value="inspection">General Inspection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="preferred-date">Preferred Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea id="notes" placeholder="Any specific concerns or requests..." />
                      </div>
                      <Button className="w-full">Submit Booking Request</Button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Phone className="mr-3 h-5 w-5 text-primary" />
                          <span>+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-3 h-5 w-5 text-primary" />
                          <span>info@autopro.com</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-3 h-5 w-5 text-primary" />
                          <span>123 Service St, Auto City, AC 12345</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-3 h-5 w-5 text-primary" />
                          <span>Mon-Fri: 8AM-6PM, Sat: 8AM-4PM</span>
                        </div>
                      </div>
                    </div>
                    <img 
                      src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop" 
                      alt="Auto Shop" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );

  const NotificationsContent = () => {
    const [appointmentReminders, setAppointmentReminders] = useState({
      enabled: true,
      daysBefore: 1,
      email: true,
      sms: true,
      template: "Hi {customer_name}, this is a reminder for your appointment for your {vehicle_make} {vehicle_model} on {appointment_date} at {appointment_time}. Thanks, {business_name}."
    });

    const [serviceReminders, setServiceReminders] = useState({
      enabled: true,
      weeksBefore: 2,
      email: true,
      sms: true,
      template: "Hi {customer_name}, your {vehicle_make} {vehicle_model} is due for its next service around {service_due_date}. Please book an appointment at your convenience. Thanks, {business_name}."
    });

    const [marketingMessage, setMarketingMessage] = useState({
      recipients: 'all',
      channel: 'email',
      message: ''
    });

    const [isSendingMarketing, setIsSendingMarketing] = useState(false);

    const checkAndSendReminders = async () => {
      console.log("Checking for reminders to send...");
      const now = new Date();

      // Appointment Reminders
      if (appointmentReminders.enabled) {
        const upcomingAppointments = appointments.filter(a => {
          const appointmentDate = new Date(a.date);
          const reminderDate = new Date(appointmentDate);
          reminderDate.setDate(reminderDate.getDate() - appointmentReminders.daysBefore);
          // Check if reminder should be sent today
          return reminderDate.toDateString() === now.toDateString();
        });

        for (const appointment of upcomingAppointments) {
          const customer = customers.find(c => c.id === appointment.customerId);
          const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
          if (customer && vehicle) {
            const message = appointmentReminders.template
              .replace(/{customer_name}/g, customer.name)
              .replace(/{vehicle_make}/g, vehicle.make)
              .replace(/{vehicle_model}/g, vehicle.model)
              .replace(/{appointment_date}/g, format(new Date(appointment.date), "PPP"))
              .replace(/{appointment_time}/g, appointment.time)
              .replace(/{business_name}/g, 'AutoPro Service Center');

            if (appointmentReminders.email && customer.email) {
              console.log(`Sending appointment reminder email to ${customer.email}`);
              await fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'reminder',
                  channel: 'email',
                  recipients: [{ email: customer.email, phone: customer.phone }],
                  message,
                  subject: `Appointment Reminder for ${vehicle.make} ${vehicle.model}`,
                }),
              });
            }
            if (appointmentReminders.sms && customer.phone) {
              console.log(`Sending appointment reminder SMS to ${customer.phone}`);
              await fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'reminder',
                  channel: 'sms',
                  recipients: [{ email: customer.email, phone: customer.phone }],
                  message,
                }),
              });
            }
          }
        }
      }

      // Service Reminders (assuming 6 month service interval)
      if (serviceReminders.enabled) {
        const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
        
        for (const customer of customers) {
          const customerAppointments = appointments
            .filter(a => a.customerId === customer.id && a.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          if (customerAppointments.length > 0) {
            const lastServiceDate = new Date(customerAppointments[0].date);
            const nextServiceDueDate = new Date(lastServiceDate.getTime() + sixMonthsInMs);
            
            const reminderDate = new Date(nextServiceDueDate);
            reminderDate.setDate(reminderDate.getDate() - (serviceReminders.weeksBefore * 7));

            if (reminderDate.toDateString() === now.toDateString()) {
              const vehicle = vehicles.find(v => v.id === customerAppointments[0].vehicleId);
              if (vehicle) {
                const message = serviceReminders.template
                  .replace(/{customer_name}/g, customer.name)
                  .replace(/{vehicle_make}/g, vehicle.make)
                  .replace(/{vehicle_model}/g, vehicle.model)
                  .replace(/{service_due_date}/g, format(nextServiceDueDate, "PPP"))
                  .replace(/{business_name}/g, 'AutoPro Service Center');

                if (serviceReminders.email && customer.email) {
                  console.log(`Sending service reminder email to ${customer.email}`);
                  await fetch('/api/notifications/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'service_reminder',
                      channel: 'email',
                      recipients: [{ email: customer.email, phone: customer.phone }],
                      message,
                      subject: `Service Reminder for your ${vehicle.make} ${vehicle.model}`,
                    }),
                  });
                }
                if (serviceReminders.sms && customer.phone) {
                  console.log(`Sending service reminder SMS to ${customer.phone}`);
                  await fetch('/api/notifications/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'service_reminder',
                      channel: 'sms',
                      recipients: [{ email: customer.email, phone: customer.phone }],
                      message,
                    }),
                  });
                }
              }
            }
          }
        }
      }
    };

    useEffect(() => {
      // This simulates a daily check when the app loads.
      // In a real-world scenario, this would be a cron job on the server.
      const timer = setTimeout(() => {
        checkAndSendReminders();
      }, 2000); // Delay to allow data to load

      return () => clearTimeout(timer);
    }, []);

    const handleSendMarketing = async () => {
      if (!marketingMessage.message) {
        alert('Please enter a message to send.');
        return;
      }

      setIsSendingMarketing(true);

      try {
        let recipientList: { email: string; phone: string }[] = [];
        const now = new Date();
        const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
        const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

        if (marketingMessage.recipients === 'all') {
          recipientList = customers.map(c => ({ email: c.email, phone: c.phone }));
        } else if (marketingMessage.recipients === 'recent') {
          const recentCustomers = customers.filter(c => c.createdAt >= ninetyDaysAgo);
          recipientList = recentCustomers.map(c => ({ email: c.email, phone: c.phone }));
        } else if (marketingMessage.recipients === 'inactive') {
          const activeCustomerIds = new Set(
            appointments
              .filter(a => a.date >= sixMonthsAgo)
              .map(a => a.customerId)
          );
          const inactiveCustomers = customers.filter(c => !activeCustomerIds.has(c.id));
          recipientList = inactiveCustomers.map(c => ({ email: c.email, phone: c.phone }));
        }

        const response = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'marketing',
            channel: marketingMessage.channel,
            recipients: recipientList,
            message: marketingMessage.message,
            subject: 'A message from AutoPro Service Center',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send marketing message');
        }

        alert(`Marketing message sent successfully via ${marketingMessage.channel} to ${marketingMessage.recipients} customers.`);
        setMarketingMessage(prev => ({ ...prev, message: '' }));
      } catch (error) {
        console.error('Error sending marketing message:', error);
        alert('There was an error sending the marketing message. Please check the console for details.');
      } finally {
        setIsSendingMarketing(false);
      }
    };

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp}>
          <h2 className="text-3xl font-bold text-primary mb-2">Notifications</h2>
          <p className="text-muted-foreground">Manage automated reminders and marketing messages</p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="reminders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reminders">Appointment Reminders</TabsTrigger>
              <TabsTrigger value="service">Service Reminders</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>

            <TabsContent value="reminders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Reminders</CardTitle>
                  <CardDescription>Automatically notify customers about upcoming appointments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="enable-appointment-reminders" className="font-medium">Enable Appointment Reminders</Label>
                    <Switch
                      id="enable-appointment-reminders"
                      checked={appointmentReminders.enabled}
                      onCheckedChange={(checked) => setAppointmentReminders(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {appointmentReminders.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div>
                          <Label htmlFor="reminder-time">Send Reminder</Label>
                          <Select
                            value={String(appointmentReminders.daysBefore)}
                            onValueChange={(value) => setAppointmentReminders(prev => ({ ...prev, daysBefore: Number(value) }))}
                          >
                            <SelectTrigger id="reminder-time">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 day before appointment</SelectItem>
                              <SelectItem value="2">2 days before appointment</SelectItem>
                              <SelectItem value="3">3 days before appointment</SelectItem>
                              <SelectItem value="7">1 week before appointment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="enable-email-reminders"
                              checked={appointmentReminders.email}
                              onCheckedChange={(checked) => setAppointmentReminders(prev => ({ ...prev, email: checked }))}
                            />
                            <Label htmlFor="enable-email-reminders">Via Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="enable-sms-reminders"
                              checked={appointmentReminders.sms}
                              onCheckedChange={(checked) => setAppointmentReminders(prev => ({ ...prev, sms: checked }))}
                            />
                            <Label htmlFor="enable-sms-reminders">Via SMS</Label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="reminder-template">Message Template</Label>
                          <Textarea
                            id="reminder-template"
                            value={appointmentReminders.template}
                            onChange={(e) => setAppointmentReminders(prev => ({ ...prev, template: e.target.value }))}
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Use placeholders like {"{customer_name}"}, {"{vehicle_make}"}, {"{appointment_date}"}, etc.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="service" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Next Service Reminders</CardTitle>
                  <CardDescription>Remind customers when their next service is due.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="enable-service-reminders" className="font-medium">Enable Service Reminders</Label>
                    <Switch
                      id="enable-service-reminders"
                      checked={serviceReminders.enabled}
                      onCheckedChange={(checked) => setServiceReminders(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {serviceReminders.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div>
                          <Label htmlFor="service-reminder-time">Send Reminder</Label>
                          <Select
                            value={String(serviceReminders.weeksBefore)}
                            onValueChange={(value) => setServiceReminders(prev => ({ ...prev, weeksBefore: Number(value) }))}
                          >
                            <SelectTrigger id="service-reminder-time">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 week before due</SelectItem>
                              <SelectItem value="2">2 weeks before due</SelectItem>
                              <SelectItem value="4">1 month before due</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="enable-email-service"
                              checked={serviceReminders.email}
                              onCheckedChange={(checked) => setServiceReminders(prev => ({ ...prev, email: checked }))}
                            />
                            <Label htmlFor="enable-email-service">Via Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="enable-sms-service"
                              checked={serviceReminders.sms}
                              onCheckedChange={(checked) => setServiceReminders(prev => ({ ...prev, sms: checked }))}
                            />
                            <Label htmlFor="enable-sms-service">Via SMS</Label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="service-template">Message Template</Label>
                          <Textarea
                            id="service-template"
                            value={serviceReminders.template}
                            onChange={(e) => setServiceReminders(prev => ({ ...prev, template: e.target.value }))}
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Use placeholders like {"{customer_name}"}, {"{vehicle_make}"}, {"{service_due_date}"}, etc.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="marketing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Messages</CardTitle>
                  <CardDescription>Send promotional messages to your customers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="marketing-recipients">Recipients</Label>
                    <Select
                      value={marketingMessage.recipients}
                      onValueChange={(value) => setMarketingMessage(prev => ({ ...prev, recipients: value }))}
                    >
                      <SelectTrigger id="marketing-recipients">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="recent">Recent Customers (last 90 days)</SelectItem>
                        <SelectItem value="inactive">Inactive Customers (no visit in 6 months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Channel</Label>
                    <ToggleGroup
                      type="single"
                      value={marketingMessage.channel}
                      onValueChange={(value) => {
                        if (value) setMarketingMessage(prev => ({ ...prev, channel: value }))
                      }}
                      className="justify-start"
                    >
                      <ToggleGroupItem value="email">Email</ToggleGroupItem>
                      <ToggleGroupItem value="sms">SMS</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div>
                    <Label htmlFor="marketing-message">Message</Label>
                    <Textarea
                      id="marketing-message"
                      placeholder="Type your marketing message here..."
                      value={marketingMessage.message}
                      onChange={(e) => setMarketingMessage(prev => ({ ...prev, message: e.target.value }))}
                      rows={6}
                    />
                  </div>

                  <Button onClick={handleSendMarketing} className="w-full" disabled={isSendingMarketing}>
                    {isSendingMarketing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'customers':
        return <CustomersContent />;
      case 'vehicles':
        return <VehiclesContent />;
      case 'appointments':
        return <AppointmentsContent />;
      case 'calendar':
        return <CalendarContent />;
      case 'invoices':
        return <InvoicesContent />;
      case 'service-checks':
        return <ServiceChecksContent />;
      case 'products':
        return <ProductsContent 
          products={products}
          setProducts={setProducts}
          invoices={invoices}
          estimates={estimates}
          customers={customers}
          fadeInUp={fadeInUp}
          staggerContainer={staggerContainer}
        />;
      case 'website':
        return <WebsiteContent />;
      case 'estimates':
        return <EstimatesContent />;
      case 'templates':
        return <TemplatesContent />;
      case 'notifications':
        return <NotificationsContent />;
      case 'settings':
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">Settings</h2>
              <p className="text-muted-foreground">Configure your business settings and preferences</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Update your business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input id="business-name" defaultValue="AutoPro Service Center" />
                  </div>
                  <div>
                    <Label htmlFor="business-phone">Phone</Label>
                    <Input id="business-phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="business-email">Email</Label>
                    <Input id="business-email" defaultValue="info@autopro.com" />
                  </div>
                  <div>
                    <Label htmlFor="business-address">Address</Label>
                    <Textarea id="business-address" defaultValue="123 Service St, Auto City, AC 12345" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Banking & Payment</CardTitle>
                  <CardDescription>Configure payment and banking details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input id="bank-name" placeholder="First National Bank" />
                  </div>
                  <div>
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input id="account-number" placeholder="****1234" />
                  </div>
                  <div>
                    <Label htmlFor="routing-number">Routing Number</Label>
                    <Input id="routing-number" placeholder="123456789" />
                  </div>
                  <div>
                    <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                    <Input id="tax-rate" type="number" step="0.01" defaultValue="8.5" />
                  </div>
                  <Button>Update Banking Info</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Configure your outgoing email (SMTP) settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input
                      id="smtp-host"
                      placeholder="smtp.example.com"
                      value={emailSettings.host}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, host: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      placeholder="587"
                      value={emailSettings.port}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-user">SMTP Username</Label>
                    <Input
                      id="smtp-user"
                      placeholder="your_email@example.com"
                      value={emailSettings.user}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, user: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-pass">SMTP Password</Label>
                    <Input
                      id="smtp-pass"
                      type="password"
                      placeholder="Your email password"
                      value={emailSettings.pass}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, pass: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtp-secure"
                      checked={emailSettings.secure}
                      onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, secure: checked }))}
                    />
                    <Label htmlFor="smtp-secure">Use SSL/TLS (Secure Connection)</Label>
                  </div>
                  <div>
                    <Label htmlFor="email-from">Sender Email Address</Label>
                    <Input
                      id="email-from"
                      placeholder="your_business@example.com"
                      value={emailSettings.from}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                  <Button>Save Email Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SMS Settings (Twilio)</CardTitle>
                  <CardDescription>Configure your Twilio account for sending SMS messages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="twilio-sid">Twilio Account SID</Label>
                    <Input
                      id="twilio-sid"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={smsSettings.accountSid}
                      onChange={(e) => setSmsSettings(prev => ({ ...prev, accountSid: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twilio-token">Twilio Auth Token</Label>
                    <Input
                      id="twilio-token"
                      type="password"
                      placeholder="your_twilio_auth_token"
                      value={smsSettings.authToken}
                      onChange={(e) => setSmsSettings(prev => ({ ...prev, authToken: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twilio-phone">Twilio Phone Number</Label>
                    <Input
                      id="twilio-phone"
                      placeholder="+15017122661"
                      value={smsSettings.phoneNumber}
                      onChange={(e) => setSmsSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                  <Button>Save SMS Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Google Calendar Integration</CardTitle>
                  <CardDescription>Sync appointments with Google Calendar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="google-client-id">Google Client ID</Label>
                    <Input
                      id="google-client-id"
                      placeholder="YOUR_GOOGLE_CLIENT_ID"
                      value={googleCalendarSettings.clientId}
                      onChange={(e) => setGoogleCalendarSettings(prev => ({ ...prev, clientId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="google-client-secret">Google Client Secret</Label>
                    <Input
                      id="google-client-secret"
                      type="password"
                      placeholder="YOUR_GOOGLE_CLIENT_SECRET"
                      value={googleCalendarSettings.clientSecret}
                      onChange={(e) => setGoogleCalendarSettings(prev => ({ ...prev, clientSecret: e.target.value }))}
                    />
                  </div>
                  <Button>Save Google API Keys</Button>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    {isCalendarConnected ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    )}
                    <span className="text-sm font-medium">
                      Status: {isCalendarConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {isCalendarConnected 
                      ? 'Your appointments will automatically sync with Google Calendar. Customers will receive calendar invites when appointments are scheduled.'
                      : 'Connect your Google Calendar to automatically sync appointments and send calendar invites to customers.'
                    }
                  </p>

                  {calendarError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{calendarError}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {isCalendarConnected ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={disconnectCalendar}
                          disabled={isCalendarLoading}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={checkConnectionStatus}
                          disabled={isCalendarLoading}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Test Connection
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={connectToGoogle}
                        disabled={isCalendarLoading}
                      >
                        {isCalendarLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Connect Google Calendar
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {isCalendarConnected && (
                    <div className="mt-4 p-3 bg-accent/20 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Calendar Features:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Automatic appointment sync</li>
                        <li>• Customer email invitations</li>
                        <li>• Appointment reminders</li>
                        <li>• Real-time calendar updates</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>MOT API Settings</CardTitle>
                  <CardDescription>Configure your MOT API key for vehicle lookups.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mot-api-key">MOT API Key</Label>
                    <Input
                      id="mot-api-key"
                      type="password"
                      placeholder="Enter your MOT API Key"
                      value={motApiSettings.apiKey}
                      onChange={(e) => setMotApiSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mot-client-id">MOT Client ID</Label>
                    <Input
                      id="mot-client-id"
                      type="password"
                      placeholder="Enter your MOT Client ID"
                      value={motApiSettings.clientId}
                      onChange={(e) => setMotApiSettings(prev => ({ ...prev, clientId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mot-client-secret">MOT Client Secret</Label>
                    <Input
                      id="mot-client-secret"
                      type="password"
                      placeholder="Enter your MOT Client Secret"
                      value={motApiSettings.clientSecret}
                      onChange={(e) => setMotApiSettings(prev => ({ ...prev, clientSecret: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mot-scope-url">Scope URL</Label>
                    <Input
                      id="mot-scope-url"
                      placeholder="Enter your Scope URL"
                      value={motApiSettings.scopeUrl}
                      onChange={(e) => setMotApiSettings(prev => ({ ...prev, scopeUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mot-token-url">Token URL</Label>
                    <Input
                      id="mot-token-url"
                      placeholder="Enter your Token URL"
                      value={motApiSettings.tokenUrl}
                      onChange={(e) => setMotApiSettings(prev => ({ ...prev, tokenUrl: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleSaveMotApiKey} disabled={isSavingMotApiKey}>
                    {isSavingMotApiKey ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      'Save MOT API Settings'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="flex items-center justify-center h-64"
          >
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-primary mb-2">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h3>
              <p className="text-muted-foreground">This section is under development</p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>AutoPro - Business Management System</title>
        <meta name="description" content="Complete automotive business management solution" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="bg-background min-h-screen flex">
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-primary">
                    {sidebarItems.find(item => item.id === activeTab)?.label}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/admin', // Redirect to the admin login page
        permanent: false,
      },
    };
  }

  return {
    props: { session }, // Pass the session to the page props
  };
}