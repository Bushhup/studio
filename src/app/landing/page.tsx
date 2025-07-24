
'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, GraduationCap, Users, BarChart3, Briefcase } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Role-Based Dashboards',
    description: 'Tailored views for Admins, Faculty, and Students to manage their tasks efficiently.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Academic Tracking',
    description: 'Monitor attendance, marks, and performance with intuitive charts and real-time data.',
  },
    {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: 'Placement Hub',
    description: 'Discover and apply for the latest internship and job opportunities posted by the department.',
  },
];

function AnimatedSection({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          if(ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
        className
      )}
    >
      {children}
    </div>
  );
}


export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <GraduationCap className="h-20 w-20 mx-auto text-primary mb-6" />
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-accent animated-gradient">
            MCA Department Portal
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            A unified platform for students, faculty, and administration to streamline communication, manage academics, and foster growth.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
                <Link href="/login">Portal Login</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
                <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl md:text-5xl font-bold">Everything You Need, All in One Place</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                  From daily attendance to placement opportunities, our portal simplifies every aspect of department management.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                          {feature.icon}
                      </div>
                      <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20">
        <AnimatedSection>
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
              <div>
                  <Image
                      src="https://placehold.co/600x400.png"
                      alt="Department students collaborating"
                      data-ai-hint="students collaborating"
                      width={600}
                      height={400}
                      className="rounded-lg shadow-2xl"
                  />
              </div>
              <div>
                  <h2 className="font-headline text-4xl md:text-5xl font-bold">Our Vision for a Connected Campus</h2>
                  <p className="mt-6 text-lg text-muted-foreground">
                      We believe in the power of technology to enhance education. Our goal is to create a seamless digital ecosystem that empowers students to achieve their full potential, enables faculty to focus on teaching, and provides administration with powerful tools for efficient management.
                  </p>
                  <ul className="mt-6 space-y-4">
                      <li className="flex items-start">
                          <Check className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                          <span>
                              <strong>Empower Students</strong> with instant access to academic data and career opportunities.
                          </span>
                      </li>
                      <li className="flex items-start">
                          <Check className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                          <span>
                             <strong>Support Faculty</strong> by simplifying administrative tasks like attendance and marks entry.
                          </span>
                      </li>
                       <li className="flex items-start">
                          <Check className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                          <span>
                             <strong>Streamline Administration</strong> with centralized control over users, classes, and subjects.
                          </span>
                      </li>
                  </ul>
              </div>
          </div>
        </AnimatedSection>
      </section>

       {/* Gallery Section */}
       <section className="py-20 bg-muted">
            <div className="container mx-auto px-4">
              <AnimatedSection>
                <div className="text-center mb-16">
                    <h2 className="font-headline text-4xl md:text-5xl font-bold">Glimpses of Our Department</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        A vibrant community of learners and innovators.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="grid gap-4">
                        <Link href="https://placehold.co/500x300.png" target="_blank" rel="noopener noreferrer">
                           <Image className="h-auto max-w-full rounded-lg shadow-md transition-transform hover:scale-105" src="https://placehold.co/500x300.png" alt="Campus event 1" data-ai-hint="campus event" width={500} height={300} />
                        </Link>
                        <Link href="https://placehold.co/500x700.png" target="_blank" rel="noopener noreferrer">
                           <Image className="h-auto max-w-full rounded-lg shadow-md transition-transform hover:scale-105" src="https://placehold.co/500x700.png" alt="Students in a lab" data-ai-hint="students computer lab" width={500} height={700} />
                        </Link>
                    </div>
                    <div className="grid gap-4">
                        <Link href="https://placehold.co/500x700.png" target="_blank" rel="noopener noreferrer">
                           <Image className="h-auto max-w-full rounded-lg shadow-md transition-transform hover:scale-105" src="https://placehold.co/500x700.png" alt="Guest lecture" data-ai-hint="classroom lecture" width={500} height={700} />
                        </Link>
                        <Link href="https://placehold.co/500x300.png" target="_blank" rel="noopener noreferrer">
                           <Image className="h-auto max-w-full rounded-lg shadow-md transition-transform hover:scale-105" src="https://placehold.co/500x300.png" alt="Library" data-ai-hint="university library" width={500} height={300} />
                        </Link>
                    </div>
                    <div className="grid gap-4">
                        <Link href="https://placehold.co/500x300.png" target="_blank" rel="noopener noreferrer">
                          <Image className="h-auto max-w-full rounded-lg shadow-md transition-transform hover:scale-105" src="https://placehold.co/500x300.png" alt="Sports day" data-ai-hint="campus sports" width={500} height={300} />
                        </Link>
                        <Link href="https://placehold.co/500x700.png" target="_blank" rel="noopener noreferrer">
                          <Image className="h-auto max-w-full rounded-lg shadow-md transition-transform hover:scale-105" src="https://placehold.co/500x700.png" alt="Group project" data-ai-hint="students group project" width={500} height={700} />
                        </Link>
                    </div>
                     <div className="grid gap-4">
                        <Link href="https://placehold.co/500x700.png" target="_blank" rel="noopener noreferrer">
                           <Image className="h-auto max-w-full rounded-lg shadow-md transition-transform hover:scale-105" src="https://placehold.co/500x700.png" alt="Code-a-thon" data-ai-hint="hackathon event" width={500} height={700} />
                        </Link>
                        <Link href="https://placehold.co/500x300.png" target="_blank" rel="noopener noreferrer">
                           <Image className="h-auto max-w-full rounded-lg shadow-md transition-transform hover:scale-105" src="https://placehold.co/500x300.png" alt="Graduation" data-ai-hint="graduation ceremony" width={500} height={300} />
                        </Link>
                    </div>
                </div>
              </AnimatedSection>
            </div>
        </section>

    </div>
  );
}
