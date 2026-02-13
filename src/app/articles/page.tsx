
'use client';

import { MotionDiv } from '@/components/utils/motion-div';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const dummyArticles: { id: number; title: string; description: string; timestamp: string; }[] = [];

export default function ArticlesPage() {
  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-4">
          Industry Articles
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Stay informed with the latest trends, insights, and research from leaders in the ACE industry.
        </p>
      </MotionDiv>

      <MotionDiv className="my-12 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search articles..." className="pl-12 h-12 text-base" />
        </div>
      </MotionDiv>

      {dummyArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyArticles.map((article, index) => (
            <MotionDiv
              key={article.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription>{article.timestamp}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-2">{article.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="link" className="p-0">Read More</Button>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </div>
      ) : (
        <MotionDiv className="text-center text-muted-foreground py-16">
          <p>No articles available at the moment. Please check back later.</p>
        </MotionDiv>
      )}

      {dummyArticles.length > 0 && (
        <MotionDiv className="text-center mt-12">
          <Button size="lg">Load More Articles</Button>
        </MotionDiv>
      )}
    </div>
  );
}
