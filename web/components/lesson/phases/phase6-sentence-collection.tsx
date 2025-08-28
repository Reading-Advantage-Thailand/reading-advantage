"use client";

import React, { useState, useEffect } from "react";
import { Article } from "../../models/article-model";
import { FileTextIcon, CheckCircle2Icon, AlertCircleIcon, PlusCircleIcon } from "lucide-react";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { splitTextIntoSentences } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

interface Phase6SentenceCollectionProps {
  article: Article;
  articleId: string;
  userId: string;
  locale: "en" | "th" | "cn" | "tw" | "vi";
  onCompleteChange: (complete: boolean) => void;
}

const FormSchema = z.object({
  sentences: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one sentence.",
  }),
});

const Phase6SentenceCollection: React.FC<Phase6SentenceCollectionProps> = ({
  article,
  articleId,
  userId,
  locale,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");
  const [saving, setSaving] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  
  const sentences = splitTextIntoSentences(article.passage, true);
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sentences: [],
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      setSelectedCount(value.sentences?.length || 0);
      onCompleteChange((value.sentences?.length || 0) >= 3);
    });
    return () => subscription.unsubscribe();
  }, [form, onCompleteChange]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      setSaving(true);
      
      if (data.sentences.length < 3) {
        toast({
          title: "Insufficient Sentences",
          description: "Please select at least 3 sentences to continue",
          variant: "destructive",
        });
        return;
      }

      const selectedSentences = data.sentences.map((sentenceText) => {
        const index = sentences.findIndex(s => s === sentenceText);
        return {
          sentence: sentenceText,
          index,
          articleId,
        };
      });

      const response = await fetch(`/api/v1/users/sentences/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sentences: selectedSentences,
          articleId,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: `${selectedSentences.length} sentences added to your collection`,
          variant: "default",
        });
        onCompleteChange(true);
      } else {
        throw new Error("Failed to save sentences");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save sentences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSentenceComplexity = (sentence: string) => {
    const wordCount = sentence.split(' ').length;
    if (wordCount < 10) return { level: "Simple", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (wordCount < 20) return { level: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    return { level: "Complex", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 dark:from-teal-950 dark:via-green-950 dark:to-emerald-950 p-8 rounded-2xl border border-teal-200 dark:border-teal-800">
        <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900 rounded-full mb-4">
          <FileTextIcon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("phase6Title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t("phase6Description")}
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedCount >= 3 ? (
              <CheckCircle2Icon className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircleIcon className="h-6 w-6 text-amber-500" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Selection Progress
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCount} of {sentences.length} sentences selected
                {selectedCount < 3 && ` (minimum 3 required)`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              selected
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                selectedCount >= 3 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500'
              }`}
              style={{ 
                width: `${Math.min((selectedCount / Math.max(sentences.length, 1)) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Sentence Selection */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="sentences"
                render={() => (
                  <FormItem>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {sentences.map((sentence, index) => {
                        const complexity = getSentenceComplexity(sentence);
                        
                        return (
                          <FormField
                            key={index}
                            control={form.control}
                            name="sentences"
                            render={({ field }) => (
                              <FormItem
                                className={`group p-4 border-2 rounded-xl transition-all duration-300 hover:shadow-md ${
                                  field.value?.includes(sentence)
                                    ? 'border-teal-400 bg-teal-50 dark:bg-teal-950 dark:border-teal-600 shadow-sm'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                              >
                                <div className="flex items-start space-x-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(sentence)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, sentence])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== sentence
                                              )
                                            );
                                      }}
                                      className="h-5 w-5 mt-1"
                                    />
                                  </FormControl>

                                  <div className="flex-1 min-w-0">
                                    {/* Sentence Number and Complexity */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs"
                                      >
                                        #{index + 1}
                                      </Badge>
                                      <Badge 
                                        className={`text-xs ${complexity.color}`}
                                      >
                                        {complexity.level}
                                      </Badge>
                                      {field.value?.includes(sentence) && (
                                        <Badge className="text-xs bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                                          <PlusCircleIcon className="w-3 h-3 mr-1" />
                                          Added
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Sentence Text */}
                                    <p className={`text-lg leading-relaxed transition-all duration-300 ${
                                      field.value?.includes(sentence)
                                        ? 'text-gray-900 dark:text-white font-medium'
                                        : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                                    }`}>
                                      {sentence}
                                    </p>

                                    {/* Sentence Stats */}
                                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{sentence.split(' ').length} words</span>
                                      <span>•</span>
                                      <span>{sentence.length} characters</span>
                                      <span>•</span>
                                      <span>
                                        {field.value?.includes(sentence) ? 'Selected' : 'Click to select'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={selectedCount < 3 || saving}
                        size="lg"
                        className={`w-full ${
                          selectedCount >= 3
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {saving ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Saving...
                          </div>
                        ) : (
                          `Add ${selectedCount} Sentences to Collection`
                        )}
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>

      {/* Collection Guide */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-xl border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
          📖 Sentence Collection Guide
        </h3>
        <div className="grid gap-3 text-sm text-green-700 dark:text-green-300">
          <div className="flex items-start">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            <div>
              <strong>Simple sentences:</strong> Good for practicing basic structure and common vocabulary
            </div>
          </div>
          <div className="flex items-start">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            <div>
              <strong>Medium sentences:</strong> Help develop understanding of complex ideas
            </div>
          </div>
          <div className="flex items-start">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            <div>
              <strong>Complex sentences:</strong> Challenge your comprehension and analytical skills
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Phase6SentenceCollection.displayName = "Phase6SentenceCollection";
export default Phase6SentenceCollection;
