import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun, Sunrise, Moon, CloudMoon } from "lucide-react";

function getGreetingData() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: Sunrise, gradient: "from-amber-400 to-orange-500" };
  if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: Sun, gradient: "from-yellow-400 to-amber-500" };
  if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: CloudMoon, gradient: "from-violet-400 to-purple-500" };
  return { text: "Good Night", icon: Moon, gradient: "from-indigo-400 to-blue-500" };
}

export default function GreetingHero({ userName }) {
  const [greeting] = useState(getGreetingData);
  const [currentDate] = useState(new Date());
  const Icon = greeting.icon;

  const firstName = userName?.split(" ")[0] || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2 mb-2"
          >
            <Icon className={`w-5 h-5 bg-gradient-to-r ${greeting.gradient} text-teal-400`} />
            <span className="text-sm font-medium text-slate-400">
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-white"
          >
            {greeting.text},{" "}
            <span className="bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
              {firstName}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-2 text-slate-400 text-sm sm:text-base"
          >
            How are you today? Write down your thoughts.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center gap-2 text-xs text-teal-400/60"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your own space</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
