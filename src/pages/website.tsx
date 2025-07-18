import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  Star,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import Logo from "@/components/Logo";

export default function WebsiteContent() {
  const [selectedDate, setSelectedDate] = useState<Date>();

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

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <Head>
        <title>AutoPro - Your Trusted Automotive Service</title>
        <meta name="description" content="Professional automotive care with state-of-the-art equipment and certified technicians." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation Bar */}
      <motion.header variants={fadeInUp} className="flex justify-between items-center p-6 bg-card border-b border-border">
        <Logo />
        <nav className="space-x-4">
          <Button variant="ghost">Homepage</Button>
          <Button variant="ghost">Services</Button>
          <Button variant="ghost">Servicing</Button>
          <Button variant="ghost">About</Button>
          <Button variant="ghost">Contact</Button>
          <Button>Admin Login</Button>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.section variants={fadeInUp} className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=1600&h=900&fit=crop"
          alt="Auto Service"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-white space-y-6">
          <h1 className="text-5xl font-bold drop-shadow-lg">Professional Auto Service</h1>
          <p className="text-xl max-w-2xl mx-auto drop-shadow-md">
            Expert automotive care with state-of-the-art equipment and certified technicians.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Book Service</Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/20">Learn More</Button>
          </div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section variants={fadeInUp} className="p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-primary">Our Services</h2>
          <p className="text-muted-foreground text-lg">Comprehensive care for your vehicle</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Oil Change', price: 49.99, image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=300&fit=crop', description: 'Full synthetic oil change with premium filter.' },
            { name: 'Brake Service', price: 129.99, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', description: 'Inspection, pad replacement, and fluid check.' },
            { name: 'Tire Rotation', price: 39.99, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop', description: 'Extend tire life and improve handling.' },
            { name: 'Engine Diagnostics', price: 89.99, image: 'https://images.unsplash.com/photo-1621905252507-b41e05907d07?w=400&h=300&fit=crop', description: 'Advanced computer diagnostics for engine issues.' },
            { name: 'Wheel Alignment', price: 79.99, image: 'https://images.unsplash.com/photo-1621905252507-b41e05907d07?w=400&h=300&fit=crop', description: 'Precision alignment for optimal driving.' },
            { name: 'Battery Check & Replacement', price: 119.99, image: 'https://images.unsplash.com/photo-1621905252507-b41e05907d07?w=400&h=300&fit=crop', description: 'Test, clean, and replace battery if needed.' },
          ].map((service, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <img src={service.image} alt={service.name} className="w-full h-48 object-cover" />
              <CardContent className="p-6 space-y-3">
                <CardTitle className="text-xl font-semibold text-primary">{service.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
                <p className="text-2xl font-bold text-accent-foreground">{formatCurrency(service.price)}</p>
                <Button className="w-full">Book Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* About Us Section */}
      <motion.section variants={fadeInUp} className="p-8 space-y-8 bg-secondary/30 rounded-lg">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-primary">About Us</h2>
          <p className="text-muted-foreground text-lg">Your trusted partner in automotive care</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <img
            src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop"
            alt="AutoPro Team"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              With over 20 years of experience in automotive service, AutoPro has been serving the community
              with honest, reliable, and professional car care. Our certified technicians use the latest
              diagnostic equipment and genuine parts to ensure your vehicle runs at its best. We are committed
              to providing exceptional service and building lasting relationships with our customers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Star className="h-6 w-6 text-accent-foreground flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Expert Technicians</h3>
                  <p className="text-sm text-muted-foreground">Certified and highly experienced professionals.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-accent-foreground flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Efficient Service</h3>
                  <p className="text-sm text-muted-foreground">Quick turnaround times without compromising quality.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <DollarSign className="h-6 w-6 text-accent-foreground flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Transparent Pricing</h3>
                  <p className="text-sm text-muted-foreground">No hidden fees, clear and upfront costs.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-accent-foreground flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Quality Guarantee</h3>
                  <p className="text-sm text-muted-foreground">We stand behind our work with a solid warranty.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Servicing Information Section */}
      <motion.section variants={fadeInUp} className="p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-primary">Vehicle Servicing</h2>
          <p className="text-muted-foreground text-lg">Keeping your vehicle in top condition</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-primary">Regular Maintenance Schedule</h3>
            <p className="text-muted-foreground">
              Following a regular maintenance schedule is crucial for your vehicle's longevity and performance.
              Here are some common service intervals:
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <span className="font-medium text-primary">Oil Change</span>
                <span className="text-muted-foreground">Every 5,000 - 7,500 miles</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <span className="font-medium text-primary">Tire Rotation & Balance</span>
                <span className="text-muted-foreground">Every 7,500 miles</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <span className="font-medium text-primary">Brake Inspection</span>
                <span className="text-muted-foreground">Every 12,000 miles or annually</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <span className="font-medium text-primary">Fluid Checks & Top-offs</span>
                <span className="text-muted-foreground">Every service visit</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-primary">Major Service Intervals</h3>
            <p className="text-muted-foreground">
              Beyond routine checks, certain components require attention at longer intervals to prevent major issues.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <span className="font-medium text-primary">Transmission Fluid Service</span>
                <span className="text-muted-foreground">Every 30,000 - 60,000 miles</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <span className="font-medium text-primary">Coolant Flush</span>
                <span className="text-muted-foreground">Every 30,000 - 50,000 miles</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <span className="font-medium text-primary">Spark Plug Replacement</span>
                <span className="text-muted-foreground">Every 30,000 - 100,000 miles (varies by car)</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                <span className="font-medium text-primary">Timing Belt/Chain Inspection</span>
                <span className="text-muted-foreground">Every 60,000 - 100,000 miles</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Contact & Booking Section */}
      <motion.section variants={fadeInUp} className="p-8 space-y-8 bg-primary/10 rounded-lg">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-primary">Contact Us & Book Service</h2>
          <p className="text-muted-foreground text-lg">Get in touch or schedule your next appointment</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 space-y-6">
            <CardTitle className="text-2xl font-semibold text-primary">Book Your Service</CardTitle>
            <CardDescription>Fill out the form below to request an appointment. We'll get back to you shortly to confirm.</CardDescription>
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
                <Label htmlFor="vehicle-info">Vehicle Information (Year, Make, Model)</Label>
                <Input id="vehicle-info" placeholder="e.g., 2018 Honda Civic" />
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
                    <SelectItem value="other">Other (please specify in notes)</SelectItem>
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
                <Label htmlFor="notes">Additional Notes / Preferred Time</Label>
                <Textarea id="notes" placeholder="Any specific concerns or requests, e.g., 'Morning appointment preferred'" />
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Submit Booking Request</Button>
            </div>
          </Card>

          <div className="space-y-8">
            <Card className="p-6 space-y-4">
              <CardTitle className="text-2xl font-semibold text-primary">Our Contact Information</CardTitle>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="mr-3 h-5 w-5 text-accent-foreground" />
                  <span className="text-muted-foreground">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-3 h-5 w-5 text-accent-foreground" />
                  <span className="text-muted-foreground">info@autopro.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-3 h-5 w-5 text-accent-foreground" />
                  <span className="text-muted-foreground">123 Service St, Auto City, AC 12345</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-3 h-5 w-5 text-accent-foreground" />
                  <span className="text-muted-foreground">Mon-Fri: 8AM-6PM, Sat: 8AM-4PM</span>
                </div>
              </div>
            </Card>
            <img
              src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop"
              alt="Auto Shop Location"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer variants={fadeInUp} className="p-6 text-center text-muted-foreground text-sm border-t border-border">
        © {new Date().getFullYear()} AutoPro Service Center. All rights reserved.
      </motion.footer>
    </motion.div>
  );
}