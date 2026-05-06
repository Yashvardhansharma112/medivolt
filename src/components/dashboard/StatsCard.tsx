import { Card } from '@/components/ui/CustomCard';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}: StatsCardProps) => {
  return (
    <Card className={cn("", className)}>
      <div className="flex items-start justify-between p-6">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="mt-2 text-2xl font-bold text-gray-900">{value}</h4>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
          
          {trend && (
            <div className="mt-3 flex items-center">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  {
                    "bg-green-100 text-green-800": trend === "up",
                    "bg-red-100 text-red-800": trend === "down",
                    "bg-gray-100 text-gray-800": trend === "neutral",
                  }
                )}
              >
                {trend === "up" && (
                  <svg
                    className="mr-1 h-3 w-3 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                )}
                {trend === "down" && (
                  <svg
                    className="mr-1 h-3 w-3 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="p-3 bg-medical-lightBlue rounded-full"
        >
          {icon}
        </motion.div>
      </div>
    </Card>
  );
};

export default StatsCard;
