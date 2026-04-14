import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Search,
  MapPin,
  TrendingUp,
  Bell,
  Shield,
  Zap,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Search,
      title: "AI-Powered Search",
      description: "Find seized and surplus properties using natural language queries like 'cheap cars in Texas'",
    },
    {
      icon: MapPin,
      title: "Geographic Discovery",
      description: "Visualize auctions on interactive maps and filter by location, state, and county",
    },
    {
      icon: TrendingUp,
      title: "Smart Analysis",
      description: "Get AI-generated summaries, fair market value estimates, and bidding strategies",
    },
    {
      icon: Bell,
      title: "Real-Time Alerts",
      description: "Receive notifications when watched auctions are ending or have new bids",
    },
    {
      icon: Shield,
      title: "Verified Sources",
      description: "Aggregated data from official government sources including GSA, GovPlanet, and more",
    },
    {
      icon: Zap,
      title: "Instant Insights",
      description: "Chat with our AI assistant to get answers about any auction item instantly",
    },
  ];

  const stats = [
    { label: "Government Sources", value: "50+" },
    { label: "Active Auctions", value: "10K+" },
    { label: "Users Saved", value: "$2M+" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CB</span>
            </div>
            <span className="font-semibold text-slate-900">CivicBid</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/auctions">
                  <Button variant="ghost">Browse Auctions</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost">Sign In</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button>Get Started</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                  <span className="text-sm font-medium text-blue-700">✨ Discover Government Auctions</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight">
                  Find Seized & Surplus Properties with AI
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  CivicBid aggregates official government auctions and uses AI to help you discover incredible deals on
                  seized properties, vehicles, equipment, and more.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={getLoginUrl()}>
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Exploring <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative h-96 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-slate-200 space-y-6">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg"></div>
                  <div className="h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-8 bg-blue-100 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features Built for You</h2>
            <p className="text-xl text-slate-600">Everything you need to find and analyze government auctions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-16 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Search", desc: "Find auctions by category, location, or price" },
              { step: 2, title: "Analyze", desc: "Get AI insights and fair market valuations" },
              { step: 3, title: "Watch", desc: "Add to watchlist and get real-time alerts" },
              { step: 4, title: "Bid", desc: "Link to official auctions and place your bid" },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-6 -right-4 text-slate-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center text-white space-y-8">
          <h2 className="text-4xl font-bold">Ready to Find Your Next Deal?</h2>
          <p className="text-xl opacity-90">
            Join thousands of smart buyers discovering incredible opportunities in government auctions
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CB</span>
                </div>
                <span className="font-semibold text-white">CivicBid</span>
              </div>
              <p className="text-sm">Discover government auctions with AI-powered insights</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 CivicBid. All rights reserved. We aggregate publicly available government auction data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
