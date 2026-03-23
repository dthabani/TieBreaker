import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { AnalysisType } from '../types';

interface LoadingViewProps {
  type: AnalysisType;
}

export function LoadingView({ type }: LoadingViewProps) {

  const getLoadingText = () => {
    switch (type) {
      case 'pros_cons':
        return "Weighing the pros and cons...";
      case 'comparison':
        return "Building a detailed comparison table...";
      case 'swot':
        return "Conducting a deep SWOT analysis...";
      default:
        return "Analyzing your decision...";
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '2rem' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <Loader2 size={64} color="var(--primary)" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="subtitle"
        style={{ margin: 0 }}
      >
        <p>{getLoadingText()}</p>
      </motion.div>
    </div>
  );
}
