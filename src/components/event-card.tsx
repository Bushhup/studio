import type { AppEvent } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { CalendarDays, Info, MapPin, Tag, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: AppEvent & { inchargeFacultyName?: string };
}

const eventTypeColors: Record<AppEvent['type'], string> = {
  lecture: 'bg-blue-500 text-blue-50',
  hackathon: 'bg-purple-500 text-purple-50',
  fest: 'bg-pink-500 text-pink-50',
  internship_fair: 'bg-green-500 text-green-50',
  exam: 'bg-red-500 text-red-50',
  notice: 'bg-yellow-500 text-yellow-900',
};

export function EventCard({ event }: EventCardProps) {
  const { title, date, description, type, image, dataAiHint, location, inchargeFacultyName } = event;
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {image && (
        <div className="relative h-48 w-full">
          <Image 
            src={image} 
            alt={title} 
            fill={true}
            style={{ objectFit: 'cover' }}
            data-ai-hint={dataAiHint || "event image"}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-2xl mb-1">{title}</CardTitle>
          <Badge className={cn("capitalize", eventTypeColors[type])}>
            <Tag className="mr-1 h-3 w-3" /> {type.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground pt-1">
          <CalendarDays className="mr-2 h-4 w-4" />
          <time dateTime={date}>{formattedDate}</time>
        </div>
         {location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
        {inchargeFacultyName && (
          <div className="flex items-center text-sm text-muted-foreground">
            <UserCheck className="mr-2 h-4 w-4" />
            <span>In-charge: {inchargeFacultyName}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-foreground/80 line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center">
           <Info className="mr-2 h-4 w-4" />
           <span>More details available.</span>
        </div>
      </CardFooter>
    </Card>
  );
}
