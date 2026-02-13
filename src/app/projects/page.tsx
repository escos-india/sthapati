
'use client';

import { MotionDiv } from '@/components/utils/motion-div';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const dummyProjects: { id: number; name: string; description: string; category: string; imageUrl: string; imageHint: string }[] = [];

export default function ProjectsPage() {
  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-12"
      >
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-4">
            Showcase Your Work
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
            Share your projects, find inspiration, and collaborate with peers from around the world.
          </p>
        </div>
        <Button size="lg" className="mt-6 md:mt-0">
          <PlusCircle className="mr-2" />
          Add Your Project
        </Button>
      </MotionDiv>

      {dummyProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {dummyProjects.map((project, index) => (
            <MotionDiv
              key={project.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="h-full flex flex-col group overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {project.imageUrl && (
                      <div className="relative h-64 w-full">
                          <Image
                              src={project.imageUrl}
                              alt={project.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              data-ai-hint={project.imageHint}
                          />
                      </div>
                  )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-2">{project.name}</CardTitle>
                      <Badge variant="secondary">{project.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-3">{project.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline">View Project</Button>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </div>
      ) : (
        <MotionDiv className="text-center text-muted-foreground py-16">
          <p>No projects have been added yet. Be the first to showcase your work!</p>
        </MotionDiv>
      )}
    </div>
  );
}
