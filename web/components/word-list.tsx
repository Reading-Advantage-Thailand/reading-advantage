"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useScopedI18n } from "@/locales/client";
import { Book } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCurrentLocale } from "@/locales/client";
import { Article } from "@/components/models/article-model";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "./ui/use-toast";
interface Props {
  article: Article;
  articleId: string;
  userId: string;
}
interface WordList {
  vocabulary: string;
  definition: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
}

export default function WordList({ article, articleId, userId }: Props) {
  const t = useScopedI18n("components.wordList");
  const [loading, setLoading] = useState<boolean>(false);
  const [wordList, setWordList] = useState<WordList[]>([]);

  // Get the current locale
  const currentLocale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";

  const FormSchema = z.object({
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const handleWordList = useCallback(async () => {
    try {
      setLoading(true); // Start loading
      const resWordlist = await axios.post(`/api/assistant/wordlist`, {
        article,
        articleId,
        userId,
      });

      setWordList(resWordlist?.data?.word_list);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Something went wrong.",
        description: `${error?.response?.data?.message || error?.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  }, [article, articleId, form, userId]);
  console.log("form : ", form.watch("items"));

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    console.log("onSubmit : ", data);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button onClick={handleWordList} className="mb-4 ml-3">
            {t("title")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px] h-96">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="overflow-auto"
            >
              <DialogHeader>
                <DialogTitle>
                  <div className="flex items-center">
                    <Book />
                    <div className="ml-2">{t("title")}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              {loading ? (
                <div className="flex items-center space-x-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[300px]" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-5">
                    <span className="font-bold">{t("detail")}</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="items"
                    render={() => {
                      return (
                        <FormItem>
                          <>
                            {wordList?.map((word, index) => (
                              <FormField
                                key={index}
                                control={form.control}
                                name="items"
                                render={({ field }) => {
                                  return (
                                    <FormItem key={word?.vocabulary}>
                                      <FormControl>
                                        <div
                                          key={index}
                                          className="p-4 border-b-2"
                                        >
                                          <Checkbox
                                            checked={field?.value?.includes(
                                              word?.vocabulary
                                            )}
                                            onCheckedChange={(checked) => {
                                              if (Array.isArray(field.value)) {
                                                return checked
                                                  ? field.onChange([
                                                      ...field.value,
                                                      word.vocabulary,
                                                    ])
                                                  : field.onChange(
                                                      field.value.filter(
                                                        (value) =>
                                                          value !==
                                                          word.vocabulary
                                                      )
                                                    );
                                              } else {
                                                return field.onChange(
                                                  checked
                                                    ? [word.vocabulary]
                                                    : []
                                                );
                                              }
                                            }}
                                          />
                                          <span className="font-bold text-cyan-500 ml-2">
                                            {word.vocabulary}:{" "}
                                          </span>
                                          <span>
                                            {word.definition[currentLocale]}
                                          </span>
                                        </div>
                                      </FormControl>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </>
                        </FormItem>
                      );
                    }}
                  />
                </>
              )}
              <DialogFooter className="fixed bottom-0 left-0 w-full bg-white p-4">
                <div className="flex justify-end mt-5">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      {t("closeButton")}
                    </Button>
                  </DialogClose>
                  <Button
                    className="ml-2"
                    type="submit"
                    disabled={form.watch("items")?.length === 0 || form.watch("items") === undefined}
                  >
                    {t("saveButton")}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
