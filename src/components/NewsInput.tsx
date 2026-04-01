import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Link, ArrowRight, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewsInputProps {
  onAnalyze: (text: string, source: "text" | "url") => void;
  isLoading: boolean;
  onClear: () => void;
}

const NewsInput = ({ onAnalyze, isLoading, onClear }: NewsInputProps) => {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const handleTextAnalyze = () => {
    if (text.trim()) onAnalyze(text.trim(), "text");
  };

  const handleUrlAnalyze = () => {
    if (url.trim()) onAnalyze(url.trim(), "url");
  };

  const handleRefresh = () => {
    setText("");
    setUrl("");
    onClear();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="rounded-xl border border-border bg-card p-1 shadow-elevated">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-muted/50">
            <TabsTrigger value="text" className="gap-2 font-display">
              <Search className="h-4 w-4" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2 font-display">
              <Link className="h-4 w-4" />
              News URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="p-4 space-y-4">
            <Textarea
              placeholder="Paste the news article text here to analyze..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[160px] resize-none border-none bg-transparent text-base focus-visible:ring-0 placeholder:text-muted-foreground/50"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                {text.split(/\s+/).filter(Boolean).length} words
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading || (!text.trim() && !url.trim())}
                  className="gap-2 font-display"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleTextAnalyze}
                  disabled={!text.trim() || isLoading}
                  className="gap-2 font-display"
                >
                  {isLoading ? (
                    <Shield className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Analyze
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="p-4 space-y-4">
            <Input
              type="url"
              placeholder="https://example.com/news-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-base border-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50"
            />
            <p className="text-xs text-muted-foreground">
              We'll extract the article content and analyze it for authenticity signals.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading || (!text.trim() && !url.trim())}
                className="gap-2 font-display"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
              <Button
                onClick={handleUrlAnalyze}
                disabled={!url.trim() || isLoading}
                className="gap-2 font-display"
              >
                {isLoading ? (
                  <Shield className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Analyze URL
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default NewsInput;
