import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeetingRecommendation } from "@shared/schema";
import { X, Clock, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecommendationItemProps {
  recommendation: MeetingRecommendation;
}

const RecommendationItem = ({ recommendation }: RecommendationItemProps) => {
  const { toast } = useToast();
  
  const handleAction = (action: string) => {
    toast({
      title: `Action: ${action}`,
      description: `Applied to "${recommendation.title}"`,
    });
  };
  
  return (
    <li className="pb-3 border-b border-border last:border-0 last:pb-0">
      <p className="text-sm font-medium">{recommendation.title}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {recommendation.durationMinutes}min - {recommendation.participants} participants
      </p>
      {recommendation.suggestion && (
        <p className="text-xs text-primary mt-1">{recommendation.suggestion}</p>
      )}
      <div className="flex mt-2">
        {recommendation.recommendationType === 'decline' && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs mr-2 bg-danger-light text-danger border-0"
              onClick={() => handleAction('Decline')}
            >
              Decline
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs bg-muted text-muted-foreground border-0"
              onClick={() => handleAction('Keep')}
            >
              Keep
            </Button>
          </>
        )}
        
        {recommendation.recommendationType === 'async' && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs mr-2 bg-warning-light text-warning border-0"
              onClick={() => handleAction('Make Async')}
            >
              Make Async
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs bg-muted text-muted-foreground border-0"
              onClick={() => handleAction('Keep')}
            >
              Keep
            </Button>
          </>
        )}
        
        {recommendation.recommendationType === 'optimize' && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs mr-2 bg-success-light text-success border-0"
              onClick={() => handleAction('Apply')}
            >
              Apply
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs bg-muted text-muted-foreground border-0"
              onClick={() => handleAction('Ignore')}
            >
              Ignore
            </Button>
          </>
        )}
      </div>
    </li>
  );
};

interface RecommendationsProps {
  recommendations: MeetingRecommendation[];
}

const Recommendations = ({ recommendations }: RecommendationsProps) => {
  // Separate recommendations by type
  const declineRecs = recommendations.filter(r => r.recommendationType === 'decline');
  const asyncRecs = recommendations.filter(r => r.recommendationType === 'async');
  const optimizeRecs = recommendations.filter(r => r.recommendationType === 'optimize');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-danger-light flex items-center justify-center text-danger mr-3">
              <X className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold">Meetings to Decline</h3>
          </div>
          
          {declineRecs.length > 0 ? (
            <ul className="space-y-3">
              {declineRecs.map(rec => (
                <RecommendationItem key={rec.id} recommendation={rec} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No meetings recommended for declining at this time.
            </p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-warning-light flex items-center justify-center text-warning mr-3">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold">Make Async</h3>
          </div>
          
          {asyncRecs.length > 0 ? (
            <ul className="space-y-3">
              {asyncRecs.map(rec => (
                <RecommendationItem key={rec.id} recommendation={rec} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No meetings recommended for async conversion at this time.
            </p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center text-success mr-3">
              <Settings className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold">Optimize Meetings</h3>
          </div>
          
          {optimizeRecs.length > 0 ? (
            <ul className="space-y-3">
              {optimizeRecs.map(rec => (
                <RecommendationItem key={rec.id} recommendation={rec} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No meetings recommended for optimization at this time.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommendations;
