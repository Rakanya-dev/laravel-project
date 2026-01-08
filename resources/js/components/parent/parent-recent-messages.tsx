import { MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: number;
  sender: string;
  preview: string;
  time: string;
  unread: boolean;
}

interface ParentRecentMessagesProps {
  messages?: Message[];
  onViewAll?: () => void;
}

const defaultMessages: Message[] = [
  { id: 1, sender: 'Teacher Santos', preview: 'Great progress in reading today!', time: '2h ago', unread: true },
  { id: 2, sender: 'School Admin', preview: 'Reminder: Parent-teacher meeting next week.', time: '1d ago', unread: false }
];

export default function ParentRecentMessages({
  messages = defaultMessages,
  onViewAll
}: ParentRecentMessagesProps) {
  return (
    <Card className="h-full border-slate-200 shadow-sm flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="size-5 text-green-600" />
              Messages
            </CardTitle>
            <CardDescription>Recent communications</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            View All <ArrowRight className="ml-1 size-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {messages.length > 0 ? (
            messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${message.unread ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                <div className="relative">
                    <Avatar className="size-10 border border-slate-100">
                    <AvatarFallback className={`${message.unread ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'} font-medium text-xs`}>
                        {message.sender.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                    </Avatar>
                    {message.unread && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${message.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{message.sender}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{message.time}</span>
                </div>
                <p className={`text-xs mt-0.5 line-clamp-1 ${message.unread ? 'text-slate-700' : 'text-slate-500'}`}>{message.preview}</p>
                </div>
            </div>
            ))
        ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No new messages.</div>
        )}
      </CardContent>
    </Card>
  );
}
