'use client';

import { MotionDiv } from '@/components/utils/motion-div';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Building, HardHat, Home, Palette, PencilRuler, Search, ShieldCheck, Users, School, Star } from 'lucide-react';
import Link from 'next/link';

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <section className={`py-16 md:py-24 ${className || ''}`}>{children}</section>
);

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) => (
  <MotionDiv
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay }}
    variants={{
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    }}
    className="h-full"
  >
    <Card className="h-full text-center bg-background/50 backdrop-blur-sm border-white/20 hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1">
      <CardHeader>
        <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
          {icon}
        </div>
        <CardTitle className="font-headline text-xl md:text-2xl mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </MotionDiv>
);

const categories = [
    { 
        icon: <PencilRuler className="h-8 w-8" />, 
        name: 'Architects & Planners',
        description: 'Visionaries of the built environment, architects and planners on Sthapati can showcase their portfolios, connect with developers for groundbreaking projects, and find inspiration within a community of peers.'
    },
    { 
        icon: <Palette className="h-8 w-8" />, 
        name: 'Interior Designers', 
        description: 'Creative minds who transform spaces, interior designers can discover new material trends, collaborate with architects and builders, and attract clients by presenting their stunning project galleries.'
    },
    { 
        icon: <Home className="h-8 w-8" />, 
        name: 'Engineer Consultants', 
        description: 'The structural and systemic backbone of any project, engineer consultants can lend their expertise, partner with architectural firms, and find opportunities that challenge and reward their technical skills.'
    },
    { 
        icon: <Building className="h-8 w-8" />, 
        name: 'Builders & Developers', 
        description: 'The driving force behind development, builders and developers can source vetted contractors, connect with top-tier design professionals, and manage their projects with a reliable network of industry talent.'
    },
    { 
        icon: <HardHat className="h-8 w-8" />, 
        name: 'Contractors', 
        description: 'Masters of execution, contractors can find their next big project, connect with a reliable stream of skilled labor, and build their reputation by showcasing their successfully completed work.'
    },
    { 
        icon: <Briefcase className="h-8 w-8" />, 
        name: 'Material Suppliers', 
        description: 'The providers of the essential components of construction, material suppliers can showcase their product catalogs, connect directly with buyers, and stay ahead of the curve by understanding market demands.'
    },
    { 
        icon: <School className="h-8 w-8" />, 
        name: 'Academic Institutes', 
        description: 'Nurturing the next generation of industry leaders, academic institutes can connect students with internships, showcase their curriculum, and bridge the gap between education and real-world practice.'
    },
    {
        icon: <Star className="h-8 w-8" />,
        name: 'Aspirants',
        description: 'The future of the ACE industry, students and aspiring professionals can explore career paths, connect with mentors, find internships, and build a foundational network to launch their careers.'
    }
];

export default function AboutPage() {
  return (
    <div className="text-foreground">
      {/* Hero Section */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative flex items-center justify-center text-center px-4 overflow-hidden bg-slate-900 py-24 md:py-32"
      >
        <div className="relative z-10">
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight text-white">
              Engineering the Future of the ACE Industry
            </h1>
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-neutral-200">
              Sthapati is the premier professional networking and employment marketplace designed exclusively for the Architecture, Construction, and Engineering (ACE) ecosystem.
            </p>
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
            <Link href="/register">
              <Button size="lg" className="mt-8 group">
                Join the Ecosystem
              </Button>
            </Link>
          </MotionDiv>
        </div>
      </MotionDiv>

      {/* Vision & Value Proposition */}
      <Section className="!py-28 md:!py-40 bg-background">
        <div className="relative container mx-auto max-w-5xl text-center">
            <MotionDiv 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            >
              <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground tracking-tight">
                Our Vision: A Unified Digital Foundation
              </h2>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                The construction sector has long been fragmented, hindering seamless collaboration and growth. Sthapati was born from a vision to demolish these silos. We provide a centralized, trusted, and verified digital environment where professionals and organizations can build their digital presence, validate credibility, and discover opportunities—all in one place.
              </p>
            </MotionDiv>
        </div>
      </Section>

      {/* Category Coverage */}
      <Section className="bg-background/20 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">An Ecosystem for Every Professional</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {categories.map((cat, index) => (
               <FeatureCard
                key={cat.name}
                delay={index * 0.1}
                icon={cat.icon}
                title={cat.name}
                description={cat.description}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* Platform Utility */}
      <Section className="container mx-auto max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-16">Discover. Connect. Grow.</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            delay={0.1}
            icon={<Search className="h-10 w-10" />}
            title="Discover Vetted Talent"
            description="Explore a vast network of verified professionals and organizations. Review credible profiles, portfolios, and project histories to find the perfect partner for your next project."
          />
          <FeatureCard
            delay={0.3}
            icon={<Users className="h-10 w-10" />}
            title="Build Your ACE Network"
            description="Connect with industry peers, mentors, and leaders. Share your work, exchange insights, and build meaningful relationships within a dedicated professional community."
          />
          <FeatureCard
            delay={0.5}
            icon={<Briefcase className="h-10 w-10" />}
            title="Unlock Opportunities"
            description="From job openings to project collaborations, Sthapati is your gateway to a world of possibilities. Let opportunities find you based on your verified skills and professional identity."
          />
        </div>
      </Section>

      {/* Jobs & Talent Ecosystem */}
      <Section className="bg-background/20 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl">
            <MotionDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-4">The Industry’s Dedicated Recruitment Hub</h2>
                <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
                Sthapati doubles as a specialized talent marketplace, connecting the industry’s best talent with leading organizations.
                </p>
            </MotionDiv>
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <MotionDiv initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="p-8 bg-background/50 rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">For Job Seekers</h3>
                    <p className="mt-2 text-muted-foreground">Create a dynamic, ACE-focused professional profile that showcases your skills, experience, and portfolio. Get discovered by top employers and apply for jobs that align with your career goals.</p>
                    <Link href="/jobs"><Button variant="outline" className="mt-6">Find Your Next Role</Button></Link>
                </MotionDiv>
                <MotionDiv initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="p-8 bg-background/50 rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">For Employers</h3>
                    <p className="mt-2 text-muted-foreground">Post job openings, browse a pool of verified professionals, and hire with confidence. Our platform streamlines the recruitment process, ensuring you find the right fit for your team.</p>
                    <Link href="/register"><Button variant="outline" className="mt-6">Hire Verified Talent</Button></Link>
                </MotionDiv>
            </div>
        </div>
      </Section>

      {/* Trust & Quality */}
      <Section className="container mx-auto max-w-5xl text-center">
        <MotionDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Our Commitment to Excellence</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
            Trust is the bedrock of our platform. We are dedicated to building a high-quality ecosystem founded on authenticity and transparency.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-semibold">Verified Data</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-semibold">Authentic Profiles</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-semibold">Transparent Engagement</span>
            </div>
          </div>
        </MotionDiv>
      </Section>
    </div>
  );
}
