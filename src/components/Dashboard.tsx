import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { getStats, getHistory, type AnalysisRecord } from "@/lib/analysis-engine";

const Dashboard = () => {
  const stats = getStats();
  const history = getHistory().slice(0, 5);

  const statCards = [
    { label: "Total Analyzed", value: stats.total, icon: BarChart3, className: "text-primary" },
    { label: "Real News", value: stats.real, icon: CheckCircle2, className: "text-verdict-real" },
    { label: "Fake News", value: stats.fake, icon: XCircle, className: "text-verdict-fake" },
    { label: "Uncertain", value: stats.uncertain, icon: AlertTriangle, className: "text-verdict-uncertain" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card text-center"
          >
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.className}`} />
            <div className="text-2xl font-bold font-display">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Ratio bar */}
      {stats.total > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <h3 className="text-sm font-display font-semibold mb-3">Real vs Fake Ratio</h3>
          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
            {stats.real > 0 && (
              <div
                className="bg-verdict-real transition-all"
                style={{ width: `${(stats.real / stats.total) * 100}%` }}
              />
            )}
            {stats.uncertain > 0 && (
              <div
                className="bg-verdict-uncertain transition-all"
                style={{ width: `${(stats.uncertain / stats.total) * 100}%` }}
              />
            )}
            {stats.fake > 0 && (
              <div
                className="bg-verdict-fake transition-all"
                style={{ width: `${(stats.fake / stats.total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-verdict-real" /> Real ({stats.real})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-verdict-uncertain" /> Uncertain ({stats.uncertain})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-verdict-fake" /> Fake ({stats.fake})
            </span>
          </div>
        </div>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <h3 className="text-sm font-display font-semibold mb-3">Recently Analyzed</h3>
          <div className="space-y-2">
            {history.map((record: AnalysisRecord) => {
              const VerdictIcon = record.result.verdict === "real" ? CheckCircle2 : record.result.verdict === "fake" ? XCircle : AlertTriangle;
              const verdictColor = record.result.verdict === "real" ? "text-verdict-real" : record.result.verdict === "fake" ? "text-verdict-fake" : "text-verdict-uncertain";
              return (
                <div key={record.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <VerdictIcon className={`h-4 w-4 shrink-0 ${verdictColor}`} />
                  <span className="text-sm truncate flex-1">{record.text.slice(0, 80)}...</span>
                  <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(record.timestamp).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-display">No analyses yet</p>
          <p className="text-sm">Start analyzing news to see your dashboard stats.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
