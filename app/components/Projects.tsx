import { motion } from "framer-motion";
import { MessageSquare, Brain, BarChart3 } from "lucide-react";

export default function Projects() {
  return (
    <section id="projects" className="py-16 px-6 bg-black bg-opacity-80">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-left">
          Solving problems with data<br />daily
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-black p-6 border border-purple-400"
          >
            <MessageSquare className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Generative AI & LLMs
            </h3>
            <p className="text-gray-300">
              Experienced in developing and deploying AI models for a variety of
              applications, including chatbots and natural language processing.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900 to-black p-6 border border-purple-400"
          >
            <Brain className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Traditional Data Science
            </h3>
            <p className="text-gray-300">
              Proficient in the use of traditional data science techniques,
              including regression, classification, and clustering algorithms.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-gray-900 to-black p-6 border border-purple-400"
          >
            <BarChart3 className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-300">
              Skilled in the use of advanced analytics techniques, including
              time series analysis and forecasting.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
