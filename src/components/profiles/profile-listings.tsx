
'use client';

import { Profile } from '@/app/lib/data';
import { MotionDiv } from '../utils/motion-div';
import { ProfileCard } from './profile-card';

interface ProfileListingsProps {
  categoryName: string;
  mostFollowed: Profile[];
  mostActive: Profile[];
}

export function ProfileListings({ categoryName, mostFollowed, mostActive }: ProfileListingsProps) {
  const hasProfiles = mostFollowed.length > 0 || mostActive.length > 0;

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-4">
          {categoryName}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover the leading and most engaged members in the {categoryName.toLowerCase()} category.
        </p>
      </MotionDiv>

      {!hasProfiles ? (
        <MotionDiv className="text-center text-muted-foreground py-16">
          <p>No profiles to display in this category yet. Be the first to join!</p>
        </MotionDiv>
      ) : (
        <>
          {mostFollowed.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold font-headline mb-8">Most Followed</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {mostFollowed.map((profile, index) => (
                  <MotionDiv
                    key={`followed-${profile.id}`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <ProfileCard profile={profile} />
                  </MotionDiv>
                ))}
              </div>
            </section>
          )}

          {mostActive.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold font-headline mb-8">Most Active</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {mostActive.map((profile, index) => (
                  <MotionDiv
                    key={`active-${profile.id}`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <ProfileCard profile={profile} />
                  </MotionDiv>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
