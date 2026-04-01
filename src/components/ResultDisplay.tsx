import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnalysisResult, Verdict } from "@/lib/analysis-engine";
import { Progress } from "@/components/ui/progress";

interface ResultDisplayProps {
  result: AnalysisResult;
}

const verdictConfig: Record<Verdict, { icon: typeof CheckCircle2; label: string; className: string; shadowClass: string }> = {
  real: {
    icon: CheckCircle2,
    label: "Likely Real",
    className: "text-verdict-real border-verdict-real/30 bg-verdict-real/5",
    shadowClass: "shadow-glow-real",
  },
  fake: {
    icon: XCircle,
    label: "Likely Fake",
    className: "text-verdict-fake border-verdict-fake/30 bg-verdict-fake/5",
    shadowClass: "shadow-glow-fake",
  },
  uncertain: {
    icon: AlertTriangle,
    label: "Uncertain",
    className: "text-verdict-uncertain border-verdict-uncertain/30 bg-verdict-uncertain/5",
    shadowClass: "",
  },
};

const ResultDisplay = ({ result }: ResultDisplayProps) => {
  const config = verdictConfig[result.verdict];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Verdict Card */}
      <div className={`rounded-xl border-2 p-8 text-center ${config.className} ${config.shadowClass}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <Icon className="h-16 w-16 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold font-display mb-2">{config.label}</h2>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-sm font-mono opacity-70">Confidence</span>
          <div className="w-32">
            <Progress value={result.confidence} className="h-2" />
          </div>
          <span className="text-sm font-mono font-bold">{result.confidence}%</span>
        </div>
        <p className="text-sm opacity-80 max-w-md mx-auto">{result.summary}</p>
      </div>

      {/* Factors */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-lg font-display font-semibold mb-4">Analysis Breakdown</h3>
        <div className="space-y-4">
          {result.factors.map((factor, i) => {
            const isPositive = factor.score > 0;
            const isNeutral = factor.score === 0;
            const ScoreIcon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;
            const scoreColor = isPositive
              ? "text-verdict-real"
              : isNeutral
              ? "text-muted-foreground"
              : "text-verdict-fake";

            return (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <ScoreIcon className={`h-5 w-5 mt-0.5 shrink-0 ${scoreColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-medium text-sm">{factor.name}</span>
                    <span className={`text-xs font-mono font-bold ${scoreColor}`}>
                      {factor.score > 0 ? "+" : ""}{(factor.score * 100).toFixed(0)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{factor.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ResultDisplay;
