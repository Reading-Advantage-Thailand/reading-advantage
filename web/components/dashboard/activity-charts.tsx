"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Filter, 
  Download,
  RefreshCw
} from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface ActivityHeatmapProps {
  className?: string;
}

interface ActivityData {
  date: string;
  value: number;
  level: 'low' | 'medium' | 'high' | 'very-high';
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'reading' | 'practice' | 'assessment' | 'achievement';
  user?: string;
}

const chartConfig = {
  activity: {
    label: "Activity",
    color: "hsl(var(--chart-1))",
  },
  users: {
    label: "Users",
    color: "hsl(var(--chart-2))",
  },
  sessions: {
    label: "Sessions",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function ActivityCharts({ className }: ActivityHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<ActivityData[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("heatmap");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("1y");
  const [eventType, setEventType] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch activity data
      const activityRes = await fetch('/api/v1/metrics/activity');
      const activityData = await activityRes.json();

      // Generate mock heatmap data (in real app, this would come from API)
      const mockHeatmapData: ActivityData[] = [];
      const today = new Date();
      
      // Generate data for the past year (371 days to fill the grid)
      for (let i = 0; i < 371; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (370 - i)); // Start from 370 days ago to today
        
        // Simulate more realistic activity patterns
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const baseActivity = isWeekend ? 5 : 15; // Lower activity on weekends
        
        const value = Math.max(0, Math.floor(Math.random() * baseActivity) + Math.floor(Math.random() * 10));
        let level: ActivityData['level'] = 'low';
        if (value === 0) level = 'low';
        else if (value <= 5) level = 'low';
        else if (value <= 10) level = 'medium';
        else if (value <= 15) level = 'high';
        else level = 'very-high';
        
        mockHeatmapData.push({
          date: date.toISOString().split('T')[0],
          value,
          level
        });
      }

      // Generate mock timeline events
      const mockTimelineEvents: TimelineEvent[] = [
        {
          id: '1',
          title: 'Reading Session Completed',
          description: 'User completed "The Science of Learning"',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          type: 'reading',
          user: 'Alice Johnson'
        },
        {
          id: '2',
          title: 'Practice Exercise',
          description: 'Vocabulary practice session',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          type: 'practice',
          user: 'Bob Smith'
        },
        {
          id: '3',
          title: 'Assessment Completed',
          description: 'Level test passed with 85% score',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          type: 'assessment',
          user: 'Carol Davis'
        },
        {
          id: '4',
          title: 'Achievement Unlocked',
          description: 'Reading Streak: 7 days',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          type: 'achievement',
          user: 'David Wilson'
        },
      ];

      // Generate chart data for analytics
      const mockChartData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockChartData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          activity: Math.floor(Math.random() * 100) + 20,
          users: Math.floor(Math.random() * 50) + 10,
          sessions: Math.floor(Math.random() * 200) + 50,
        });
      }

      setHeatmapData(mockHeatmapData);
      setTimelineEvents(mockTimelineEvents);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, eventType]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleExport = () => {
    // Export functionality
    const dataToExport = {
      heatmap: heatmapData,
      timeline: timelineEvents,
      analytics: chartData,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredTimelineEvents = eventType === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(event => event.type === eventType);

  const getHeatmapColor = (level: ActivityData['level']) => {
    switch (level) {
      case 'very-high': return 'bg-green-600';
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-green-300';
      case 'low': return 'bg-gray-200 dark:bg-gray-700';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'reading': return '📖';
      case 'practice': return '✏️';
      case 'assessment': return '📊';
      case 'achievement': return '🏆';
      default: return '📌';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="heatmap">Activity Heatmap</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="1w">Last Week</option>
                  <option value="1m">Last Month</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <select 
                  value={eventType} 
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Events</option>
                  <option value="reading">Reading</option>
                  <option value="practice">Practice</option>
                  <option value="assessment">Assessment</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setDateRange("1y");
                      setEventType("all");
                    }}
                  >
                    Reset
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Activity Heatmap
              </CardTitle>
              <CardDescription>
                Daily activity levels over the past year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Heatmap Grid */}
                <div className="w-full overflow-x-auto">
                  <div className="flex flex-col gap-1 min-w-max">
                    {/* Create 7 rows for days of week */}
                    {Array.from({ length: 7 }).map((_, dayOfWeek) => (
                      <div key={dayOfWeek} className="flex gap-1 items-center">
                        <div className="w-8 text-xs text-muted-foreground">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: 53 }).map((_, weekIndex) => {
                            const dayIndex = weekIndex * 7 + dayOfWeek;
                            const day = heatmapData[dayIndex];
                            
                            if (!day) {
                              return <div key={weekIndex} className="w-3 h-3" />;
                            }
                            
                            return (
                              <div
                                key={weekIndex}
                                className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.level)} cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all`}
                                title={`${day.date}: ${day.value} activities`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Month labels */}
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                    <span key={index}>{month}</span>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
                    <div className="w-3 h-3 rounded-sm bg-green-300" />
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                    <div className="w-3 h-3 rounded-sm bg-green-600" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Timeline</CardTitle>
              <CardDescription>
                Latest user activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTimelineEvents.map((event, index) => (
                  <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-2xl">{getEventIcon(event.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      {event.user && (
                        <p className="text-xs text-muted-foreground">by {event.user}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.timestamp)}
                    </div>
                  </div>
                ))}
                
                {filteredTimelineEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No events found for the selected filters.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Trend</CardTitle>
                <CardDescription>
                  Activity levels over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="activity"
                      stroke="var(--color-activity)"
                      fill="var(--color-activity)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>
                  Users and sessions comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="users" fill="var(--color-users)" />
                    <Bar dataKey="sessions" fill="var(--color-sessions)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}