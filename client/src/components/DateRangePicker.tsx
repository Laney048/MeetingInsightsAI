import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

const DateRangePicker = () => {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: lastMonth,
    to: endOfLastMonth
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-between w-[180px] px-3"
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {date?.from ? (
              date.to ? (
                <span>
                  {format(date.from, "MMM d")} - {format(date.to, "MMM d, yyyy")}
                </span>
              ) : (
                format(date.from, "MMM d, yyyy")
              )
            ) : (
              <span>Select date range</span>
            )}
          </div>
          <ChevronDownIcon className="h-4 w-4 text-muted-foreground ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={lastMonth}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
