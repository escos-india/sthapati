
import { Profile } from '@/app/lib/data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <Card className="h-full flex flex-col text-center items-center overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="h-20 w-full bg-gradient-to-r from-cyan-500 to-blue-600 relative">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
      </div>
      <div className="px-6 pb-6 -mt-10 relative flex flex-col items-center w-full">
        <Avatar className="h-20 w-20 mb-4 border-4 border-white dark:border-slate-900 shadow-xl">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} />
          <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
        </Avatar>
        <div className="mb-2">
          <p className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{profile.name}</p>
          <p className="text-sm text-muted-foreground">{profile.role}</p>
        </div>
        <div className="flex items-center gap-2 justify-center mt-2">
          {profile.followers !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800">
              <Users className="h-3 w-3" />
              <span>{profile.followers.toLocaleString()}</span>
            </Badge>
          )}
          {profile.activity !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800">
              <Zap className="h-3 w-3" />
              <span>{profile.activity}%</span>
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
