"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Flame,
  Zap,
  Sparkles,
  Tag,
  Check,
  Search,
  Star,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  X,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { ArenaNavbar } from "@/components/ArenaNavbar";
import { ArenaSidebar } from "@/components/ArenaSidebar";

interface Product {
  id: string;
  name: string;
  category: "Apparel" | "Headwear & Gloves" | "Collectibles & Gear";
  priceINR: number;
  priceXP: number;
  image: string;
  badge: "LIMITED DROP" | "BEST SELLER" | "XP EXCLUSIVE" | "ARENA OFFICIAL";
  description: string;
  rating: number;
  reviewsCount: number;
  sizes?: string[];
  stock: number;
}

const PRODUCTS: Product[] = [
  {
    id: "merch-1",
    name: "Roast Arena 'Unmatched Fire' Heavyweight Hoodie",
    category: "Apparel",
    priceINR: 2499,
    priceXP: 5500,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    badge: "BEST SELLER",
    description: "450 GSM French Terry cotton hoodie with custom embroidered duel clash crest and signature red pull-cords.",
    rating: 4.9,
    reviewsCount: 342,
    sizes: ["S", "M", "L", "XL", "2XL"],
    stock: 24,
  },
  {
    id: "merch-2",
    name: "Savage Comeback Oversized Vintage Tee",
    category: "Apparel",
    priceINR: 1299,
    priceXP: 2900,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80",
    badge: "LIMITED DROP",
    description: "Acid-washed boxy fit streetwear graphic tee honoring iconic brand roasts and mic-drop moments.",
    rating: 4.8,
    reviewsCount: 218,
    sizes: ["S", "M", "L", "XL"],
    stock: 18,
  },
  {
    id: "merch-3",
    name: "Roast Arena Championship Leather Boxing Gloves (12oz)",
    category: "Headwear & Gloves",
    priceINR: 3499,
    priceXP: 8000,
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80",
    badge: "ARENA OFFICIAL",
    description: "Handcrafted matte black cowhide leather gloves with reinforced wrist support and high-density impact foam.",
    rating: 5.0,
    reviewsCount: 128,
    stock: 12,
  },
  {
    id: "merch-4",
    name: "Arena Roaster 3D Embroidered Snapback Cap",
    category: "Headwear & Gloves",
    priceINR: 999,
    priceXP: 2200,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80",
    badge: "BEST SELLER",
    description: "Structured 6-panel snapback with dual-color underbill and metallic Roast Arena side buckle.",
    rating: 4.7,
    reviewsCount: 184,
    stock: 45,
  },
  {
    id: "merch-5",
    name: "Dual-Insulated Stainless Steel Roaster Tumbler (750ml)",
    category: "Collectibles & Gear",
    priceINR: 1199,
    priceXP: 2600,
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
    badge: "ARENA OFFICIAL",
    description: "Double-walled vacuum insulated tumbler keeps ice cold for 24 hours and coffee piping hot for 12 hours.",
    rating: 4.9,
    reviewsCount: 95,
    stock: 30,
  },
  {
    id: "merch-6",
    name: "Roast Arena World Champion Heavyweight Belt (Replica)",
    category: "Collectibles & Gear",
    priceINR: 5999,
    priceXP: 15000,
    image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=600&auto=format&fit=crop&q=80",
    badge: "XP EXCLUSIVE",
    description: "Full-size 4mm solid brass plate championship title belt with embossed rival brand emblems and velvet casing.",
    rating: 5.0,
    reviewsCount: 42,
    stock: 5,
  },
  {
    id: "merch-7",
    name: "Viral Roasts Holographic Vinyl Sticker Pack (20 Pcs)",
    category: "Collectibles & Gear",
    priceINR: 399,
    priceXP: 850,
    image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&auto=format&fit=crop&q=80",
    badge: "BEST SELLER",
    description: "Die-cut waterproof UV-resistant matte vinyl stickers featuring the community's top 20 savage one-liners.",
    rating: 4.8,
    reviewsCount: 512,
    stock: 120,
  },
  {
    id: "merch-8",
    name: "Roast Arena Bomber Jacket • Matte Black Edition",
    category: "Apparel",
    priceINR: 3899,
    priceXP: 9200,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    badge: "LIMITED DROP",
    description: "Water-resistant flight nylon with custom flame zip pullers and ribbed collar, cuffs, and waistband.",
    rating: 4.9,
    reviewsCount: 88,
    sizes: ["M", "L", "XL"],
    stock: 10,
  },
];

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  payWithXP?: boolean;
}

export default function MerchandisePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating">("featured");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({
    "merch-1": "L",
    "merch-2": "L",
    "merch-8": "L",
  });

  // User Points
  const [userPoints, setUserPoints] = useState<number>(2540);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState("");

  // Coming Soon Notification State
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isNotified, setIsNotified] = useState(false);

  // Load points & cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("coroast_voter_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.points) setUserPoints(parsed.points);
      }
      const savedCart = localStorage.getItem("coroast_merch_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {}
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("coroast_merch_cart", JSON.stringify(newCart));
    } catch {}
  };

  const handleAddToCart = (product: Product, payWithXP: boolean = false) => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.size === selectedSizes[product.id] && item.payWithXP === payWithXP
    );

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart = [
        ...cart,
        {
          product,
          quantity: 1,
          size: selectedSizes[product.id] || (product.sizes ? product.sizes[0] : undefined),
          payWithXP,
        },
      ];
    }

    saveCart(updatedCart);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    saveCart(updated);
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    saveCart(updated);
  };

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "ROAST20") {
      setCouponDiscount(0.2);
      setCouponMsg("20% Off coupon applied!");
    } else if (couponCode.trim().toUpperCase() === "ARENA50") {
      setCouponDiscount(0.5);
      setCouponMsg("50% VIP discount applied!");
    } else {
      setCouponDiscount(0);
      setCouponMsg("Invalid coupon code. Try ROAST20");
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      if (item.payWithXP) return total;
      return total + item.product.priceINR * item.quantity;
    }, 0);
  };

  const calculateTotalXP = () => {
    return cart.reduce((total, item) => {
      if (!item.payWithXP) return total;
      return total + item.product.priceXP * item.quantity;
    }, 0);
  };

  const subtotalINR = calculateSubtotal();
  const discountAmount = Math.round(subtotalINR * couponDiscount);
  const finalTotalINR = Math.max(0, subtotalINR - discountAmount);
  const totalXPRequired = calculateTotalXP();

  const handleCheckout = () => {
    if (totalXPRequired > userPoints) {
      alert(`You need ${totalXPRequired} XP points, but only have ${userPoints} XP. Win more battles to earn XP!`);
      return;
    }

    if (totalXPRequired > 0) {
      const newPoints = userPoints - totalXPRequired;
      setUserPoints(newPoints);
      try {
        const stored = localStorage.getItem("coroast_voter_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.points = newPoints;
          localStorage.setItem("coroast_voter_session", JSON.stringify(parsed));
          window.dispatchEvent(new Event("storage"));
        }
      } catch {}
    }

    saveCart([]);
    setIsCheckoutSuccess(true);
  };

  // Filtering & Sorting
  const filteredProducts = PRODUCTS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All Items" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.priceINR - b.priceINR;
    if (sortBy === "price-high") return b.priceINR - a.priceINR;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.reviewsCount - a.reviewsCount;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* 1. TOP FIXED NAVBAR */}
      <ArenaNavbar activeTab="Merchandise" />

      {/* 2. MAIN LAYOUT WITH ARENA SIDEBAR */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT SIDEBAR ================= */}
          <div className="lg:col-span-3">
            <ArenaSidebar activeItem="Merchandise" />
          </div>

          {/* ================= MAIN STORE STREAM ================= */}
          <main className="lg:col-span-9 relative min-h-[750px]">
            {/* OVERWRITE COMING SOON OVERLAY */}
            <div className="absolute inset-0 z-20 flex items-start justify-center pt-16 sm:pt-28 px-4 pointer-events-auto">
              <div className="max-w-xl w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black uppercase tracking-wider shadow-2xs">
                  <ShoppingBag className="w-4 h-4 text-red-600" />
                  <span>Limited Edition Arena Merchandise Drop</span>
                </div>

                {/* Coming Soon Heading */}
                <div className="space-y-2.5">
                  <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tight text-slate-950">
                    COMING <span className="text-red-600">SOON</span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
                    The Roast Arena merchandise vault is currently locked. Premium heavyweight apparel, championship gloves, and XP-exclusive drops will be arriving shortly.
                  </p>
                </div>

                {/* Notify Me Box
                {!isNotified ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (notifyEmail.trim()) {
                        setIsNotified(true);
                      }
                    }}
                    className="flex flex-col sm:flex-row items-center gap-2.5 max-w-md mx-auto pt-2"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Enter your email for drop access..."
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto shrink-0 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/30 cursor-pointer active:scale-95"
                    >
                      Notify Me
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>You are on the VIP drop list! We will notify you first.</span>
                  </div>
                )} */}

                {/* CTA Links */}
                <div className="pt-2 flex items-center justify-center gap-4">
                  <Link
                    href="/battles"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-slate-700 hover:text-red-600 transition-colors uppercase tracking-wider"
                  >
                    <span>← Return to Live Battles</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* BLURRED BACKGROUND STORE CONTENT */}
            <div className="space-y-6 filter blur-md select-none pointer-events-none opacity-40">
              {/* HERO BANNER */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-black/80 pointer-events-none" />
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 fill-red-400" />
                  <span>Official Arena Merchandise Drop</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
                  Wear The Clash. <br />
                  <span className="text-red-500 italic">Rep Your Colors.</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  Premium heavyweight apparel and battle-tested accessories. Purchase with INR or redeem directly with your earned Arena XP.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-mono">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-slate-300">Your XP Balance:</span>
                    <strong className="text-white font-black">{userPoints.toLocaleString()} XP</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-600/30 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>View Cart ({cart.reduce((t, c) => t + c.quantity, 0)})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* VALUE PROPS STRIP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">48h Express Dispatch</h4>
                  <p className="text-[11px] text-slate-500">Free delivery on orders above ₹999</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">100% Heavyweight Cotton</h4>
                  <p className="text-[11px] text-slate-500">Authentic official Roast Arena tags</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 fill-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Redeem with XP</h4>
                  <p className="text-[11px] text-slate-500">Convert your battle victory points to gear</p>
                </div>
              </div>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {["All Items", "Apparel", "Headwear & Gloves", "Collectibles & Gear"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search merchandise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/30"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  {/* Image container */}
                  <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge */}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-xs ${
                        product.badge === "LIMITED DROP"
                          ? "bg-amber-600"
                          : product.badge === "XP EXCLUSIVE"
                          ? "bg-purple-600"
                          : product.badge === "BEST SELLER"
                          ? "bg-red-600"
                          : "bg-slate-900"
                      }`}
                    >
                      {product.badge}
                    </span>

                    {/* Rating pill */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-bold">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-slate-300">({product.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {product.category}
                      </span>
                      <h3 className="font-black text-sm text-slate-950 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Sizes if applicable */}
                    {product.sizes && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Select Size:</span>
                        <div className="flex items-center gap-1.5">
                          {product.sizes.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() =>
                                setSelectedSizes((prev) => ({ ...prev, [product.id]: sz }))
                              }
                              className={`w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center transition-colors cursor-pointer border ${
                                (selectedSizes[product.id] || product.sizes![0]) === sz
                                  ? "bg-slate-900 border-slate-900 text-white"
                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price and Action row */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-base font-black text-slate-950 font-mono">
                            ₹{product.priceINR.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400">
                            Incl. all taxes
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-black text-red-600 font-mono flex items-center gap-1 justify-end">
                            <Zap className="w-3 h-3 fill-red-600" />
                            <span>{product.priceXP.toLocaleString()} XP</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400">
                            Redeemable Price
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product, false)}
                          className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product, true)}
                          className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5 fill-red-600" />
                          <span>Redeem XP</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </main>
        </div>
      </div>

      {/* ================= CART SLIDE-OVER DRAWER ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Cart Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-base text-slate-950 uppercase tracking-tight">
                  Your Arena Cart ({cart.reduce((t, c) => t + c.quantity, 0)})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                  <ShoppingBag className="w-12 h-12 stroke-1" />
                  <p className="text-xs font-bold">Your cart is currently empty</p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs uppercase"
                  >
                    Browse Merch
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.payWithXP}`}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-black text-xs text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.payWithXP ? (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-black">
                            XP REDEMPTION
                          </span>
                        ) : (
                          <span className="text-slate-900 font-black">
                            ₹{item.product.priceINR.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Quantity row */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(idx, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-black cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black font-mono px-1">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(idx, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-black cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
                {/* Promo Code Input */}
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. ROAST20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono uppercase focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMsg && (
                    <p className={`text-[10px] font-bold ${couponDiscount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {couponMsg}
                    </p>
                  )}
                </div>

                {/* Calculation Summary */}
                <div className="space-y-1.5 text-xs">
                  {subtotalINR > 0 && (
                    <>
                      <div className="flex justify-between text-slate-500">
                        <span>INR Subtotal</span>
                        <span className="font-mono">₹{subtotalINR.toLocaleString()}</span>
                      </div>
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Discount ({couponDiscount * 100}%)</span>
                          <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-500">
                        <span>Shipping</span>
                        <span className="font-mono text-emerald-600 font-bold">FREE</span>
                      </div>
                    </>
                  )}

                  {totalXPRequired > 0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-red-600" />
                        <span>XP Points to Redeem</span>
                      </span>
                      <span className="font-mono">{totalXPRequired.toLocaleString()} XP</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-950">
                    <span>Final Total</span>
                    <div className="text-right">
                      {finalTotalINR > 0 && (
                        <div className="font-mono">₹{finalTotalINR.toLocaleString()}</div>
                      )}
                      {totalXPRequired > 0 && (
                        <div className="font-mono text-red-600 text-xs">
                          + {totalXPRequired.toLocaleString()} XP
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Confirm Order & Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CHECKOUT SUCCESS MODAL ================= */}
      {isCheckoutSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                Order Confirmed! 🎉
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Thank you for ordering official Roast Arena gear. Your order tracking ID is <strong>#ROAST-9824</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Shipping Speed:</span>
                <strong>Express (48 Hours)</strong>
              </div>
              <div className="flex justify-between">
                <span>XP Remaining:</span>
                <strong className="text-red-600">{userPoints.toLocaleString()} XP</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCheckoutSuccess(false);
                setIsCartOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-wider"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
