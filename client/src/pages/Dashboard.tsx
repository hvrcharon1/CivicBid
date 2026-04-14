import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Clock, DollarSign, TrendingUp, Settings, LogOut, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user's watchlist
  const { data: watchlist = [] } = user ? trpc.watchlist.getList.useQuery() : { data: [] as any[] };

  // Fetch user's notifications
  const { data: notifications = [] } = user ? trpc.notifications.getList.useQuery({}) : { data: [] as any[] };

  // Fetch email preferences
  const { data: emailPrefs } = user ? trpc.preferences.getEmailPreferences.useQuery() : { data: null };

  const unreadNotifications = (notifications as any[]).filter((n: any) => !n.isRead).length;

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please sign in to access your dashboard</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user.name || user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auctions">
              <Button variant="outline">Browse Auctions</Button>
            </Link>
            <button onClick={handleLogout}>
              <Button variant="outline">
                <LogOut className="mr-2 w-4 h-4" />
                Sign Out
              </Button>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 space-y-4 sticky top-20">
              <h3 className="font-semibold text-slate-900">Quick Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600">Watchlist Items</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {(watchlist as any[]).length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Unread Alerts</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {unreadNotifications}
                  </div>
                </div>
              </div>
              <hr className="my-4" />
              <Link href="/settings">
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 w-4 h-4" />
                  Settings
                </Button>
              </Link>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="watchlist" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="watchlist">
                  <Heart className="mr-2 w-4 h-4" />
                  Watchlist
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="mr-2 w-4 h-4" />
                  Alerts ({unreadNotifications})
                </TabsTrigger>
                <TabsTrigger value="recommendations">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Recommendations
                </TabsTrigger>
              </TabsList>

              {/* Watchlist Tab */}
              <TabsContent value="watchlist" className="space-y-4">
                {(watchlist as any[]).length === 0 ? (
                  <Card className="p-12 text-center">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No items in your watchlist yet</p>
                    <Link href="/auctions">
                      <Button>Browse Auctions</Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {(watchlist as any[]).map((item: any) => (
                      <Link key={item.id} href={`/auction/${item.auctionId}`}>
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-2">
                                {item.auction?.title}
                              </h3>
                              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                {item.auction?.description}
                              </p>
                              <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1 text-slate-600">
                                  <DollarSign className="w-4 h-4" />
                                  Starting: ${item.auction?.startingBid}
                                </div>
                                <div className="flex items-center gap-1 text-slate-600">
                                  <Clock className="w-4 h-4" />
                                  Ends: {new Date(item.auction?.auctionEndDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button size="sm">View</Button>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                {(notifications as any[]).length === 0 ? (
                  <Card className="p-12 text-center">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No notifications yet</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {(notifications as any[]).map((notif: any) => (
                      <Card
                        key={notif.id}
                        className={`p-6 ${!notif.isRead ? "bg-blue-50 border-blue-200" : ""}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              {notif.title}
                            </h4>
                            <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {notif.actionUrl && (
                            <a href={notif.actionUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </a>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                <Card className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    Personalized recommendations coming soon! Add items to your watchlist to get started.
                  </p>
                  <Link href="/auctions">
                    <Button>Explore Auctions</Button>
                  </Link>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
