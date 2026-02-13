
'use client';

import { MotionDiv } from '@/components/utils/motion-div';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Users, Briefcase, Handshake } from 'lucide-react';

const faqs = [
  { id: 'faq1', question: 'What is the Sthapati community?', answer: 'It is a professional network dedicated to connecting individuals and companies within the Architecture, Construction, and Engineering (ACE) industries.' },
  { id: 'faq2', question: 'How can I join?', answer: 'You can register for an account on our platform. We offer different membership tiers for professionals, service providers, and academic institutions.' },
  { id: 'faq3', question: 'What are the benefits of joining?', answer: 'Benefits include networking opportunities, access to exclusive job listings, project collaboration tools, and a wealth of industry knowledge.' },
];

const topMembers: { id: number; name: string; contributions: string; avatarUrl: string }[] = [];

const communityBenefits = [
  { icon: <Users className="h-8 w-8 text-primary" />, title: 'Expand Your Network', description: 'Connect with thousands of ACE professionals.' },
  { icon: <Briefcase className="h-8 w-8 text-primary" />, title: 'Find Opportunities', description: 'Discover exclusive job and project openings.' },
  { icon: <Handshake className="h-8 w-8 text-primary" />, title: 'Collaborate & Innovate', description: 'Partner with peers on groundbreaking projects.' },
];

export default function CommunityPage() {
  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <MotionDiv 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-4">
          Welcome to the Sthapati Community
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          The heart of our platform. A place to connect, collaborate, and innovate with the brightest minds in the ACE industry.
        </p>
      </MotionDiv>

      <MotionDiv className="my-16">
        <h2 className="text-3xl font-bold font-headline text-center mb-8">Community Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communityBenefits.map((benefit, index) => (
             <MotionDiv
              key={benefit.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-secondary rounded-full p-4 w-fit mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </MotionDiv>

      <MotionDiv className="my-16">
        <h2 className="text-3xl font-bold font-headline text-center mb-8">Top Active Members</h2>
        {topMembers.length > 0 ? (
          <Carousel opts={{ align: 'start', loop: true }} className="w-full">
            <CarouselContent>
              {topMembers.map((member, index) => (
                <CarouselItem key={member.id} className="md:basis-1/3 lg:basis-1/5 pl-4">
                  <MotionDiv
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    variants={{
                      hidden: { opacity: 0, scale: 0.9 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                  >
                    <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-6 flex flex-col items-center">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.contributions}</p>
                      </CardContent>
                    </Card>
                  </MotionDiv>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>No active members to display yet.</p>
          </div>
        )}
      </MotionDiv>

      <MotionDiv className="my-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold font-headline text-center mb-8">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map(faq => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-lg font-semibold">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MotionDiv>
    </div>
  );
}
