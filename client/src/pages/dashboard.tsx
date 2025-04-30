import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SummaryCards from "@/components/SummaryCards";
import MeetingTrendChart from "@/components/MeetingTrendChart";
import MeetingTable from "@/components/MeetingTable";
import FileUpload from "@/components/FileUpload";
import MetricsBreakdown from "@/components/MetricsBreakdown";
import Recommendations from "@/components/Recommendations";
import DateRangePicker from "@/components/DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { 
  CalendarIcon, 
  UploadIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMeetings } from "@/lib/hooks/use-meetings";

export default function Dashboard() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { analytics, isLoading } = useMeetings();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Meeting Analyzer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Analyze and improve your meeting efficiency</p>
        </div>
        
        <div className="flex items-center gap-2">
          <DateRangePicker />
          
          <Button onClick={() => setShowUploadDialog(true)} className="ml-2">
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <SummaryCards summary={analytics?.summary} />
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <Card className="lg:col-span-2 p-5">
              <Skeleton className="h-4 w-[150px] mb-6" />
              <Skeleton className="h-[250px] w-full" />
            </Card>
            <Card className="p-5">
              <Skeleton className="h-4 w-[180px] mb-6" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-3 w-[140px]" />
                      <Skeleton className="h-3 w-[30px]" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <>
            <div className="lg:col-span-2">
              <MeetingTrendChart trends={analytics?.trends} />
            </div>
            <MetricsBreakdown metrics={analytics?.metrics} />
          </>
        )}
      </div>

      {/* Meetings Table */}
      {isLoading ? (
        <Card className="overflow-hidden">
          <div className="p-5 border-b">
            <Skeleton className="h-6 w-[180px]" />
          </div>
          <div className="p-4">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </Card>
      ) : (
        <MeetingTable meetings={analytics?.meetings} />
      )}

      {/* Recommendations Section */}
      {!isLoading && analytics?.recommendations && (
        <>
          <h2 className="text-lg font-semibold text-neutral-800 mt-6">AI Recommendations</h2>
          <Recommendations recommendations={analytics.recommendations} />
        </>
      )}

      {/* CSV Upload Dialog */}
      <FileUpload 
        open={showUploadDialog} 
        onOpenChange={setShowUploadDialog}
      />
    </div>
  );
}
