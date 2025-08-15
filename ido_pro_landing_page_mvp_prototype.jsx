import React from "react";
import { motion } from "framer-motion";
import { Search, PlayCircle, Image, Music2, FileCode, Layers, Sparkles, ShieldCheck, CloudDownload, ChevronRight, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// --- Mock Data ---
const categories = [
  { name: "Video Templates", icon: PlayCircle, count: "12.4k" },
  { name: "Graphic Templates", icon: Layers, count: "18.9k" },
  { name: "Stock Photos", icon: Image, count: "220k" },
  { name: "Music & SFX", icon: Music2, count: "34.1k" },
  { name: "Code & Snippets", icon: FileCode, count: "7.8k" },
];

const assets = [
  {
    title: "Cinematic Opener",
    author: "PixelFoundry",
    type: "After Effects",
    thumb:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    rating: 4.8,
    downloads: 1290,
  },
  {
    title: "Modern Business Pitch Deck",
    author: "DeckLab",
    type: "Keynote",
    thumb:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
    rating: 4.9,
    downloads: 2456,
  },
  {
    title: "Minimalist Instagram Pack",
    author: "StudioNoir",
    type: "PSD/Canva",
    thumb:
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1200&auto=format&fit=crop",
    rating: 4.7,
    downloads: 980,
  },
  {
    title: "Ambient Lo-Fi Track",
    author: "WaveformX",
    type: "WAV/MP3",
    thumb:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
    rating: 4.6,
    downloads: 1751,
  },
];

const plans = [
  {
    name: "Starter",
    price: "$12",
    period: "/mo",
    features: [
      "Unlimited downloads",
      "Commercial license",
      "1 user seat",
      "Email support",
    ],
  },
  {
    name: "Pro",
    highlight: true,
    price: "$19",
    period: "/mo",
    features: [
      "Unlimited downloads",
      "Extended license",
      "3 user seats",
      "Priority support",
      "Team collections",
    ],
  },
  {
    name: "Teams",
    price: "$49",
    period: "/mo",
    features: [
      "Unlimited downloads",
      "Extended license",
      "10 user seats",
      "SSO & roles",
      "Dedicated manager",
    ],
  },
];

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }} className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center">
            <Sparkles size={20} />
          </motion.div>
          <span className="font-extrabold text-xl tracking-tight">IdoPro</span>
          <Badge className="ml-2" variant="secondary">beta</Badge>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#browse" className="hover:opacity-80">Browse</a>
          <a href="#pricing" className="hover:opacity-80">Pricing</a>
          <a href="#contributors" className="hover:opacity-80">Contribute</a>
          <a href="#license" className="hover:opacity-80">License</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex">Sign in</Button>
          <Button>Start free trial</Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Unlimited creative assets for <span className="bg-black text-white px-2 py-1 rounded-xl">one simple plan</span>
            </h1>
            <p className="mt-4 text-slate-600 text-base md:text-lg">
              Download high‑quality templates, videos, music, graphics, and code. Curated by professionals. New items added weekly.
            </p>
            <div className="mt-6 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
                <Input className="pl-10 h-11" placeholder="Search 300,000+ assets…" />
              </div>
              <Button className="h-11">Search</Button>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1"><ShieldCheck size={16} /> Simple commercial license</div>
              <div className="flex items-center gap-1"><CloudDownload size={16} /> Unlimited downloads</div>
              <div className="flex items-center gap-1"><Users size={16} /> Team plans</div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-2 gap-4">
            {assets.map((item, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className="rounded-2xl overflow-hidden shadow-sm border bg-white">
                <div className="aspect-video w-full bg-slate-200" style={{ backgroundImage: `url(${item.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Badge variant="outline">{item.type}</Badge>
                    <div className="flex items-center gap-[2px]"><Star size={14} /><span>{item.rating}</span></div>
                  </div>
                  <h3 className="mt-1 font-semibold leading-tight line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500">by {item.author}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section id="browse" className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-bold">Browse by category</h2>
          <Button variant="ghost" className="group">View all <ChevronRight className="ml-1 group-hover:translate-x-0.5 transition" size={16} /></Button>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(({ name, icon: Icon, count }) => (
            <Card key={name} className="hover:shadow-md transition border rounded-2xl">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-100 grid place-items-center">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="font-semibold leading-tight">{name}</div>
                  <div className="text-xs text-slate-500">{count} items</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trending() {
  return (
    <section className="py-8 bg-slate-50 border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-bold">Trending now</h2>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="graphics">Graphics</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.concat(assets).slice(0,8).map((item, i) => (
            <Card key={i} className="overflow-hidden rounded-2xl">
              <div className="aspect-video w-full" style={{ backgroundImage: `url(${item.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-base leading-tight line-clamp-1">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>{item.type}</span>
                  <span>{item.downloads.toLocaleString()} downloads</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Simple, transparent pricing</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <Card key={plan.name} className={`rounded-2xl border ${plan.highlight ? "ring-2 ring-black shadow" : ""}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  {plan.highlight && <Badge>Best value</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <ShieldCheck size={16} className="mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-5">Choose {plan.name}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContributorCTA() {
  return (
    <section id="contributors" className="py-12 bg-gradient-to-b from-slate-50 to-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Earn with IdoPro</h2>
            <p className="mt-3 text-slate-600">
              Submit your best assets and get paid monthly from subscriber revenue. Transparent earnings, real‑time analytics, and a curated catalog that keeps quality high.
            </p>
            <div className="mt-5 flex gap-2">
              <Button>Become a contributor</Button>
              <Button variant="ghost">Contributor guide</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map((i) => (
              <Card key={i} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-extrabold">{(i*12)+"%"}</div>
                  <div className="text-sm text-slate-600">Projected earnings uplift</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="font-extrabold text-xl">IdoPro</div>
          <p className="mt-2 text-slate-600">Unlimited creative assets. Simple license. Built for speed.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Product</div>
          <ul className="space-y-1 text-slate-600">
            <li>Browse</li>
            <li>Pricing</li>
            <li>Collections</li>
            <li>Changelog</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Company</div>
          <ul className="space-y-1 text-slate-600">
            <li>About</li>
            <li>Blog</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Legal</div>
          <ul className="space-y-1 text-slate-600">
            <li>License</li>
            <li>Terms</li>
            <li>Privacy</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500 mt-6">© {new Date().getFullYear()} IdoPro. All rights reserved.</div>
    </footer>
  );
}

export default function IdoProLanding() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <Hero />
      <Categories />
      <Trending />
      <Pricing />
      <ContributorCTA />
      <Footer />
    </div>
  );
}
