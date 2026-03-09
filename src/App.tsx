import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Briefcase, 
  FolderTree, 
  Layers, 
  LogOut, 
  Menu, 
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
    )}
  >
    <Icon size={20} className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </Link>
);

const Card = ({ children, title, action }: { children: React.ReactNode, title: string, action?: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-bottom border-slate-50 flex items-center justify-between bg-slate-50/50">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// --- Pages ---

const Login = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      onLogin(data.token);
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2">Welcome back! Please sign in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const SliderManager = () => {
  const [sliders, setSliders] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const token = localStorage.getItem("token");

  const fetchSliders = () => fetch("/api/sliders").then(res => res.json()).then(setSliders);
  useEffect(() => { fetchSliders(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `/api/sliders/${editing.id}` : "/api/sliders";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    fetchSliders();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/sliders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSliders();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Sliders</h2>
        <button 
          onClick={() => setEditing({ title: "", description: "", image_url: "" })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
        >
          <Plus size={20} /> Add Slider
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-bottom border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900">{editing.id ? "Edit Slider" : "New Slider"}</h3>
                <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    value={editing.title}
                    onChange={e => setEditing({ ...editing, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input
                    value={editing.image_url}
                    onChange={e => setEditing({ ...editing, image_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={editing.description}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                  Save Slider
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sliders.map(slider => (
          <motion.div 
            layout
            key={slider.id} 
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
              <img src={slider.image_url} alt={slider.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(slider)} className="p-2 bg-white/90 backdrop-blur rounded-lg text-indigo-600 hover:bg-white shadow-sm"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(slider.id)} className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-600 hover:bg-white shadow-sm"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-900 mb-1">{slider.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-2">{slider.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ServiceManager = () => {
  const [services, setServices] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const token = localStorage.getItem("token");

  const fetchServices = () => fetch("/api/services").then(res => res.json()).then(setServices);
  useEffect(() => { fetchServices(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `/api/services/${editing.id}` : "/api/services";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    fetchServices();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/services/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Services</h2>
        <button 
          onClick={() => setEditing({ name: "", description: "", icon: "Briefcase" })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={20} /> Add Service
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
              <div className="px-8 py-6 border-bottom flex justify-between items-center">
                <h3 className="text-xl font-bold">{editing.id ? "Edit Service" : "New Service"}</h3>
                <button onClick={() => setEditing(null)}><X /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Service Name</label>
                  <input
                    value={editing.name}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon Name (Lucide)</label>
                  <input
                    value={editing.icon}
                    onChange={e => setEditing({ ...editing, icon: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editing.description}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold">
                  Save Service
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <Briefcase size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900 truncate">{service.name}</h4>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(service)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(service.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const token = localStorage.getItem("token");

  const fetchCategories = () => fetch("/api/categories").then(res => res.json()).then(setCategories);
  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `/api/categories/${editing.id}` : "/api/categories";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    fetchCategories();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCategories();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
        <button 
          onClick={() => setEditing({ name: "" })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8">
              <h3 className="text-xl font-bold mb-6">{editing.id ? "Edit Category" : "New Category"}</h3>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name</label>
                  <input
                    value={editing.name}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-slate-100 py-3 rounded-xl font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold">Save</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {categories.map(cat => (
          <div key={cat.id} className="px-6 py-4 flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">{cat.id}</div>
              <span className="font-medium text-slate-700">{cat.name}</span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(cat)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={18} /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <div className="p-8 text-center text-slate-400">No categories found.</div>}
      </div>
    </div>
  );
};

const ProjectManager = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    const [pRes, cRes] = await Promise.all([fetch("/api/projects"), fetch("/api/categories")]);
    setProjects(await pRes.json());
    setCategories(await cRes.json());
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `/api/projects/${editing.id}` : "/api/projects";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
        <button 
          onClick={() => setEditing({ title: "", description: "", category_id: categories[0]?.id || "", images: [] })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={20} /> Add Project
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="px-8 py-6 border-bottom flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold">{editing.id ? "Edit Project" : "New Project"}</h3>
                <button onClick={() => setEditing(null)}><X /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      value={editing.title}
                      onChange={e => setEditing({ ...editing, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={editing.category_id}
                      onChange={e => setEditing({ ...editing, category_id: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editing.description}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Images (URLs, one per line)</label>
                  <textarea
                    value={editing.images.join("\n")}
                    onChange={e => setEditing({ ...editing, images: e.target.value.split("\n").filter(Boolean) })}
                    className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 h-24 font-mono text-sm"
                    placeholder="https://example.com/image1.jpg"
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold">
                  Save Project
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="aspect-video bg-slate-100 relative group">
              {project.images?.[0] ? (
                <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48} /></div>
              )}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(project)} className="p-2 bg-white/90 backdrop-blur rounded-lg text-indigo-600 shadow-sm"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(project.id)} className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-600 shadow-sm"><Trash2 size={16} /></button>
              </div>
              <div className="absolute bottom-2 left-2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                {project.category_name}
              </div>
            </div>
            <div className="p-5 flex-1">
              <h4 className="font-bold text-slate-900 mb-2">{project.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-3">{project.description}</p>
              {project.images.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {project.images.slice(1).map((img: string, i: number) => (
                    <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover border border-slate-100" referrerPolicy="no-referrer" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardLayout = ({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AdminPro</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={ImageIcon} label="Sliders" to="/sliders" active={location.pathname === "/sliders" || location.pathname === "/"} />
          <SidebarItem icon={Briefcase} label="Services" to="/services" active={location.pathname === "/services"} />
          <SidebarItem icon={FolderTree} label="Categories" to="/categories" active={location.pathname === "/categories"} />
          <SidebarItem icon={Layers} label="Projects" to="/projects" active={location.pathname === "/projects"} />
        </nav>

        <button 
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-indigo-600" size={24} />
          <span className="font-bold text-slate-900">AdminPro</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-500">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 p-6 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-10">
                <LayoutDashboard className="text-indigo-600" size={28} />
                <h1 className="text-xl font-bold">AdminPro</h1>
              </div>
              <nav className="flex-1 space-y-2" onClick={() => setMobileMenuOpen(false)}>
                <SidebarItem icon={ImageIcon} label="Sliders" to="/sliders" active={location.pathname === "/sliders"} />
                <SidebarItem icon={Briefcase} label="Services" to="/services" active={location.pathname === "/services"} />
                <SidebarItem icon={FolderTree} label="Categories" to="/categories" active={location.pathname === "/categories"} />
                <SidebarItem icon={Layers} label="Projects" to="/projects" active={location.pathname === "/projects"} />
              </nav>
              <button onClick={onLogout} className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 bg-red-50">
                <LogOut size={20} /> <span className="font-medium">Sign Out</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:p-10 p-4 pt-20 lg:pt-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const handleLogout = () => {
    console.log("Logout clicked (Public Mode)");
  };

  return (
    <Router>
      <DashboardLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/sliders" replace />} />
          <Route path="/sliders" element={<SliderManager />} />
          <Route path="/services" element={<ServiceManager />} />
          <Route path="/categories" element={<CategoryManager />} />
          <Route path="/projects" element={<ProjectManager />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}
