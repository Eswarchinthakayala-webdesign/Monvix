import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const PremiumLoader = ({ isVisible, text = "Initializing Tracker..." }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
                >
                    <div className="relative">
                        {/* Outer Ring */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-full border-t-2 border-r-2 border-primary/50"
                        />
                        {/* Inner Ring */}
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute top-2 left-2 w-20 h-20 rounded-full border-b-2 border-l-2 border-white/20"
                        />
                        {/* Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="text-primary size-8 animate-pulse" />
                        </div>
                    </div>
                    
                    <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50"
                    >
                        {text}
                    </motion.h3>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-muted-foreground mt-2 font-mono uppercase tracking-widest"
                    >
                        Please Wait
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PremiumLoader;
