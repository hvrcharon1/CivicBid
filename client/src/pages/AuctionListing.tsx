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
import { MapPin, Heart, Clock, DollarSign, Grid3x3, List, Search, Building2, Map } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AuctionListing() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [state, setState] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState<"endDate" | "price" | "newest">("endDate");
  const [portalFilter, setPortalFilter] = useState<"all" | "federal" | "state">("all");
  const [showMap, setShowMap] = useState(false);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  // Fetch available portals
  const { data: federalPortals = [] } = trpc.portals.getFederal.useQuery();
  const { data: statePortals = [] } = trpc.portals.getState.useQuery();

  // Fetch auctions with filters
  const { data: auctions, isLoading } = trpc.auctions.search.useQuery({
    query: searchQuery || undefined,
    category: category !== "all" ? category : undefined,
    state: state !== "all" ? state : undefined,
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

  // Filter auctions by map bounds if bounds are set
  const filteredAuctions = useMemo(() => {
    if (!auctions || !mapBounds) return auctions;
    
    return auctions.filter((auction: any) => {
      if (!auction.latitude || !auction.longitude) return true;
      
      const lat = parseFloat(String(auction.latitude));
      const lng = parseFloat(String(auction.longitude));
      
      return (
        lat >= mapBounds.south &&
        lat <= mapBounds.north &&
        lng >= mapBounds.west &&
        lng <= mapBounds.east
      );
    });
  }, [auctions, mapBounds]);

  const displayAuctions = showMap && mapBounds ? filteredAuctions : auctions;

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

          {/* Search Bar and Map Toggle */}
          <div className="flex gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showMap ? "default" : "outline"}
              onClick={() => setShowMap(!showMap)}
              className="gap-2"
            >
              <Map className="w-4 h-4" />
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {showMap && (
        <div className="bg-white border-b border-slate-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-96 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Map View - Geospatial Filtering</p>
                <p className="text-sm text-slate-500 mt-1">
                  {mapBounds 
                    ? `Showing ${filteredAuctions?.length || 0} auctions in selected area`
                    : "Click and drag to filter auctions by location"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <SelectItem value="all">All categories</SelectItem>
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
                    <SelectItem value="all">All states</SelectItem>
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

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Auction Source
                </label>
                <div className="space-y-2">
                  <Button
                    variant={portalFilter === "all" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setPortalFilter("all")}
                  >
                    All Sources ({federalPortals.length + statePortals.length})
                  </Button>
                  <Button
                    variant={portalFilter === "federal" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setPortalFilter("federal")}
                  >
                    Federal ({federalPortals.length})
                  </Button>
                  <Button
                    variant={portalFilter === "state" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setPortalFilter("state")}
                  >
                    State ({statePortals.length})
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Showing {displayAuctions?.length || 0} auctions
                  {mapBounds && ` in selected area`}
                </p>
              </div>
              {mapBounds && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMapBounds(null)}
                >
                  Clear Map Filter
                </Button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <div className="h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full"></div>
                </div>
                <p className="mt-4 text-slate-600">Loading auctions...</p>
              </div>
            )}

            {/* Auctions Grid */}
            {!isLoading && viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayAuctions?.map((auction: any) => (
                  <Link key={auction.id} href={`/auction/${auction.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="bg-slate-200 h-48 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-slate-400" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                          {auction.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {auction.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{auction.state}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-slate-900">
                              {formatPrice(auction.currentBid || auction.startingPrice)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              {getTimeRemaining(auction.endDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              handleWatchlistToggle(auction.id);
                            }}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                watchlistIds.has(auction.id)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                          </Button>
                          <Button className="flex-1">View Details</Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Auctions List */}
            {!isLoading && viewMode === "list" && (
              <div className="space-y-4">
                {displayAuctions?.map((auction: any) => (
                  <Link key={auction.id} href={`/auction/${auction.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-slate-200 rounded flex-shrink-0 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {auction.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-1">
                            {auction.description}
                          </p>
                          <div className="flex gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{auction.state}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold">
                                {formatPrice(auction.currentBid || auction.startingPrice)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>{getTimeRemaining(auction.endDate)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-col">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleWatchlistToggle(auction.id);
                            }}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                watchlistIds.has(auction.id)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                          </Button>
                          <Button size="sm">Details</Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && displayAuctions?.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No auctions found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
