import React, { useRef } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Story, User } from '../types';

interface StoriesSectionProps {
  stories: Story[];
  currentUser: User;
  onSelectStory: (index: number) => void;
  onAddStory: () => void;
}

const StoriesSectionComponent: React.FC<StoriesSectionProps> = ({
  stories,
  currentUser,
  onSelectStory,
  onAddStory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full py-2">
      <div
        ref={scrollRef}
        className="flex items-center gap-4 px-5 overflow-x-auto no-scrollbar scroll-smooth py-2"
      >
        {/* First Card: Your Story / Add Story */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
          onClick={onAddStory}
        >
          <div className="relative w-[72px] h-[72px] rounded-full neu-raised p-1 flex items-center justify-center transition-all group-hover:shadow-lg">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <img
                src={currentUser.avatar}
                alt="Your Story"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Large 3D Blue Plus Icon Badge */}
            <div className="absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-full bg-[#5B9DFF] text-white flex items-center justify-center shadow-md ring-2 ring-white">
              <Plus className="w-4.5 h-4.5 stroke-[3]" />
            </div>
          </div>
          <span className="mt-2 text-[12.5px] font-semibold text-slate-700 tracking-tight">
            Your Story
          </span>
        </motion.div>

        {/* Stories from following users */}
        {stories.map((story, index) => {
          return (
            <motion.div
              key={story.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              onClick={() => onSelectStory(index)}
            >
              {/* Floating circular profile card with soft blue border */}
              <div
                className={`relative w-[72px] h-[72px] rounded-full p-[3px] transition-all duration-300 ${
                  story.isSeen
                    ? 'neu-flat p-[3px] border border-slate-200'
                    : 'neu-raised bg-gradient-to-tr from-[#5B9DFF] to-[#8ac0ff] p-[2.5px]'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                  <img
                    src={story.user.avatar}
                    alt={story.user.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Small Username Below */}
              <span className="mt-2 text-[12.5px] font-semibold text-slate-600 max-w-[68px] truncate text-center group-hover:text-[#5B9DFF] transition-colors">
                {story.user.username.split('.')[0]}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export const StoriesSection = React.memo(StoriesSectionComponent);
