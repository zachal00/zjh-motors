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
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";

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

export default function BusinessManagementApp() {
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
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'estimates', label: 'Estimates', icon: Calculator },
    { id: 'service-checks', label: 'Service Checks', icon: CheckSquare },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'website', label: 'Website', icon: Eye },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-blue-600' },
    { label: 'Appointments Today', value: appointments.filter(apt => 
      apt.date.toDateString() === new Date().toDateString()
    ).length, icon: Calendar, color: 'text-green-600' },
    { label: 'Pending Invoices', value: 5, icon: FileText, color: 'text-orange-600' },
    { label: 'Monthly Revenue', value: '$12,450', icon: DollarSign, color: 'text-purple-600' }
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
          <h1 className="text-2xl font-bold text-primary">AutoPro</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
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
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Plus className="h-6 w-6" />
                  <span>New Customer</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Calendar className="h-6 w-6" />
                  <span>Schedule</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <FileText className="h-6 w-6" />
                  <span>Create Invoice</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
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
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
      setIsAddDialogOpen(false);
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  <Button variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
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
                              <span>${stats.totalSpent.toFixed(2)} total spent</span>
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
                    <Button onClick={() => setIsAddDialogOpen(true)}>
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
                              <p className="text-2xl font-bold text-primary">${stats.totalSpent.toFixed(2)}</p>
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
                          {customerAppointments.map((appointment) => {
                            const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
                            return (
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
                            );
                          })}
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
                                <p className="font-semibold">${invoice.total.toFixed(2)}</p>
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

  const VehiclesContent = () => (
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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>Enter vehicle information below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer-select">Customer</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" placeholder="Toyota" />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="Camry" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="2020" />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" placeholder="Silver" />
                </div>
              </div>
              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" placeholder="1HGBH41JXMN109186" />
              </div>
              <div>
                <Label htmlFor="license">License Plate</Label>
                <Input id="license" placeholder="ABC123" />
              </div>
              <Button className="w-full">Add Vehicle</Button>
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
                   customer?.name.toLowerCase().includes(searchLower);
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
                          <span>${stats.totalSpent.toFixed(2)} total spent</span>
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
                            <p className="text-2xl font-bold text-primary">${stats.totalSpent.toFixed(2)}</p>
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
                              <p className="font-semibold">${invoice.total.toFixed(2)}</p>
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
          <Dialog>
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
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule First Appointment
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
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

  const InvoicesContent = () => {
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [invoiceNotes, setInvoiceNotes] = useState('');
    const [invoiceDueDate, setInvoiceDueDate] = useState<Date>();
    const [isCreating, setIsCreating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
          <Dialog>
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
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add Invoice Item</DialogTitle>
                          <DialogDescription>Select products or services to add to the invoice</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 max-h-96 overflow-y-auto">
                          {products.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                              <div className="flex-1">
                                <h4 className="font-medium">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                                <p className="text-sm font-semibold text-primary">${product.price}</p>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => addInvoiceItem(product)}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
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
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">Qty:</Label>
                              <Input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-16" 
                                min="1"
                              />
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">${item.price} each</p>
                              <p className="font-semibold">${item.total.toFixed(2)}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
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
                        <span>${totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8.5%):</span>
                        <span>${totals.tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>${totals.total.toFixed(2)}</span>
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
                            <p className="text-2xl font-bold text-primary">${invoice.total.toFixed(2)}</p>
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
                    <Button>
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
                          <span>${viewingInvoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax ({viewingInvoice.taxRate}%):</span>
                          <span>${viewingInvoice.tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-primary">${viewingInvoice.total.toFixed(2)}</span>
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
                              {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                            <p className="font-semibold">${item.total.toFixed(2)}</p>
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
                            <p className="text-sm text-muted-foreground">${item.price} each</p>
                            <p className="font-semibold">${item.total.toFixed(2)}</p>
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
                        <span>${editingInvoice.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({editingInvoice.taxRate}%):</span>
                        <span>${(editingInvoice.items.reduce((sum, item) => sum + item.total, 0) * (editingInvoice.taxRate / 100)).toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>${(editingInvoice.items.reduce((sum, item) => sum + item.total, 0) * (1 + editingInvoice.taxRate / 100)).toFixed(2)}</span>
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

  const ServiceChecksContent = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Service Checks</h2>
          <p className="text-muted-foreground">Digital inspection forms with photo attachments</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Service Check
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Service Check</DialogTitle>
              <DialogDescription>Digital vehicle inspection form</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sc-customer">Customer</Label>
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
                  <Label htmlFor="sc-vehicle">Vehicle</Label>
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
              </div>

              <div>
                <Label className="text-base font-semibold">Inspection Items</Label>
                <div className="space-y-3 mt-2">
                  {[
                    'Engine Oil Level',
                    'Brake Fluid',
                    'Tire Condition',
                    'Battery',
                    'Air Filter',
                    'Brake Pads',
                    'Lights & Signals',
                    'Belts & Hoses'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{item}</span>
                      <div className="flex items-center space-x-4">
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="attention">Needs Attention</SelectItem>
                            <SelectItem value="replace">Replace</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="sc-technician">Technician</Label>
                <Input id="sc-technician" placeholder="Technician name" />
              </div>

              <div>
                <Label htmlFor="sc-notes">Additional Notes</Label>
                <Textarea id="sc-notes" placeholder="Overall vehicle condition, recommendations..." />
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">Complete Service Check</Button>
                <Button variant="outline" className="flex-1">Save Draft</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="grid gap-4">
          {[
            { id: '1', customer: 'John Smith', vehicle: '2020 Toyota Camry', technician: 'Mike Johnson', date: '2024-06-25', status: 'completed' },
            { id: '2', customer: 'Sarah Johnson', vehicle: '2019 Honda Civic', technician: 'Sarah Davis', date: '2024-06-24', status: 'in-progress' }
          ].map((check) => (
            <Card key={check.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <CheckSquare className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Service Check #{check.id.padStart(4, '0')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {check.customer} - {check.vehicle}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Technician: {check.technician} | Date: {check.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={check.status === 'completed' ? 'default' : 'secondary'}>
                      {check.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  const ProductsContent = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Products & Services</h2>
          <p className="text-muted-foreground">Manage your inventory and service catalog</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product/Service</DialogTitle>
              <DialogDescription>Add items to your catalog</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prod-name">Name</Label>
                <Input id="prod-name" placeholder="Product or service name" />
              </div>
              <div>
                <Label htmlFor="prod-description">Description</Label>
                <Textarea id="prod-description" placeholder="Detailed description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prod-price">Price</Label>
                  <Input id="prod-price" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="prod-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="parts">Parts</SelectItem>
                      <SelectItem value="fluids">Fluids</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="prod-stock">Stock Quantity</Label>
                <Input id="prod-stock" type="number" placeholder="0" />
              </div>
              <Button className="w-full">Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">${product.price}</p>
                    <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  const EstimatesContent = () => {
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [estimateItems, setEstimateItems] = useState<InvoiceItem[]>([]);
    const [estimateNotes, setEstimateNotes] = useState('');
    const [estimateValidUntil, setEstimateValidUntil] = useState<Date>();
    const [isCreating, setIsCreating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

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
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add Estimate Item</DialogTitle>
                          <DialogDescription>Select products or services to add to the estimate</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 max-h-96 overflow-y-auto">
                          {products.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                              <div className="flex-1">
                                <h4 className="font-medium">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                                <p className="text-sm font-semibold text-primary">${product.price}</p>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => addEstimateItem(product)}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
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
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">Qty:</Label>
                              <Input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-16" 
                                min="1"
                              />
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">${item.price} each</p>
                              <p className="font-semibold">${item.total.toFixed(2)}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
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
                        <span>${totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8.5%):</span>
                        <span>${totals.tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>${totals.total.toFixed(2)}</span>
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
                              <p className="text-2xl font-bold text-primary">${estimate.total.toFixed(2)}</p>
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
                          <span>${viewingEstimate.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax ({viewingEstimate.taxRate}%):</span>
                          <span>${viewingEstimate.tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-primary">${viewingEstimate.total.toFixed(2)}</span>
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
                              {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                            <p className="font-semibold">${item.total.toFixed(2)}</p>
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
                            <p className="text-sm text-muted-foreground">${item.price} each</p>
                            <p className="font-semibold">${item.total.toFixed(2)}</p>
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
                        <span>${editingEstimate.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({editingEstimate.taxRate}%):</span>
                        <span>${(editingEstimate.items.reduce((sum, item) => sum + item.total, 0) * (editingEstimate.taxRate / 100)).toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>${(editingEstimate.items.reduce((sum, item) => sum + item.total, 0) * (1 + editingEstimate.taxRate / 100)).toFixed(2)}</span>
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
                    { name: 'Oil Change', price: '$49.99', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=300&h=200&fit=crop' },
                    { name: 'Brake Service', price: '$129.99', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop' },
                    { name: 'Tire Rotation', price: '$39.99', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop' }
                  ].map((service, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <img src={service.image} alt={service.name} className="w-full h-32 object-cover rounded mb-4" />
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-2xl font-bold text-primary">{service.price}</p>
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
      case 'invoices':
        return <InvoicesContent />;
      case 'service-checks':
        return <ServiceChecksContent />;
      case 'products':
        return <ProductsContent />;
      case 'website':
        return <WebsiteContent />;
      case 'estimates':
        return <EstimatesContent />;
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
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure email and SMS settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input id="smtp-server" placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="sms-provider">SMS Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SMS provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="nexmo">Nexmo</SelectItem>
                        <SelectItem value="aws-sns">AWS SNS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>Configure Notifications</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Google Calendar Integration</CardTitle>
                  <CardDescription>Sync appointments with Google Calendar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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