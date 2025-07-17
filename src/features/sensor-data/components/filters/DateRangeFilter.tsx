import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, X } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from '../../types';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  className?: string;
}

// Preset date ranges
const DATE_PRESETS = [
  {
    label: '7 hari terakhir',
    value: '7d',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date())
    })
  },
  {
    label: '30 hari terakhir',
    value: '30d',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date())
    })
  },
  {
    label: '90 hari terakhir',
    value: '90d',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 89)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Hari ini',
    value: 'today',
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Kemarin',
    value: 'yesterday',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1))
    })
  }
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<string>('');

  // Format date range for display
  const formatDateRange = (range: DateRange): string => {
    try {
      if (!range.from || !range.to) {
        return 'Pilih rentang tanggal';
      }
      
      const fromStr = format(range.from, 'dd MMM yyyy', { locale: id });
      const toStr = format(range.to, 'dd MMM yyyy', { locale: id });
      
      if (format(range.from, 'yyyy-MM-dd') === format(range.to, 'yyyy-MM-dd')) {
        return fromStr;
      }
      
      return `${fromStr} - ${toStr}`;
    } catch (error) {
      return 'Rentang tanggal tidak valid';
    }
  };

  // Handle preset selection
  const handlePresetSelect = (presetValue: string) => {
    const preset = DATE_PRESETS.find(p => p.value === presetValue);
    if (preset) {
      const newRange = preset.getRange();
      onDateRangeChange(newRange);
      setSelectedPreset(presetValue);
      setIsOpen(false);
    }
  };

  // Handle custom date selection
  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to)
      });
      setSelectedPreset(''); // Clear preset selection for custom range
    }
  };

  // Clear date range
  const handleClear = () => {
    const defaultRange = DATE_PRESETS[0].getRange(); // Default to 7 days
    onDateRangeChange(defaultRange);
    setSelectedPreset(DATE_PRESETS[0].value);
  };

  // Check if current range matches a preset
  React.useEffect(() => {
    const matchingPreset = DATE_PRESETS.find(preset => {
      const presetRange = preset.getRange();
      return (
        format(dateRange.from, 'yyyy-MM-dd') === format(presetRange.from, 'yyyy-MM-dd') &&
        format(dateRange.to, 'yyyy-MM-dd') === format(presetRange.to, 'yyyy-MM-dd')
      );
    });
    
    setSelectedPreset(matchingPreset?.value || '');
  }, [dateRange]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Preset selector */}
      <Select value={selectedPreset} onValueChange={handlePresetSelect}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Pilih periode" />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map(preset => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom date range picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !dateRange.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="text-sm font-medium mb-2">Pilih Rentang Tanggal</div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to
              }}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={id}
              disabled={(date) => date > new Date()}
            />
            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                Maksimal 1 tahun
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Terapkan
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleClear}
        className="px-2"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};