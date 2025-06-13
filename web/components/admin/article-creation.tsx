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
  Save,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  cefr_level: string;
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
  const [loadingType, setLoadingType] = useState<
    "generate" | "save" | "approve"
  >("generate");
  const { toast } = useToast();
  const [selectedArticleForEdit, setSelectedArticleForEdit] =
    useState<UserArticle | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(
    null
  );
  const [originalContent, setOriginalContent] = useState<{
    title: string;
    passage: string;
    summary: string;
    imageDesc: string;
  } | null>(null);
  const [showApprovePublishDialog, setShowApprovePublishDialog] =
    useState(false);
  const [hasContentChanged, setHasContentChanged] = useState(false);

  const loadingMessages = {
    generate: [
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
    ],
    save: [
      "💾 Saving your masterpiece...",
      "📝 Updating article content...",
      "✏️ Polishing the draft...",
      "🔄 Syncing changes...",
      "📋 Organizing content...",
      "💫 Preserving your edits...",
      "🎯 Finalizing updates...",
      "📚 Storing your work...",
      "✨ Almost there...",
      "🎉 Wrapping things up...",
    ],
    approve: [
      "✅ Processing approval...",
      "🚀 Publishing to platform...",
      "📢 Making it live...",
      "🌟 Final quality check...",
      "📋 Updating status...",
      "🎯 Almost published...",
      "✨ Going live...",
      "🎉 Publishing complete...",
    ],
  };

  const getLoadingTitle = () => {
    switch (loadingType) {
      case "generate":
        return "Generating Your Article";
      case "save":
        return "Saving Article Draft";
      case "approve":
        return "Approving & Publishing Article";
      default:
        return "Processing...";
    }
  };

  const getLoadingDescription = () => {
    switch (loadingType) {
      case "generate":
        return "Please wait while AI creates your amazing content...";
      case "save":
        return "Saving your changes as a draft...";
      case "approve":
        return "Publishing your article to the platform...";
      default:
        return "Please wait...";
    }
  };

  const getLoadingIcon = () => {
    switch (loadingType) {
      case "generate":
        return <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "save":
        return <Save className="h-5 w-5 text-green-500 animate-pulse" />;
      case "approve":
        return (
          <CheckCircle2 className="h-5 w-5 text-purple-500 animate-pulse" />
        );
      default:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const checkContentChanged = () => {
    if (!originalContent || !generatedData) return false;

    return (
      originalContent.title !== generatedData.title ||
      originalContent.passage !== generatedData.passage ||
      originalContent.summary !== generatedData.summary ||
      originalContent.imageDesc !== generatedData.imageDesc
    );
  };

  useEffect(() => {
    setHasContentChanged(checkContentChanged());
  }, [generatedData, originalContent]);

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
      setCurrentMessage(loadingMessages[loadingType][0]);

      const getProgressConfig = () => {
        switch (loadingType) {
          case "generate":
            return {
              interval: 1000,
              increment: () => {
                return Math.random() * 1.5 + 0.2;
              },
            };
          case "save":
            return {
              interval: 500,
              increment: () => {
                return Math.random() * 2.85 + 0.5;
              },
            };
          case "approve":
            return {
              interval: 800,
              increment: () => {
                return Math.random() * 1.2 + 0.8;
              },
            };
          default:
            return {
              interval: 1000,
              increment: () => Math.random() * 1 + 0.5,
            };
        }
      };

      const config = getProgressConfig();

      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          const increment = config.increment();
          const newProgress = prev + increment;

          if (newProgress >= 98) {
            return Math.min(98, prev + increment * 0.1);
          }

          return newProgress;
        });
      }, config.interval);

      messageInterval = setInterval(() => {
        const messages = loadingMessages[loadingType];
        const randomIndex = Math.floor(Math.random() * messages.length);
        setCurrentMessage(messages[randomIndex]);
      }, 3000);
    } else {
      setShowLoadingDialog(false);
      setLoadingProgress(0);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [isGenerating, loadingType]);

  useEffect(() => {
    if (currentTab === "manage") {
      fetchUserArticles();
    }
  }, [currentTab]);

  useEffect(() => {
    if (
      !showLoadingDialog &&
      !showApprovalDialog &&
      !showApprovePublishDialog
    ) {
      document.body.style.pointerEvents = "auto";
    }
  }, [showLoadingDialog, showApprovalDialog, showApprovePublishDialog]);

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

  const handleApprove = (articleId: string) => {
    setPendingApprovalId(articleId);
    setShowApprovalDialog(true);
  };

  const confirmApproval = async () => {
    if (!pendingApprovalId) return;

    try {
      setLoadingType("approve");
      setIsGenerating(true);
      setIsApproving(pendingApprovalId);
      setShowApprovalDialog(false);

      const response = await fetch(
        "/api/v1/articles/generate/custom-generate/user-generated",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ articleId: pendingApprovalId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to approve article");
      }

      // Complete the progress
      setLoadingProgress(100);
      setCurrentMessage("🎉 Article approved and published successfully!");

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the article status in the local state
      setUserArticles((prev) =>
        prev.map((article) =>
          article.id === pendingApprovalId
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
      // Force reset all states immediately
      setIsGenerating(false);
      setIsApproving(null);
      setPendingApprovalId(null);
      setLoadingProgress(0);
      setCurrentMessage("");
      setShowLoadingDialog(false);
      document.body.style.pointerEvents = "auto";
    }
  };

  const cancelApproval = () => {
    setShowApprovalDialog(false);
    setPendingApprovalId(null);
  };

  const handleGenerate = async () => {
    if (!articleType || !genre || !topic || !cefrLevel) {
      return;
    }

    setLoadingType("generate");
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

      const newGeneratedData = {
        title: data.title,
        passage: data.passage,
        summary: data.summary,
        imageDesc: data.imageDesc,
      };

      setGeneratedData(newGeneratedData);
      // เซ็ต original content เป็นเนื้อหาที่เพิ่งสร้าง
      setOriginalContent(newGeneratedData);
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
      // Force reset loading states immediately
      setIsGenerating(false);
      setLoadingProgress(0);
      setCurrentMessage("");
      setShowLoadingDialog(false);
      document.body.style.pointerEvents = "auto";
    }
  };

  const handlePreviewArticle = (article: UserArticle) => {
    setSelectedArticleForEdit(article);
    setIsPreviewMode(true);
    const articleData = {
      title: article.title,
      passage: article.passage,
      summary: article.summary,
      imageDesc: article.imageDesc,
    };
    setGeneratedData(articleData);
    // เซ็ต original content
    setOriginalContent(articleData);
    setCurrentTab("preview");
  };

  const handleEditArticle = (article: UserArticle) => {
    setSelectedArticleForEdit(article);
    setIsPreviewMode(false);
    const articleData = {
      title: article.title,
      passage: article.passage,
      summary: article.summary,
      imageDesc: article.imageDesc,
    };
    setGeneratedData(articleData);
    // เซ็ต original content
    setOriginalContent(articleData);
    setCurrentTab("preview");
  };

  const handleSaveArticle = async () => {
    if (!selectedArticleForEdit || !generatedData) return;

    try {
      setLoadingType("save");
      setIsGenerating(true);

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
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to save article");
      }

      // Complete the progress
      setLoadingProgress(100);
      setCurrentMessage("💾 Article saved successfully!");

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Article saved as draft successfully!",
      });

      // Refresh the articles list
      await fetchUserArticles();

      // Update local state และ original content
      setSelectedArticleForEdit((prev) =>
        prev
          ? { ...prev, ...generatedData, updatedAt: new Date().toISOString() }
          : null
      );
      setOriginalContent(generatedData);
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save article",
        variant: "destructive",
      });
    } finally {
      // Force reset loading states immediately
      setIsGenerating(false);
      setLoadingProgress(0);
      setCurrentMessage("");
      setShowLoadingDialog(false);
      document.body.style.pointerEvents = "auto";
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

  const handleApprovePublishClick = () => {
    setShowApprovePublishDialog(true);
  };

  const confirmApprovePublish = async () => {
    setShowApprovePublishDialog(false);

    if (hasContentChanged) {
      // ถ้ามีการแก้ไข ใช้ handleApproveAndPublish
      await handleApproveAndPublish();
    } else {
      // ถ้าไม่มีการแก้ไข ใช้ confirmApproval โดยตรง
      if (selectedArticleForEdit) {
        setPendingApprovalId(selectedArticleForEdit.id);
        await confirmApproval();
      }
    }
  };

  const cancelApprovePublish = () => {
    setShowApprovePublishDialog(false);
  };

  const handleApproveAndPublish = async () => {
    if (!selectedArticleForEdit || !generatedData) return;

    try {
      setLoadingType("approve");
      setIsGenerating(true);

      // First update the article with new data
      const updateResponse = await fetch(
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

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.details || "Failed to update article");
      }

      // Then approve the article
      const approveResponse = await fetch(
        "/api/v1/articles/generate/custom-generate/user-generated",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ articleId: selectedArticleForEdit.id }),
        }
      );

      if (!approveResponse.ok) {
        const errorData = await approveResponse.json();
        throw new Error(errorData.details || "Failed to approve article");
      }

      // Complete the progress
      setLoadingProgress(100);
      setCurrentMessage("🎉 Article approved and published successfully!");

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Article approved and published successfully!",
      });

      // Refresh the articles list
      await fetchUserArticles();

      // Update local state
      setUserArticles((prev) =>
        prev.map((article) =>
          article.id === selectedArticleForEdit.id
            ? { ...article, status: "approved", ...generatedData }
            : article
        )
      );

      // Go back to manage tab
      setCurrentTab("manage");
    } catch (error) {
      console.error("Error approving article:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve article",
        variant: "destructive",
      });
    } finally {
      // Force reset all states immediately
      setIsGenerating(false);
      setLoadingProgress(0);
      setCurrentMessage("");
      setShowLoadingDialog(false);
      setSelectedArticleForEdit(null);
      setGeneratedData(null);
      setOriginalContent(null);
      setHasContentChanged(false);
      document.body.style.pointerEvents = "auto";
    }
  };

  const currentGenres = articleType
    ? genres[articleType as keyof typeof genres] || []
    : [];
  const currentSubgenres = genre
    ? currentGenres.find((g) => g.value === genre)?.subgenres || []
    : [];

  const isArticlePublished = (status: string) => {
    return status === "approved" || status === "published";
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 space-y-6">
      {/* Approval Confirmation Dialog */}
      <AlertDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
      >
        <AlertDialogContent className="max-w-sm sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              Confirm Article Approval
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm">
              <p>Are you sure you want to approve and publish this article?</p>
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <p className="text-sm text-orange-800 font-medium">
                  ⚠️ Warning: Once published, this article cannot be edited or
                  modified.
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Please make sure all content is accurate and properly reviewed
                  before proceeding.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={cancelApproval}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApproval}
              className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
            >
              Yes, Approve & Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve & Publish Confirmation Dialog */}
      <AlertDialog
        open={showApprovePublishDialog}
        onOpenChange={setShowApprovePublishDialog}
      >
        <AlertDialogContent className="max-w-sm sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Approve & Publish Article
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-sm">
              <p>Are you sure you want to approve and publish this article?</p>

              {hasContentChanged && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800 font-medium">
                    📝 Content Changes Detected
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your changes will be saved and then the article will be
                    published.
                  </p>
                </div>
              )}

              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <p className="text-sm text-orange-800 font-medium">
                  ⚠️ Warning: Once published, this article cannot be edited or
                  modified.
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Please make sure all content is accurate and properly reviewed
                  before proceeding.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={cancelApprovePublish}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprovePublish}
              className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
            >
              {hasContentChanged ? "Save & Publish" : "Approve & Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Dialog */}
      <Dialog open={showLoadingDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center text-sm sm:text-base">
              {getLoadingIcon()}
              {getLoadingTitle()}
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              {getLoadingDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Animated AI Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <Loader2
                  className={`h-12 w-12 sm:h-16 sm:w-16 animate-spin ${
                    loadingType === "generate"
                      ? "text-blue-500"
                      : loadingType === "save"
                      ? "text-green-500"
                      : "text-purple-500"
                  }`}
                />
                <div
                  className={`absolute inset-0 rounded-full animate-pulse opacity-30 ${
                    loadingType === "generate"
                      ? "bg-blue-100"
                      : loadingType === "save"
                      ? "bg-green-100"
                      : "bg-purple-100"
                  }`}
                ></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Progress</span>
                <span
                  className={`font-medium ${
                    loadingType === "generate"
                      ? "text-blue-600"
                      : loadingType === "save"
                      ? "text-green-600"
                      : "text-purple-600"
                  }`}
                >
                  {Math.round(loadingProgress)}%
                </span>
              </div>
              <Progress value={loadingProgress} className="h-2" />
            </div>

            {/* Current Message */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-700 animate-pulse min-h-[20px]">
                {currentMessage}
              </p>
            </div>

            {/* Animated Dots */}
            <div className="flex justify-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  loadingType === "generate"
                    ? "bg-blue-400"
                    : loadingType === "save"
                    ? "bg-green-400"
                    : "bg-purple-400"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  loadingType === "generate"
                    ? "bg-blue-400"
                    : loadingType === "save"
                    ? "bg-green-400"
                    : "bg-purple-400"
                }`}
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  loadingType === "generate"
                    ? "bg-blue-400"
                    : loadingType === "save"
                    ? "bg-green-400"
                    : "bg-purple-400"
                }`}
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>

            {/* Fun Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs text-gray-500 pt-2 border-t">
              <div>
                <div className="font-medium text-gray-700">Type</div>
                <div className="capitalize">
                  {selectedArticleForEdit?.type || articleType}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Level</div>
                <div>{selectedArticleForEdit?.cefr_level || cefrLevel}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Words</div>
                <div>~{selectedArticleForEdit?.wordCount || wordCount}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="text-start space-y-2">
        <h1 className="text-2xl sm:text-4xl font-bold">
          Article Creation & Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Create, generate, and approve articles for Reading Advantage
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
          <TabsTrigger value="create">Create Article</TabsTrigger>
          <TabsTrigger value="preview">Preview & Edit</TabsTrigger>
          <TabsTrigger value="manage">Manage Articles</TabsTrigger>
        </TabsList>

        {/* Create Article Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                AI Article Generator
              </CardTitle>
              <CardDescription className="text-sm">
                Configure the parameters for your new article and let AI
                generate the content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type" className="text-sm sm:text-base">
                      Article Type
                    </Label>
                    <RadioGroup
                      value={articleType}
                      onValueChange={setArticleType}
                      className="flex flex-col sm:flex-row mt-2 gap-4 sm:gap-8"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fiction" id="fiction" />
                        <Label
                          htmlFor="fiction"
                          className="text-sm sm:text-base"
                        >
                          Fiction
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nonfiction" id="nonfiction" />
                        <Label
                          htmlFor="nonfiction"
                          className="text-sm sm:text-base"
                        >
                          Non-Fiction
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="genre" className="text-sm sm:text-base">
                      Genre
                    </Label>
                    <Select
                      value={genre}
                      onValueChange={setGenre}
                      disabled={!articleType || isLoadingGenres}
                    >
                      <SelectTrigger className="text-sm">
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
                          <SelectItem
                            key={g.value}
                            value={g.value}
                            className="text-sm"
                          >
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subgenre" className="text-sm sm:text-base">
                      Subgenre
                    </Label>
                    <Select
                      value={subgenre}
                      onValueChange={setSubgenre}
                      disabled={!genre}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select a subgenre" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSubgenres.map((sg) => (
                          <SelectItem key={sg} value={sg} className="text-sm">
                            {sg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cefr" className="text-sm sm:text-base">
                      CEFR Level
                    </Label>
                    <Select value={cefrLevel} onValueChange={setCefrLevel}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select CEFR level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1" className="text-sm">
                          A1 - Beginner
                        </SelectItem>
                        <SelectItem value="A2" className="text-sm">
                          A2 - Elementary
                        </SelectItem>
                        <SelectItem value="B1" className="text-sm">
                          B1 - Intermediate
                        </SelectItem>
                        <SelectItem value="B2" className="text-sm">
                          B2 - Upper Intermediate
                        </SelectItem>
                        <SelectItem value="C1" className="text-sm">
                          C1 - Advanced
                        </SelectItem>
                        <SelectItem value="C2" className="text-sm">
                          C2 - Proficient
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="wordcount" className="text-sm sm:text-base">
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
                <Label htmlFor="topic" className="text-sm sm:text-base">
                  Article Topic
                </Label>
                <Textarea
                  placeholder="Describe the specific topic or theme you want the article to cover..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  className="mt-2 text-sm"
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
                className="w-full text-sm sm:text-base"
                size="lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Article with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview & Edit Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                {isPreviewMode ? "Article Preview" : "Article Editor"}
                {/* เพิ่ม indicator สำหรับการเปลี่ยนแปลง */}
                {hasContentChanged && !isPreviewMode && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Modified
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {isPreviewMode
                  ? "Review the article content (read-only)"
                  : "Review and edit the generated content before approval"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedData ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      Type: {selectedArticleForEdit?.type || articleType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Genre: {selectedArticleForEdit?.genre || genre}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Level: {selectedArticleForEdit?.cefr_level || cefrLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Words: {selectedArticleForEdit?.wordCount || wordCount}
                    </Badge>
                    {isPreviewMode && (
                      <Badge variant="secondary" className="text-xs">
                        Preview Mode
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="article-title"
                        className="text-sm sm:text-base font-medium"
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
                        className={`text-sm sm:text-lg font-semibold ${
                          isPreviewMode ? "text-gray-400" : ""
                        }`}
                        readOnly={isPreviewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="article-content"
                        className="text-sm sm:text-base font-medium"
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
                        className="text-sm sm:text-base font-medium"
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
                        className="text-sm sm:text-base font-medium"
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
                  <div className="flex flex-col sm:flex-row gap-3">
                    {isPreviewMode ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentTab("manage")}
                          className="w-full sm:w-auto text-sm"
                        >
                          Back to Manage
                        </Button>
                        {/* Only show Edit button if article is not published */}
                        {selectedArticleForEdit &&
                          !isArticlePublished(
                            selectedArticleForEdit.status
                          ) && (
                            <Button
                              onClick={() => {
                                setIsPreviewMode(false);
                              }}
                              className="w-full sm:w-auto text-sm"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Switch to Edit Mode
                            </Button>
                          )}
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
                          className="w-full sm:w-auto text-sm"
                        >
                          {selectedArticleForEdit
                            ? "Back to Manage"
                            : "Preview Mode"}
                        </Button>
                        {selectedArticleForEdit ? (
                          <Button
                            onClick={handleApprovePublishClick}
                            disabled={isGenerating}
                            className="w-full sm:w-auto text-sm"
                          >
                            {isGenerating && loadingType === "approve" ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Approve & Publish
                          </Button>
                        ) : (
                          <Button
                            onClick={handleApprovePublishClick}
                            className="w-full sm:w-auto text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve & Publish
                          </Button>
                        )}
                        <Button
                          onClick={handleSaveArticle}
                          variant="outline"
                          disabled={isGenerating}
                          className="w-full sm:w-auto text-sm"
                        >
                          {isGenerating && loadingType === "save" ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save as Draft
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">
                    No content generated yet. Go to the Create tab to generate
                    an article.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Articles Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    Article Management
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View and manage all your generated articles
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchUserArticles}
                  disabled={isLoadingArticles}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-sm"
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
                  <span className="text-sm">Loading articles...</span>
                </div>
              ) : userArticles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">
                    No articles found. Create your first article to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userArticles.map((article) => (
                    <div
                      key={article.id}
                      className="relative border rounded-lg p-4 space-y-3 overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(to right, rgba(192, 192, 192, 0.95) 0%, rgba(192, 192, 192, 0.85) 50%, rgba(192, 192, 192, 0.3) 100%), url('https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${article.id}.png')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center right",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                              {article.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-700 font-medium">
                              {article.type} • {article.genre} •{" "}
                              {article.wordCount} words
                            </p>
                            <p className="text-xs text-gray-600 mt-1 font-medium">
                              Topic: {article.topic}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(article.status as ArticleStatus)}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 font-medium">
                          <span>CEFR: {article.cefr_level}</span>
                          <span>Rating: {article.rating}/5</span>
                          <span>
                            Created:{" "}
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handlePreviewArticle(article)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          {/* Only show Edit button if article is not published */}
                          {!isArticlePublished(article.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleEditArticle(article)}
                              className="w-full sm:w-auto text-xs sm:text-sm"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {article.status === "draft" && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(article.id)}
                              disabled={isApproving === article.id}
                              className="w-full sm:w-auto text-xs sm:text-sm bg-green-600"
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
