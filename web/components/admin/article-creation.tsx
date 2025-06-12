"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

interface StatusConfig {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StatusConfigMap {
  draft: StatusConfig;
  pending: StatusConfig;
  approved: StatusConfig;
  rejected: StatusConfig;
}

type ArticleStatus = keyof StatusConfigMap;

interface UserArticle {
  id: string;
  title: string;
  type: string;
  genre: string;
  subgenre?: string;
  cefrLevel: string;
  status: string;
  createdAt: string;
  wordCount: number;
  rating: number;
  passage: string;
  summary: string;
  imageDesc: string;
  topic: string;
}

const AdminArticleCreation = () => {
  const [articleType, setArticleType] = useState("");
  const [genre, setGenre] = useState("");
  const [subgenre, setSubgenre] = useState("");
  const [topic, setTopic] = useState("");
  const [cefrLevel, setCefrLevel] = useState("");
  const [wordCount, setWordCount] = useState(500);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTab, setCurrentTab] = useState("create");
  const [genres, setGenres] = useState<{
    fiction: Array<{
      value: string;
      label: string;
      subgenres: string[];
    }>;
    nonfiction: Array<{
      value: string;
      label: string;
      subgenres: string[];
    }>;
  }>({
    fiction: [],
    nonfiction: [],
  });
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<{
    title: string;
    passage: string;
    summary: string;
    imageDesc: string;
  } | null>(null);
  const [userArticles, setUserArticles] = useState<UserArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const { toast } = useToast();
  const [selectedArticleForEdit, setSelectedArticleForEdit] =
    useState<UserArticle | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const loadingMessages = [
    "🤖 AI is thinking really hard...",
    "📚 Crafting the perfect story...",
    "✨ Sprinkling some magic dust...",
    "🎨 Painting with words...",
    "🔮 Consulting the digital oracle...",
    "📝 Writing like Shakespeare...",
    "🌟 Creating literary magic...",
    "🚀 Launching creativity rockets...",
    "🎭 Directing the plot...",
    "🔥 Igniting imagination...",
    "💭 Downloading inspiration...",
    "🎪 Putting on a word show...",
    "🏗️ Building narrative architecture...",
    "🎵 Composing textual symphony...",
    "🌈 Mixing creative colors...",
  ];

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoadingGenres(true);
        const response = await fetch("/api/v1/articles/genres");
        if (!response.ok) {
          throw new Error("Failed to fetch genres");
        }
        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error);
        setGenres({ fiction: [], nonfiction: [] });
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;

    if (isGenerating) {
      setShowLoadingDialog(true);
      setLoadingProgress(0);
      setCurrentMessage(loadingMessages[0]);

      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 80) {
            return prev + Math.random() * 0.5 + 0.1;
          } else if (prev >= 95) {
            return prev;
          } else {
            return prev + Math.random() * 1 + 0.5;
          }
        });
      }, 1000);

      messageInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        setCurrentMessage(loadingMessages[randomIndex]);
      }, 3000);
    } else {
      setShowLoadingDialog(false);
      setLoadingProgress(0);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (currentTab === "manage") {
      fetchUserArticles();
    }
  }, [currentTab]);

  const fetchUserArticles = async () => {
    try {
      setIsLoadingArticles(true);
      const response = await fetch(
        "/api/v1/articles/generate/custom-generate/user-generated"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }
      const data = await response.json();
      setUserArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching user articles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive",
      });
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const handleApprove = async (articleId: string) => {
    try {
      setIsApproving(articleId);
      const response = await fetch(
        "/api/v1/articles/generate/custom-generate/user-generated",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ articleId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to approve article");
      }

      // Update the article status in the local state
      setUserArticles((prev) =>
        prev.map((article) =>
          article.id === articleId
            ? { ...article, status: "approved" }
            : article
        )
      );

      toast({
        title: "Success",
        description: "Article approved and published successfully!",
      });
    } catch (error) {
      console.error("Error approving article:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve article",
        variant: "destructive",
      });
    } finally {
      setIsApproving(null);
    }
  };

  const handleGenerate = async () => {
    if (!articleType || !genre || !topic || !cefrLevel) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/v1/articles/generate/custom-generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: articleType,
            genre,
            subgenre: subgenre || undefined,
            topic,
            cefrLevel,
            wordCount,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to generate article");
      }

      const data = await response.json();

      // Complete the progress
      setLoadingProgress(100);
      setCurrentMessage("🎉 Article generated successfully!");

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setGeneratedData({
        title: data.title,
        passage: data.passage,
        summary: data.summary,
        imageDesc: data.imageDesc,
      });
      setCurrentTab("preview");

      toast({
        title: "Success",
        description: "Article generated successfully!",
      });
    } catch (error) {
      console.error("Error generating article:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewArticle = (article: UserArticle) => {
    setSelectedArticleForEdit(article);
    setIsPreviewMode(true);
    setGeneratedData({
      title: article.title,
      passage: article.passage,
      summary: article.summary,
      imageDesc: article.imageDesc,
    });
    setCurrentTab("preview");
  };

  const handleEditArticle = (article: UserArticle) => {
    setSelectedArticleForEdit(article);
    setIsPreviewMode(false);
    setGeneratedData({
      title: article.title,
      passage: article.passage,
      summary: article.summary,
      imageDesc: article.imageDesc,
    });
    setCurrentTab("preview");
  };

  const handleSaveArticle = async () => {
    if (!selectedArticleForEdit || !generatedData) return;

    try {
      const response = await fetch(
        `/api/v1/articles/generate/custom-generate/user-generated/${selectedArticleForEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: generatedData.title,
            passage: generatedData.passage,
            summary: generatedData.summary,
            imageDesc: generatedData.imageDesc,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save article");
      }

      toast({
        title: "Success",
        description: "Article saved successfully!",
      });

      // Refresh the articles list
      fetchUserArticles();
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: "Failed to save article",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: ArticleStatus) => {
    const statusConfig: StatusConfigMap = {
      draft: { color: "bg-gray-100 text-gray-800", icon: Edit3 },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      rejected: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const currentGenres = articleType
    ? genres[articleType as keyof typeof genres] || []
    : [];
  const currentSubgenres = genre
    ? currentGenres.find((g) => g.value === genre)?.subgenres || []
    : [];

  return (
    <div className="w-full mx-auto px-6 space-y-6">
      {/* Loading Dialog */}
      <Dialog open={showLoadingDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              Generating Your Article
            </DialogTitle>
            <DialogDescription className="text-center">
              Please wait while AI creates your amazing content...
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Animated AI Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse opacity-30"></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-blue-600">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
              <Progress value={loadingProgress} className="h-2" />
            </div>

            {/* Current Message */}
            <div className="text-center">
              <p className="text-sm text-gray-700 animate-pulse min-h-[20px]">
                {currentMessage}
              </p>
            </div>

            {/* Animated Dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>

            {/* Fun Stats */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500 pt-2 border-t">
              <div>
                <div className="font-medium text-gray-700">Type</div>
                <div className="capitalize">{articleType}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Level</div>
                <div>{cefrLevel}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Words</div>
                <div>~{wordCount}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-start space-y-2">
        <h1 className="text-4xl font-bold">Article Creation & Management</h1>
        <p className="text-gray-600">
          Create, generate, and approve articles for Reading Advantage
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Article</TabsTrigger>
          <TabsTrigger value="preview">Preview & Edit</TabsTrigger>
          <TabsTrigger value="manage">Manage Articles</TabsTrigger>
        </TabsList>

        {/* Create Article Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                AI Article Generator
              </CardTitle>
              <CardDescription>
                Configure the parameters for your new article and let AI
                generate the content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Article Type</Label>
                    <RadioGroup
                      value={articleType}
                      onValueChange={setArticleType}
                      className="flex mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fiction" id="fiction" />
                        <Label htmlFor="fiction">Fiction</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nonfiction" id="nonfiction" />
                        <Label htmlFor="nonfiction">Non-Fiction</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Select
                      value={genre}
                      onValueChange={setGenre}
                      disabled={!articleType || isLoadingGenres}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingGenres
                              ? "Loading genres..."
                              : "Select a genre"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {currentGenres.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subgenre">Subgenre</Label>
                    <Select
                      value={subgenre}
                      onValueChange={setSubgenre}
                      disabled={!genre}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subgenre" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSubgenres.map((sg) => (
                          <SelectItem key={sg} value={sg}>
                            {sg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cefr">CEFR Level</Label>
                    <Select value={cefrLevel} onValueChange={setCefrLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select CEFR level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1">A1 - Beginner</SelectItem>
                        <SelectItem value="A2">A2 - Elementary</SelectItem>
                        <SelectItem value="B1">B1 - Intermediate</SelectItem>
                        <SelectItem value="B2">
                          B2 - Upper Intermediate
                        </SelectItem>
                        <SelectItem value="C1">C1 - Advanced</SelectItem>
                        <SelectItem value="C2">C2 - Proficient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="wordcount">
                      Target Word Count: {wordCount}
                    </Label>
                    <input
                      type="range"
                      min="200"
                      max="1500"
                      step="50"
                      value={wordCount}
                      onChange={(e) => setWordCount(parseInt(e.target.value))}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>200</span>
                      <span>1500</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="topic">Article Topic</Label>
                <Textarea
                  placeholder="Describe the specific topic or theme you want the article to cover..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
                  Error: {error}
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={
                  !articleType || !genre || !topic || !cefrLevel || isGenerating
                }
                className="w-full"
                size="lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Article with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview & Edit Tab - Updated */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-500" />
                {isPreviewMode ? "Article Preview" : "Article Editor"}
              </CardTitle>
              <CardDescription>
                {isPreviewMode
                  ? "Review the article content (read-only)"
                  : "Review and edit the generated content before approval"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedData ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      Type: {selectedArticleForEdit?.type || articleType}
                    </Badge>
                    <Badge variant="outline">
                      Genre: {selectedArticleForEdit?.genre || genre}
                    </Badge>
                    <Badge variant="outline">
                      Level: {selectedArticleForEdit?.cefrLevel || cefrLevel}
                    </Badge>
                    <Badge variant="outline">
                      Words: {selectedArticleForEdit?.wordCount || wordCount}
                    </Badge>
                    {isPreviewMode && (
                      <Badge variant="secondary">Preview Mode</Badge>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="article-title"
                        className="text-base font-medium"
                      >
                        Article Title
                      </Label>
                      <Input
                        id="article-title"
                        value={generatedData?.title || ""}
                        onChange={(e) =>
                          !isPreviewMode &&
                          setGeneratedData((prev) =>
                            prev ? { ...prev, title: e.target.value } : null
                          )
                        }
                        placeholder="Enter article title..."
                        className={`text-lg font-semibold ${
                          isPreviewMode ? "text-gray-400" : ""
                        }`}
                        readOnly={isPreviewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="article-content"
                        className="text-base font-medium"
                      >
                        Article Content
                      </Label>
                      <Textarea
                        id="article-content"
                        value={generatedData?.passage || ""}
                        onChange={(e) =>
                          !isPreviewMode &&
                          setGeneratedData((prev) =>
                            prev ? { ...prev, passage: e.target.value } : null
                          )
                        }
                        placeholder="Enter the main article content..."
                        rows={12}
                        className={`text-sm leading-relaxed ${
                          isPreviewMode ? "text-gray-400" : ""
                        }`}
                        readOnly={isPreviewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="article-summary"
                        className="text-base font-medium"
                      >
                        Summary
                      </Label>
                      <Textarea
                        id="article-summary"
                        value={generatedData?.summary || ""}
                        onChange={(e) =>
                          !isPreviewMode &&
                          setGeneratedData((prev) =>
                            prev ? { ...prev, summary: e.target.value } : null
                          )
                        }
                        placeholder="Enter article summary..."
                        rows={4}
                        className={`text-sm ${
                          isPreviewMode ? "text-gray-400" : ""
                        }`}
                        readOnly={isPreviewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="image-description"
                        className="text-base font-medium"
                      >
                        Image Description
                      </Label>
                      <Textarea
                        id="image-description"
                        value={generatedData?.imageDesc || ""}
                        onChange={(e) =>
                          !isPreviewMode &&
                          setGeneratedData((prev) =>
                            prev ? { ...prev, imageDesc: e.target.value } : null
                          )
                        }
                        placeholder="Describe the image for this article..."
                        rows={3}
                        className={`text-sm ${
                          isPreviewMode ? "text-gray-400" : ""
                        }`}
                        readOnly={isPreviewMode}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    {isPreviewMode ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentTab("manage")}
                        >
                          Back to Manage
                        </Button>
                        <Button
                          onClick={() => {
                            setIsPreviewMode(false);
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Switch to Edit Mode
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (selectedArticleForEdit) {
                              setCurrentTab("manage");
                            } else {
                              setIsPreviewMode(true);
                            }
                          }}
                        >
                          {selectedArticleForEdit
                            ? "Back to Manage"
                            : "Preview Mode"}
                        </Button>
                        {selectedArticleForEdit ? (
                          <Button onClick={() => handleApprove(selectedArticleForEdit.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve & Publish
                          </Button>
                        ) : (
                          <Button>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve & Publish
                          </Button>
                        )}
                        <Button onClick={handleSaveArticle} variant="outline">
                          Save as Draft
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No content generated yet. Go to the Create tab to generate
                    an article.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Articles Tab - Updated */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Article Management</CardTitle>
                  <CardDescription>
                    View and manage all your generated articles
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchUserArticles}
                  disabled={isLoadingArticles}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoadingArticles ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingArticles ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading articles...
                </div>
              ) : userArticles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No articles found. Create your first article to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userArticles.map((article) => (
                    <div
                      key={article.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{article.title}</h3>
                          <p className="text-sm text-gray-600">
                            {article.type} • {article.genre} •{" "}
                            {article.wordCount} words
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Topic: {article.topic}
                          </p>
                        </div>
                        {getStatusBadge(article.status as ArticleStatus)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>CEFR: {article.cefrLevel}</span>
                        <span>Rating: {article.rating}/5</span>
                        <span>
                          Created:{" "}
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewArticle(article)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditArticle(article)}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {article.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(article.id)}
                            disabled={isApproving === article.id}
                          >
                            {isApproving === article.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminArticleCreation;
