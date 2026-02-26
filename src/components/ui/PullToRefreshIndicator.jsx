import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefreshIndicator({ isRefreshing }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isRefreshing ? 1 : 0, y: isRefreshing ? 0 : -10 }}
      className="flex justify-center py-3"
    >
      <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 1, repeat: Infinity }}>
        <RefreshCw className="w-5 h-5 text-slate-400" />
      </motion.div>
    </motion.div>
  );
}