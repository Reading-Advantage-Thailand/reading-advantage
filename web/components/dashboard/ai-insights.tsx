"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Users,
  BookOpen,
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  category: string;
  data?: any;
}

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'engagement' | 'content' | 'user-experience';
  estimatedImpact: string;
  actions: string[];
}

interface AIInsightsProps {
  className?: string;
}

export default function AIInsights({ className }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAIData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch AI summary data
        const response = await fetch('/api/v1/ai/summary');
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI insights');
        }

        const data = await response.json();

        // Mock insights and suggestions if API doesn't return them
        const mockInsights: AIInsight[] = [
          {
            id: '1',
            type: 'trend',
            title: 'Reading Engagement Spike',
            description: 'User engagement has increased by 34% over the past week, particularly in science articles.',
            impact: 'high',
            confidence: 89,
            actionable: true,
            category: 'engagement',
            data: { change: '+34%', timeframe: '7 days' }
          },
          {
            id: '2',
            type: 'anomaly',
            title: 'Unusual Drop in Completion Rates',
            description: 'Articles in Level B2 showing 23% lower completion rates than usual. This may indicate content difficulty issues.',
            impact: 'medium',
            confidence: 76,
            actionable: true,
            category: 'performance',
            data: { change: '-23%', level: 'B2' }
          },
          {
            id: '3',
            type: 'recommendation',
            title: 'Optimize Content Mix',
            description: 'Based on user preferences, increasing fiction content by 15% could improve overall engagement.',
            impact: 'medium',
            confidence: 82,
            actionable: true,
            category: 'content',
            data: { recommendedIncrease: '15%', contentType: 'fiction' }
          },
          {
            id: '4',
            type: 'prediction',
            title: 'Peak Usage Forecast',
            description: 'Predicted 45% increase in activity during upcoming school holidays. Consider scaling resources.',
            impact: 'high',
            confidence: 91,
            actionable: true,
            category: 'infrastructure',
            data: { predictedIncrease: '45%', timeframe: 'school holidays' }
          }
        ];

        const mockSuggestions: SmartSuggestion[] = [
          {
            id: '1',
            title: 'Implement Reading Streaks',
            description: 'Add a reading streak feature to boost daily engagement and retention.',
            priority: 'high',
            category: 'engagement',
            estimatedImpact: '+25% daily active users',
            actions: [
              'Design streak visualization UI',
              'Implement streak tracking logic',
              'Add streak rewards system',
              'A/B test the feature'
            ]
          },
          {
            id: '2',
            title: 'Personalized Reading Paths',
            description: 'Create AI-curated reading paths based on user interests and performance.',
            priority: 'medium',
            category: 'user-experience',
            estimatedImpact: '+18% completion rate',
            actions: [
              'Analyze user reading patterns',
              'Build recommendation algorithm',
              'Create path visualization',
              'Test with pilot users'
            ]
          },
          {
            id: '3',
            title: 'Performance Dashboard for Teachers',
            description: 'Provide teachers with detailed analytics on student progress and areas for improvement.',
            priority: 'high',
            category: 'performance',
            estimatedImpact: '+30% teacher satisfaction',
            actions: [
              'Survey teacher requirements',
              'Design analytics interface',
              'Implement data aggregation',
              'Provide training materials'
            ]
          }
        ];

        setInsights(data.insights || mockInsights);
        setSuggestions(data.suggestions || mockSuggestions);
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        setError('Failed to load AI insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAIData();
  }, []);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      case 'prediction': return Target;
      default: return Brain;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return 'text-green-600';
      case 'anomaly': return 'text-orange-600';
      case 'recommendation': return 'text-blue-600';
      case 'prediction': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return Users;
      case 'performance': return TrendingUp;
      case 'content': return BookOpen;
      case 'user-experience': return Sparkles;
      default: return Zap;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Intelligent analysis of your platform data and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div
                  key={insight.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${getInsightColor(insight.type)}`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`text-xs ${getPriorityColor(insight.impact)}`}
                        variant="secondary"
                      >
                        {insight.impact} impact
                      </Badge>
                      {insight.actionable && (
                        <Button variant="outline" size="sm">
                          Take Action
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Smart Suggestions
          </CardTitle>
          <CardDescription>
            AI-powered recommendations to improve your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion) => {
              const CategoryIcon = getCategoryIcon(suggestion.category);
              return (
                <div
                  key={suggestion.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{suggestion.title}</h4>
                    </div>
                    <Badge 
                      className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                      variant="secondary"
                    >
                      {suggestion.priority} priority
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Estimated Impact:</span>
                    <span className="text-green-600">{suggestion.estimatedImpact}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Action Items:</span>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {suggestion.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="default" size="sm">
                      Implement
                    </Button>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}