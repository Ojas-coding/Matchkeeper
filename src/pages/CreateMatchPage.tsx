import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMatch, getEventById } from "@/services/dataService";
import MainNav from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { CalendarIcon, ArrowLeft, Clock, Info, PartyPopper, Users } from "lucide-react";
import { toast } from "sonner";
import { MatchStatus } from "@/types";
import { Calendar as CalendarInput } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Added this import

const CreateMatchPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeString, setTimeString] = useState("12:00");
  const [status, setStatus] = useState<MatchStatus>("scheduled");

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId || ""),
    enabled: !!eventId,
  });

  useEffect(() => {
    if (event && !date) {
      setDate(new Date(event.date));
    }
  }, [event, date]);

  const createMatchMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: (data) => {
      toast.success(
        <div className="flex items-center">
          <PartyPopper className="mr-2 h-5 w-5 text-green-500" />
          Match "{data.title}" created successfully!
        </div>
      );
      queryClient.invalidateQueries({ queryKey: ['matches', eventId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      navigate(`/events/${eventId}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create match: ${error.message || "Unknown error"}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !teamA || !teamB || !date || !timeString) {
      toast.error("Please fill in all required fields.", {
        icon: <Info className="mr-2 h-5 w-5 text-yellow-500" />,
      });
      return;
    }
    
    if (!eventId || !event) {
      toast.error("Event information is missing. Cannot create match.");
      return;
    }
    
    const parsedTime = parse(timeString, "HH:mm", new Date());
    const startTime = new Date(date);
    startTime.setHours(parsedTime.getHours(), parsedTime.getMinutes(), 0, 0);
    
    if (format(startTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && startTime < new Date()) {
        toast.error("Match start time cannot be in the past for today's date.", {
            icon: <Clock className="mr-2 h-5 w-5 text-yellow-500" />,
        });
        return;
    }

    createMatchMutation.mutate({
      eventId,
      title,
      teamA,
      teamB,
      startTime: startTime.toISOString(),
      status,
      sport: event.sport, // Use the sport from the event
      notes: notes || undefined
    });
  };

  if (isLoadingEvent && !event) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <MainNav />
        <main className="flex-1 container py-8 text-center">
          <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 mx-auto mb-8" />
          <Card className="max-w-3xl mx-auto shadow-xl"><CardContent className="p-8"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <MainNav />
      
      <main className="flex-1 container py-8">
         <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-6 hover:bg-primary/10 hover:border-primary"
            onClick={() => navigate(eventId ? `/events/${eventId}` : '/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {event ? `Back to ${event.title}` : "Back to Events"}
          </Button>
        </div>
        
        <Card className="max-w-3xl mx-auto shadow-xl border-border/60">
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create New Match</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {event ? `Add a match for the event: "${event.title}"` : "Fill in match details below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-semibold">Match Title *</Label>
                <Input
                  id="title"
                  placeholder="E.g., Quarter-Final 1, Team X vs Team Y"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="teamA" className="font-semibold">Team / Player A *</Label>
                  <Input
                    id="teamA"
                    placeholder="Enter first team or player"
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                    required
                    className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="teamB" className="font-semibold">Team / Player B *</Label>
                  <Input
                    id="teamB"
                    placeholder="Enter second team or player"
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                    required
                    className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="font-semibold block mb-1">Match Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11 bg-input hover:bg-muted/70",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarInput
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(d) => event ? (d < new Date(new Date(event.date).setHours(0,0,0,0))) : d < new Date(new Date().setDate(new Date().getDate() -1))}
                        className="p-3 pointer-events-auto bg-card"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="time" className="font-semibold">Match Start Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={timeString}
                      onChange={(e) => setTimeString(e.target.value)}
                      required
                      className="h-11 pl-10 bg-input focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Initial Match Status</Label>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    type="button"
                    variant={status === "scheduled" ? "default" : "outline"}
                    onClick={() => setStatus("scheduled")}
                    className={`capitalize ${status === "scheduled" ? 'ring-2 ring-primary ring-offset-background' : 'border-gray-300 hover:border-primary'}`}
                  >
                    Scheduled
                  </Button>
                  <Button
                    type="button"
                    variant={status === "ongoing" ? "default" : "outline"}
                    onClick={() => setStatus("ongoing")}
                    className={`capitalize ${status === "ongoing" ? 'ring-2 ring-primary ring-offset-background' : 'border-gray-300 hover:border-primary'}`}
                  >
                    Ongoing
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground pt-1">You can change this later (e.g., to completed or cancelled).</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="font-semibold">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="E.g., Court 3, Referee: John Smith, any special conditions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold" 
                  disabled={createMatchMutation.isPending}
                >
                  {createMatchMutation.isPending ? "Creating Match..." : "Create Match"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateMatchPage;
