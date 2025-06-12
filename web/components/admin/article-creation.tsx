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
} from "lucide-react";

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

const AdminArticleCreation = () => {
  const [articleType, setArticleType] = useState("");
  const [genre, setGenre] = useState("");
  const [subgenre, setSubgenre] = useState("");
  const [topic, setTopic] = useState("");
  const [cefrLevel, setCefrLevel] = useState("");
  const [wordCount, setWordCount] = useState(500);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
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

  // Sample data - would come from backend
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
        // Fallback to empty data or show error message
        setGenres({ fiction: [], nonfiction: [] });
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  const sampleArticles = [
    {
      id: 1,
      title: "The Mystery of the Digital Library",
      type: "Fiction",
      genre: "Mystery",
      cefrLevel: "B1",
      status: "pending",
      createdAt: "2024-01-15",
      wordCount: 450,
    },
    {
      id: 2,
      title: "How Solar Panels Work",
      type: "Non-Fiction",
      genre: "Science",
      cefrLevel: "A2",
      status: "approved",
      createdAt: "2024-01-14",
      wordCount: 380,
    },
    {
      id: 3,
      title: "The Adventures of Captain Space",
      type: "Fiction",
      genre: "Science Fiction",
      cefrLevel: "B2",
      status: "draft",
      createdAt: "2024-01-13",
      wordCount: 620,
    },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent(
        `# ${topic}\n\nThis is a sample generated article about ${topic}. The AI would create content appropriate for ${cefrLevel} level learners, incorporating elements of ${genre} ${articleType.toLowerCase()}.\n\nThe article would be approximately ${wordCount} words and follow CEFR guidelines for vocabulary complexity and sentence structure.\n\n## Sample Content\n\nThe generated content would appear here with proper structure, engaging narrative or informative text depending on the type selected, and appropriate complexity for the target audience.`
      );
      setIsGenerating(false);
      setCurrentTab("preview");
    }, 3000);
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

              <Button
                onClick={handleGenerate}
                disabled={
                  !articleType || !genre || !topic || !cefrLevel || isGenerating
                }
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Article...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Article with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-500" />
                Article Preview & Editor
              </CardTitle>
              <CardDescription>
                Review and edit the generated content before approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">Type: {articleType}</Badge>
                    <Badge variant="outline">Genre: {genre}</Badge>
                    <Badge variant="outline">Level: {cefrLevel}</Badge>
                    <Badge variant="outline">Words: {wordCount}</Badge>
                  </div>
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Continue Editing
                    </Button>
                    <Button>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve & Publish
                    </Button>
                    <Button variant="outline">Save as Draft</Button>
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

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Management</CardTitle>
              <CardDescription>
                View and manage all articles in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleArticles.map((article) => (
                  <div
                    key={article.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-sm text-gray-600">
                          {article.type} • {article.genre} • {article.wordCount}{" "}
                          words
                        </p>
                      </div>
                      {getStatusBadge(article.status as ArticleStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>CEFR: {article.cefrLevel}</span>
                      <span>Created: {article.createdAt}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {article.status === "pending" && (
                        <Button size="sm">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminArticleCreation;
