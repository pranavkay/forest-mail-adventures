
import { useState, useEffect } from 'react';
import { animalGuides } from '@/data/mockData';

export const AnimalGuide = ({ guideId }: { guideId: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<{ animal: string; message: string; shown?: boolean } | null>(null);
  
  useEffect(() => {
    // Check if the guide exists and use the correct object access pattern
    if (animalGuides[guideId as keyof typeof animalGuides]) {
      const guide = animalGuides[guideId as keyof typeof animalGuides];
      
      // Add the shown property if it doesn't exist
      if (guide && !('shown' in guide)) {
        guide.shown = false;
      }
      
      if (guide && !guide.shown) {
        setCurrentGuide(guide);
        setIsVisible(true);
        
        // Mark this guide as shown after a delay
        const timer = setTimeout(() => {
          guide.shown = true;
          setIsVisible(false);
        }, 10000); // Show for 10 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, [guideId]);
  
  if (!isVisible || !currentGuide) return null;
  
  return (
    <div className="fixed bottom-6 left-6 max-w-xs animate-pop">
      <div className="forest-card flex items-start">
        <div className="mr-3 mt-1">
          <span className="text-2xl">
            {guideId === 'new-email' && '🦔'}
            {guideId === 'folders' && '🦉'}
            {guideId === 'search' && '🦊'}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-forest-bark">Forest Guide says:</h3>
          <p className="text-sm text-forest-bark/80">{currentGuide.message}</p>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-xs text-forest-berry hover:text-forest-berry/80 mt-2"
          >
            Thank you!
          </button>
        </div>
      </div>
    </div>
  );
};
