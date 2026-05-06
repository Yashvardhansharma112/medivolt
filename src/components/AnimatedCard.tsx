import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode; // Allows any valid React children
  variant: string; // Adjust the type if `variant` has specific allowed values
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, variant }) => {
  return (
    <div className={`animated-card ${variant}`}>
      {children}
    </div>
  );
};

export default AnimatedCard;