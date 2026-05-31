"use client";

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sizes: 'S,M,L,XL',
    images: ''
  });

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    let imageUrl = formData.images;

    if (selectedFile) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', selectedFile);

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.success) {
        imageUrl = uploadData.url;
      } else {
        alert("Image upload failed: " + uploadData.error);
        setIsUploading(false);
        return;
      }
    }
    
    const payload = {
      ...formData,
      sizes: formData.sizes.split(',').map(s => s.trim()),
      images: imageUrl ? imageUrl.split(',').map(s => s.trim()) : []
    };

    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
    const method = editingId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      setIsModalOpen(false);
      setSelectedFile(null);
      fetchProducts();
    } else {
      alert("Error: " + data.error);
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchProducts();
    } else {
      alert("Error deleting product");
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setSelectedFile(null);
    setFormData({ name: '', description: '', price: '', stock: '', sizes: 'S,M,L,XL', images: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingId(product.id);
    setSelectedFile(null);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      sizes: product.sizes.join(', '),
      images: product.images?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  if (loading && products.length === 0) {
    return <div className="p-8 text-[#D0FF00]">Loading products...</div>;
  }

  return (
    <div className="p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-white">Product Management</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-[#D0FF00] text-black font-bold rounded-lg hover:bg-[#b0d600] transition-colors"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-[#111] border border-[#333] rounded-xl overflow-hidden flex flex-col">
            <div className="h-48 bg-[#222] flex items-center justify-center relative">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover opacity-80" />
              ) : (
                <span className="text-gray-500 font-mono text-sm">NO IMAGE</span>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white leading-tight">{product.name}</h3>
                <span className="text-[#D0FF00] font-bold">₹{product.price}</span>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{product.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#333]">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Stock: <span className={product.stock <= 0 ? "text-red-500 font-bold" : "text-white"}>{product.stock} {product.stock <= 0 && "(OUT OF STOCK)"}</span></div>
                  <div>Sizes: {product.sizes.join(', ')}</div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(product)} className="p-2 bg-[#222] text-white rounded hover:bg-[#333] transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-900/30 text-red-500 rounded hover:bg-red-900/60 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#333] rounded-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-[#333]">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Product Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-white h-24" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price (₹)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Stock</label>
                    <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-white" />
                  </div>
                  <div className="flex items-center pl-2 pt-5">
                    <label className="flex items-center space-x-2 text-xs text-gray-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={parseInt(formData.stock) === 0 || formData.stock === ''}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({...formData, stock: '0'});
                          } else {
                            setFormData({...formData, stock: '100'});
                          }
                        }}
                        className="accent-[#D0FF00] rounded"
                      />
                      <span>Out of Stock</span>
                    </label>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Sizes (comma separated)</label>
                  <input required value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Product Image (Upload File)</label>
                  <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-white" />
                  {formData.images && !selectedFile && (
                     <p className="text-xs text-gray-400 mt-2 truncate">Current: {formData.images}</p>
                  )}
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors" disabled={isUploading}>Cancel</button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-[#D0FF00] text-black font-bold rounded hover:bg-[#b0d600] transition-colors disabled:opacity-50">
                  {isUploading ? 'Uploading...' : (editingId ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
