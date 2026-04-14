import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Slider,
} from "@/components/ui/slider";
import { MapPin, Heart, Clock, DollarSign, Grid3x3, List, Search } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AuctionListing() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState<"endDate" | "price" | "newest">("endDate");

  // Fetch auctions with filters
  const { data: auctions, isLoading } = trpc.auctions.search.useQuery({
    query: searchQuery || undefined,
    category: category || undefined,
    state: state || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy,
    limit: 20,
  });

  // Fetch watchlist status for current user
  const watchlistQuery = user ? trpc.watchlist.getList.useQuery() : { data: [] as any[] };
  const watchlistIds = useMemo(
    () => new Set((watchlistQuery as any).data?.map((w: any) => w.auctionId) || []),
    [(watchlistQuery as any).data]
  );

  const utils = trpc.useUtils();
  const addToWatchlist = trpc.watchlist.add.useMutation({
    onSuccess: () => {
      utils.watchlist.getList.invalidate();
    },
  });

  const removeFromWatchlist = trpc.watchlist.remove.useMutation({
    onSuccess: () => {
      utils.watchlist.getList.invalidate();
    },
  });

  const categories = [
    "vehicles",
    "real_estate",
    "equipment",
    "electronics",
    "jewelry",
    "art",
    "other",
  ];

  const states = [
    "CA",
    "TX",
    "FL",
    "NY",
    "IL",
    "PA",
    "OH",
    "GA",
    "NC",
    "MI",
  ];

  const handleWatchlistToggle = (auctionId: number) => {
    if (watchlistIds.has(auctionId)) {
      removeFromWatchlist.mutate({ auctionId });
    } else {
      addToWatchlist.mutate({ auctionId });
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTimeRemaining = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return "Ended";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m left`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h left`;
    return `${Math.floor(diff / 86400000)}d left`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Browse Auctions</h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6 sticky top-20">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  State
                </label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All states</SelectItem>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Price Range
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={100000}
                  step={1000}
                  className="mb-3"
                />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="endDate">Ending Soon</SelectItem>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Auction Grid/List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-slate-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : auctions && auctions.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {auctions.map((auction: any) => (
                  <Link key={auction.id} href={`/auction/${auction.id}`}>
                    <Card
                      className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
                      {/* Image */}
                      <div
                        className={`bg-gradient-to-br from-slate-200 to-slate-300 ${
                          viewMode === "list" ? "w-48 h-32" : "w-full h-48"
                        }`}
                      >
                        {auction.imageUrls && Array.isArray(auction.imageUrls) && auction.imageUrls.length > 0 ? (
                          <img
                            src={auction.imageUrls[0]}
                            alt={auction.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-slate-900 line-clamp-2">
                            {auction.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleWatchlistToggle(auction.id);
                            }}
                            className={`flex-shrink-0 ml-2 ${
                              watchlistIds.has(auction.id)
                                ? "text-red-500"
                                : "text-slate-400"
                            }`}
                          >
                            <Heart
                              className="w-5 h-5"
                              fill={watchlistIds.has(auction.id) ? "currentColor" : "none"}
                            />
                          </button>
                        </div>

                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {auction.description}
                        </p>

                        <div className="space-y-2 mb-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4" />
                            {auction.location || "Location TBD"}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4" />
                            {getTimeRemaining(auction.auctionEndDate)}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-200">
                          <div>
                            <div className="text-xs text-slate-500">Starting Bid</div>
                            <div className="text-lg font-bold text-slate-900">
                              {formatPrice(auction.startingBid)}
                            </div>
                          </div>
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No auctions found matching your criteria</p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setCategory("");
                  setState("");
                  setPriceRange([0, 100000]);
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
