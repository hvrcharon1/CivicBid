import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import {
  MapPin,
  Heart,
  Clock,
  DollarSign,
  ExternalLink,
  Send,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  Navigation,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";

export default function AuctionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const auctionId = parseInt(id || "0");

  const [chatMessage, setChatMessage] = useState("");
  const [countdownTime, setCountdownTime] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch auction details
  const { data: auction, isLoading: auctionLoading } = trpc.auctions.getById.useQuery({
    id: auctionId,
  });

  // Fetch AI analysis
  const { data: analysis, isLoading: analysisLoading } = trpc.aiAnalysis.getAnalysis.useQuery({
    auctionId,
  });

  // Fetch chat history
  const chatHistoryQuery = user
    ? trpc.chat.getHistory.useQuery({ auctionId })
    : null;
  const chatHistory = (chatHistoryQuery?.data || []) as any[];

  // Send chat message
  const sendChatMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setChatMessage("");
    },
  });

  // Check if in watchlist
  const { data: isInWatchlist } = user
    ? trpc.watchlist.isInWatchlist.useQuery({ auctionId })
    : { data: false };

  const addToWatchlist = trpc.watchlist.add.useMutation();
  const removeFromWatchlist = trpc.watchlist.remove.useMutation();

  // Generate AI analysis if not exists
  const generateAnalysis = trpc.aiAnalysis.generateAnalysis.useMutation();

  // Update countdown timer
  useEffect(() => {
    if (!auction?.auctionEndDate) return;

    const updateCountdown = () => {
      const end = new Date(auction.auctionEndDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff < 0) {
        setCountdownTime("Auction Ended");
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setCountdownTime(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [auction?.auctionEndDate]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  if (auctionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Auction not found</p>
          <Link href="/auctions">
            <Button>Back to Auctions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist.mutate({ auctionId });
    } else {
      addToWatchlist.mutate({ auctionId });
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user) return;
    sendChatMessage.mutate({ auctionId, message: chatMessage });
  };

  const formatPrice = (price: number | string | null | undefined) => {
    if (!price) return "N/A";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/auctions">
            <Button variant="ghost">← Back to Auctions</Button>
          </Link>
          <button
            onClick={handleWatchlistToggle}
            className={`flex items-center gap-2 ${
              isInWatchlist ? "text-red-500" : "text-slate-400"
            }`}
          >
            <Heart
              className="w-6 h-6"
              fill={isInWatchlist ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-slate-200 to-slate-300 aspect-video flex items-center justify-center">
                {auction.imageUrls && Array.isArray(auction.imageUrls) && auction.imageUrls.length > 0 ? (
                  <img
                    src={auction.imageUrls[0]}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400">No image available</div>
                )}
              </div>
            </Card>

            {/* Auction Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  {auction.title}
                </h1>
                <p className="text-slate-600">{auction.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-slate-600 mb-1">Starting Bid</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatPrice(auction.startingBid)}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-slate-600 mb-1">Current Bid</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatPrice(auction.currentBid)}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-slate-600 mb-1">Bid Count</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {auction.bidCount}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-slate-600 mb-1">Time Left</div>
                  <div className="text-lg font-bold text-slate-900">
                    {countdownTime}
                  </div>
                </Card>
              </div>

              {/* Details */}
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-slate-900">Auction Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600">Location</div>
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      <MapPin className="w-4 h-4" />
                      {auction.location || "TBD"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">State</div>
                    <div className="text-slate-900 font-medium">{auction.state}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Category</div>
                    <div className="text-slate-900 font-medium capitalize">
                      {auction.category.replace("_", " ")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Agency</div>
                    <div className="text-slate-900 font-medium">{auction.agency}</div>
                  </div>
                </div>
              </Card>

              {/* Location Map */}
              {(auction.latitude || auction.longitude) && (
                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Property Location
                  </h3>
                  <div className="h-64 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 font-medium">Map View</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {auction.latitude && auction.longitude
                          ? `${parseFloat(String(auction.latitude)).toFixed(4)}°N, ${parseFloat(String(auction.longitude)).toFixed(4)}°E`
                          : "Location coordinates available"}
                      </p>
                      <Button className="mt-4 gap-2" variant="outline">
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Source Link */}
              <a href={auction.sourceUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full" size="lg">
                  <ExternalLink className="mr-2 w-4 h-4" />
                  View on Official Auction Site
                </Button>
              </a>
            </div>

            {/* AI Analysis & Chat Tabs */}
            <Tabs defaultValue="analysis" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="chat">AI Assistant</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-4">
                {analysisLoading ? (
                  <Card className="p-8 flex items-center justify-center">
                    <Spinner />
                  </Card>
                ) : analysis ? (
                  <div className="space-y-4">
                    {/* Summary */}
                    <Card className="p-6 space-y-3">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Summary
                      </h4>
                      <Streamdown>{analysis.summary}</Streamdown>
                    </Card>

                    {/* Fair Value */}
                    <Card className="p-6 space-y-3">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Estimated Fair Value
                      </h4>
                      <div className="text-3xl font-bold text-green-600">
                        {formatPrice(analysis.estimatedFairValue)}
                      </div>
                    </Card>

                    {/* Risk Flags */}
                    {(analysis as any)?.riskFlags && (analysis as any).riskFlags.length > 0 && (
                      <Card className="p-6 space-y-3 border-red-200 bg-red-50">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          Risk Flags
                        </h4>
                        <ul className="space-y-2">
                          {(analysis as any).riskFlags.map((flag: string, idx: number) => (
                            <li key={idx} className="text-sm text-slate-700">
                              • {flag}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {/* Bidding Strategy */}
                    <Card className="p-6 space-y-3">
                      <h4 className="font-semibold text-slate-900">Bidding Strategy</h4>
                      <Streamdown>{analysis.biddingStrategy}</Streamdown>
                    </Card>
                  </div>
                ) : (
                  <Card className="p-6 text-center space-y-4">
                    <p className="text-slate-600">No analysis available yet</p>
                    <Button
                      onClick={() =>
                        generateAnalysis.mutate({
                          auctionId,
                          title: auction.title,
                          description: auction.description || "",
                          category: auction.category,
                          startingBid: auction.startingBid ? Number(auction.startingBid) : undefined,
                        })
                      }
                      disabled={generateAnalysis.isPending}
                    >
                      {generateAnalysis.isPending ? "Generating..." : "Generate AI Analysis"}
                    </Button>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="chat" className="space-y-4">
                <Card className="p-6 space-y-4 h-96 flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {!user ? (
                      <div className="text-center py-8 text-slate-600">
                        <p className="mb-4">Sign in to chat with the AI assistant</p>
                        <Link href="/auth/login">
                          <Button>Sign In</Button>
                        </Link>
                      </div>
                    ) : (chatHistory || []).length === 0 ? (
                      <div className="text-center py-8 text-slate-600">
                        <p>Start a conversation about this auction</p>
                      </div>
                    ) : (
                      chatHistory.map((msg: any, idx: number) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              msg.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 text-slate-900"
                            }`}
                          >
                            <Streamdown>{msg.message as string}</Streamdown>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  {user && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask about this auction..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        disabled={sendChatMessage.isPending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendChatMessage.isPending || !chatMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 space-y-3 sticky top-20">
              <Button className="w-full" size="lg">
                <ExternalLink className="mr-2 w-4 h-4" />
                Place Bid
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleWatchlistToggle}
              >
                <Heart
                  className="mr-2 w-4 h-4"
                  fill={isInWatchlist ? "currentColor" : "none"}
                />
                {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              </Button>
            </Card>

            {/* Auction Status */}
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-slate-900">Status</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600">Auction Status</div>
                  <div className="text-slate-900 font-medium capitalize">
                    {auction.status}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Condition</div>
                  <div className="text-slate-900 font-medium capitalize">
                    {auction.condition || "Not specified"}
                  </div>
                </div>
              </div>
            </Card>

            {/* Share */}
            <Card className="p-6 space-y-3">
              <h3 className="font-semibold text-slate-900">Share</h3>
              <Button variant="outline" className="w-full">
                Copy Link
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
