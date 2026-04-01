import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BarChart3, Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsInput from "@/components/NewsInput";
import ResultDisplay from "@/components/ResultDisplay";
import Dashboard from "@/components/Dashboard";
import { saveAnalysis, type AnalysisResult } from "@/lib/analysis-engine";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analyze");
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleAnalyze = useCallback(async (text: string, source: "text" | "url") => {
    setIsLoading(true);
    setResult(null);

    let contentToAnalyze = text;

    if (source === "url") {
      toast({
        title: "URL Analysis",
        description: "Analyzing the URL text content as a demo. Full URL extraction requires additional setup.",
      });
    }

    try {
      const { data, error } = await supabase.functions.invoke("analyze-news", {
        body: { text: contentToAnalyze },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const analysisResult: AnalysisResult = data;
      setResult(analysisResult);

      saveAnalysis({
        id: crypto.randomUUID(),
        text: contentToAnalyze,
        result: analysisResult,
        timestamp: Date.now(),
        source,
      });
    } catch (err: any) {
      console.error("Analysis failed:", err);
      toast({
        title: "Analysis Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleClear = useCallback(() => {
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display leading-none">TruthLens</h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">Fake News Detector</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Zap className="h-3 w-3" />
              AI-Powered
            </div>
            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border border-border bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4 text-foreground" /> : <Sun className="h-4 w-4 text-foreground" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
            Detect <span className="text-gradient-brand">Fake News</span> Instantly
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Paste any news article or URL and our AI analyzes it for misinformation patterns, clickbait, and credibility signals.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-xs mx-auto grid grid-cols-2">
            <TabsTrigger value="analyze" className="gap-2 font-display">
              <Shield className="h-4 w-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2 font-display">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="mt-6 space-y-8">
            <NewsInput onAnalyze={handleAnalyze} isLoading={isLoading} onClear={handleClear} />
            <AnimatePresence mode="wait">
              {result && <ResultDisplay result={result} />}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container max-w-4xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground font-mono">
          TruthLens uses AI-powered analysis to detect fake news patterns and credibility signals.
        </div>
      </footer>
    </div>
  );
};

export default Index;
