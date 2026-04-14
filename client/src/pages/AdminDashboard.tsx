import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Database,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [syncFrequency, setSyncFrequency] = useState("1h");
  const [maxAuctionsPerSource, setMaxAuctionsPerSource] = useState("5000");

  // Fetch data sources (placeholder - admin procedures not yet implemented)
  const dataSources: any[] = [];

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">You don't have permission to access this page</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Manage data sources, review aggregations, and view analytics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Total Auctions</div>
                <div className="text-3xl font-bold text-slate-900">12,543</div>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Active Users</div>
                <div className="text-3xl font-bold text-slate-900">2,847</div>
              </div>
              <Users className="w-10 h-10 text-green-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Data Sources</div>
                <div className="text-3xl font-bold text-slate-900">{(dataSources as any[]).length}</div>
              </div>
              <Database className="w-10 h-10 text-purple-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Last Sync</div>
                <div className="text-lg font-bold text-slate-900">2 hours ago</div>
              </div>
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources">
              <Database className="mr-2 w-4 h-4" />
              Data Sources
            </TabsTrigger>
            <TabsTrigger value="aggregations">
              <BarChart3 className="mr-2 w-4 h-4" />
              Aggregations
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Data Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            {/* Add New Source */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Add Data Source</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Source name (e.g., GSA Auctions)"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                  />
                  <Input
                    placeholder="API endpoint URL"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                  />
                </div>
                <Button className="w-full md:w-auto">Add Source</Button>
              </div>
            </Card>

            {/* Existing Sources */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Connected Sources</h3>
              {(dataSources as any[]).length === 0 ? (
                <Card className="p-8 text-center">
                  <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No data sources configured yet</p>
                </Card>
              ) : (
                (dataSources as any[]).map((source: any) => (
                  <Card key={source.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-2">{source.name}</h4>
                        <p className="text-sm text-slate-600 mb-2">{source.apiEndpoint}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-slate-600">
                            Auctions: {source.auctionCount || 0}
                          </span>
                          <span className="text-slate-600">
                            Last sync: {new Date(source.lastSyncAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {source.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Aggregations Tab */}
          <TabsContent value="aggregations" className="space-y-6">
            <Card className="p-8">
              <h3 className="font-semibold text-slate-900 mb-4">Aggregation Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">Overall Progress</span>
                    <span className="text-sm text-slate-600">85%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-700 font-medium mb-1">Completed</div>
                    <div className="text-2xl font-bold text-green-900">10,673</div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-700 font-medium mb-1">In Progress</div>
                    <div className="text-2xl font-bold text-yellow-900">1,870</div>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm text-red-700 font-medium mb-1">Failed</div>
                    <div className="text-2xl font-bold text-red-900">0</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Aggregations */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Aggregations</h3>
              <div className="space-y-3">
                {[
                  { source: "GSA Auctions", count: 245, status: "completed", time: "2 hours ago" },
                  { source: "GovPlanet", count: 189, status: "completed", time: "4 hours ago" },
                  { source: "PropertyRoom", count: 156, status: "in-progress", time: "30 mins ago" },
                  { source: "IAAI", count: 312, status: "completed", time: "6 hours ago" },
                ].map((agg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">{agg.source}</div>
                      <div className="text-sm text-slate-600">{agg.count} auctions</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">{agg.time}</span>
                      {agg.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Sync Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Sync Frequency
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    value={syncFrequency}
                    onChange={(e) => setSyncFrequency(e.target.value)}
                  >
                    <option value="1h">Every 1 hour</option>
                    <option value="2h">Every 2 hours</option>
                    <option value="4h">Every 4 hours</option>
                    <option value="6h">Every 6 hours</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Max Auctions Per Source
                  </label>
                  <Input
                    type="number"
                    value={maxAuctionsPerSource}
                    onChange={(e) => setMaxAuctionsPerSource(e.target.value)}
                  />
                </div>
                <Button>Save Settings</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Maintenance</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Run Full Sync Now
                </Button>
                <Button variant="outline" className="w-full">
                  Clear Cache
                </Button>
                <Button variant="outline" className="w-full">
                  Verify Data Integrity
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
