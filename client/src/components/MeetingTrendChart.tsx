import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendData } from "@shared/schema";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { Button } from "@/components/ui/button";

interface MeetingTrendChartProps {
  trends?: TrendData[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded-md shadow-sm">
        <p className="font-medium text-sm">{`Week ${label.slice(1)}: ${payload[0].value}%`}</p>
      </div>
    );
  }

  return null;
};

const MeetingTrendChart = ({ trends = [] }: MeetingTrendChartProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Meeting Usefulness Trend</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-xs bg-primary/10 text-primary border-0">
            Weekly
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            Monthly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="usefulnessPercentage" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No trend data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingTrendChart;
