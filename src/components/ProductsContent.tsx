import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Package,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

interface ProductsContentProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  invoices: any[];
  estimates: any[];
  customers: any[];
  fadeInUp: any;
  staggerContainer: any;
}

export const ProductsContent: React.FC<ProductsContentProps> = ({
  products,
  setProducts,
  invoices,
  estimates,
  customers,
  fadeInUp,
  staggerContainer
}) => {
  const [isProductCreateDialogOpen, setIsProductCreateDialogOpen] = useState(false);
  const [isProductViewDialogOpen, setIsProductViewDialogOpen] = useState(false);
  const [isProductEditDialogOpen, setIsProductEditDialogOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState<'all' | 'service' | 'parts' | 'low-stock' | 'out-of-stock'>('all');

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0
  });

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.description || !newProduct.category || newProduct.price <= 0) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    const product: Product = {
      id: (products.length + 1).toString(),
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      category: newProduct.category,
      stock: newProduct.stock
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0
    });
    setIsProductCreateDialogOpen(false);
    alert('Product created successfully!');
  };

  const handleEditProduct = () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.description || !editingProduct.category || editingProduct.price <= 0) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    setProducts(prev => prev.map(product => 
      product.id === editingProduct.id ? editingProduct : product
    ));
    setEditingProduct(null);
    setIsProductEditDialogOpen(false);
    alert('Product updated successfully!');
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      // Check if product is used in any invoices or estimates
      const usedInInvoices = invoices.some(invoice => 
        invoice.items.some(item => item.productId === productId)
      );
      const usedInEstimates = estimates.some(estimate => 
        estimate.items.some(item => item.productId === productId)
      );

      if (usedInInvoices || usedInEstimates) {
        alert('Cannot delete product that is used in existing invoices or estimates. Please remove from those records first.');
        return;
      }

      setProducts(prev => prev.filter(product => product.id !== productId));
      alert('Product deleted successfully!');
    }
  };

  const getProductStats = (productId: string) => {
    const invoiceUsage = invoices.reduce((count, invoice) => {
      return count + invoice.items.filter(item => item.productId === productId).length;
    }, 0);
    
    const estimateUsage = estimates.reduce((count, estimate) => {
      return count + estimate.items.filter(item => item.productId === productId).length;
    }, 0);

    const totalRevenue = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((revenue, invoice) => {
        const productItems = invoice.items.filter(item => item.productId === productId);
        return revenue + productItems.reduce((sum, item) => sum + item.total, 0);
      }, 0);

    return {
      invoiceUsage,
      estimateUsage,
      totalRevenue,
      totalUsage: invoiceUsage + estimateUsage
    };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = productSearchTerm === '' || 
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(productSearchTerm.toLowerCase());

    if (productFilter === 'service') {
      return matchesSearch && product.category.toLowerCase() === 'service';
    } else if (productFilter === 'parts') {
      return matchesSearch && product.category.toLowerCase() === 'parts';
    } else if (productFilter === 'low-stock') {
      return matchesSearch && product.stock > 0 && product.stock <= 10;
    } else if (productFilter === 'out-of-stock') {
      return matchesSearch && product.stock === 0 && product.category.toLowerCase() !== 'service';
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
          <h2 className="text-3xl font-bold text-primary">Products & Services</h2>
          <p className="text-muted-foreground">Manage your inventory and service catalog</p>
        </div>
        <Dialog open={isProductCreateDialogOpen} onOpenChange={setIsProductCreateDialogOpen}>
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
                <Label htmlFor="prod-name">Name *</Label>
                <Input 
                  id="prod-name" 
                  placeholder="Product or service name" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="prod-description">Description *</Label>
                <Textarea 
                  id="prod-description" 
                  placeholder="Detailed description" 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prod-price">Price *</Label>
                  <Input 
                    id="prod-price" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="prod-category">Category *</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Parts">Parts</SelectItem>
                      <SelectItem value="Fluids">Fluids</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="prod-stock">Stock Quantity</Label>
                <Input 
                  id="prod-stock" 
                  type="number" 
                  placeholder="0" 
                  value={newProduct.stock || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Leave as 0 for services</p>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={handleCreateProduct}>Add Product</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsProductCreateDialogOpen(false)}>Cancel</Button>
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
              placeholder="Search products and services..."
              className="pl-10"
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
            />
          </div>
          <Select value={productFilter} onValueChange={(value) => setProductFilter(value as 'all' | 'service' | 'parts' | 'low-stock' | 'out-of-stock')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="service">Services</SelectItem>
              <SelectItem value="parts">Parts</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const stats = getProductStats(product.id);
                const isLowStock = product.stock > 0 && product.stock <= 10 && product.category !== 'Service';
                const isOutOfStock = product.stock === 0 && product.category !== 'Service';
                
                return (
                  <Card key={product.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant="outline">{product.category}</Badge>
                          {isOutOfStock && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                          {isLowStock && (
                            <Badge variant="secondary">Low Stock</Badge>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                            {product.category !== 'Service' && (
                              <p className="text-sm text-muted-foreground">
                                Stock: {product.stock}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Used in {stats.totalUsage} transaction{stats.totalUsage !== 1 ? 's' : ''}</p>
                          <p>Revenue: ${stats.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setViewingProduct(product);
                              setIsProductViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingProduct({ ...product });
                              setIsProductEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
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
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {productSearchTerm || productFilter !== 'all' ? 'No products found' : 'No Products Yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {productSearchTerm || productFilter !== 'all'
                    ? 'Try adjusting your search terms or filters.'
                    : 'Add your first product or service to start building your catalog.'
                  }
                </p>
                {!productSearchTerm && productFilter === 'all' && (
                  <Button onClick={() => setIsProductCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Product
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* View Product Dialog */}
      <Dialog open={isProductViewDialogOpen} onOpenChange={setIsProductViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Complete product information and usage statistics</DialogDescription>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <span>{viewingProduct.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Category:</span>
                      <Badge variant="outline">{viewingProduct.category}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Price: ${viewingProduct.price.toFixed(2)}</span>
                    </div>
                    {viewingProduct.category !== 'Service' && (
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>Stock: {viewingProduct.stock} units</span>
                      </div>
                    )}
                    <div className="mt-4">
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">{viewingProduct.description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const stats = getProductStats(viewingProduct.id);
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-accent/20 rounded-lg">
                            <p className="text-2xl font-bold text-primary">{stats.invoiceUsage}</p>
                            <p className="text-sm text-muted-foreground">Invoice Uses</p>
                          </div>
                          <div className="text-center p-3 bg-accent/20 rounded-lg">
                            <p className="text-2xl font-bold text-primary">{stats.estimateUsage}</p>
                            <p className="text-sm text-muted-foreground">Estimate Uses</p>
                          </div>
                          <div className="text-center p-3 bg-accent/20 rounded-lg col-span-2">
                            <p className="text-2xl font-bold text-primary">${stats.totalRevenue.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const recentInvoices = invoices
                      .filter(invoice => invoice.items.some(item => item.productId === viewingProduct.id))
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .slice(0, 5);
                    
                    return recentInvoices.length > 0 ? (
                      <div className="space-y-3">
                        {recentInvoices.map((invoice) => {
                          const customer = customers.find(c => c.id === invoice.customerId);
                          const productItem = invoice.items.find(item => item.productId === viewingProduct.id);
                          return (
                            <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{invoice.invoiceNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                  {customer?.name} • {format(invoice.createdAt, "MMM dd, yyyy")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {productItem?.quantity}x ${productItem?.total.toFixed(2)}
                                </p>
                                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                  {invoice.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No recent usage found</p>
                    );
                  })()}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditingProduct({ ...viewingProduct });
                    setIsProductViewDialogOpen(false);
                    setIsProductEditDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </Button>
                <Button variant="outline" onClick={() => setIsProductViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isProductEditDialogOpen} onOpenChange={setIsProductEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product/Service</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-prod-name">Name *</Label>
                <Input 
                  id="edit-prod-name" 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-prod-description">Description *</Label>
                <Textarea 
                  id="edit-prod-description" 
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-prod-price">Price *</Label>
                  <Input 
                    id="edit-prod-price" 
                    type="number" 
                    step="0.01" 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-prod-category">Category *</Label>
                  <Select 
                    value={editingProduct.category} 
                    onValueChange={(value) => setEditingProduct(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Parts">Parts</SelectItem>
                      <SelectItem value="Fluids">Fluids</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-prod-stock">Stock Quantity</Label>
                <Input 
                  id="edit-prod-stock" 
                  type="number" 
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock: parseInt(e.target.value) || 0 } : null)}
                />
                <p className="text-xs text-muted-foreground mt-1">Leave as 0 for services</p>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={handleEditProduct}>Save Changes</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsProductEditDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};