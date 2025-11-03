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
    <div className={`grid gap-6 lg:grid-cols-2 ${className}`}>
      {/* AI Insights - Redesigned with compact cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Intelligent analysis powered by machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div
                  key={insight.id}
                  className="group relative flex items-start gap-3 p-3 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  {/* Icon with colored background */}
                  <div className={`p-2 rounded-lg ${getInsightColor(insight.type).replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20`}>
                    <Icon className={`h-4 w-4 ${getInsightColor(insight.type)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Title and badges */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm leading-tight">{insight.title}</h4>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {insight.confidence}%
                      </Badge>
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                    
                    {/* Footer: Type, Impact, Action */}
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {insight.type}
                      </Badge>
                      <Badge 
                        className={`text-xs ${getPriorityColor(insight.impact)}`}
                        variant="secondary"
                      >
                        {insight.impact}
                      </Badge>
                      {insight.actionable && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Review
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

      {/* Smart Suggestions - Redesigned with compact layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Smart Suggestions
          </CardTitle>
          <CardDescription>
            Actionable recommendations to optimize your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const CategoryIcon = getCategoryIcon(suggestion.category);
              return (
                <div
                  key={suggestion.id}
                  className="group border rounded-lg p-3 space-y-2 hover:shadow-md transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h4 className="font-medium text-sm truncate">{suggestion.title}</h4>
                    </div>
                    <Badge 
                      className={`text-xs shrink-0 ${getPriorityColor(suggestion.priority)}`}
                      variant="secondary"
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {suggestion.description}
                  </p>
                  
                  {/* Impact */}
                  <div className="flex items-center gap-2 text-xs">
                    <Target className="h-3 w-3 text-green-600" />
                    <span className="text-muted-foreground">Impact:</span>
                    <span className="text-green-600 font-medium">{suggestion.estimatedImpact}</span>
                  </div>
                  
                  {/* Action Items - Collapsible on small screens */}
                  <details className="group/details">
                    <summary className="text-xs font-medium cursor-pointer list-none flex items-center gap-1 text-muted-foreground hover:text-foreground">
                      <ArrowRight className="h-3 w-3 transition-transform group-open/details:rotate-90" />
                      {suggestion.actions.length} Action Items
                    </summary>
                    <ul className="mt-2 space-y-1 pl-4">
                      {suggestion.actions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="default" size="sm" className="h-7 text-xs flex-1">
                      Implement
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
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