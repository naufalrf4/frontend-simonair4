import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { FeedRecord } from '../types';

export interface FeedDetailsModalProps {
  open: boolean;
  feed: FeedRecord | null;
  onClose: () => void;
  onEdit?: (feed: FeedRecord) => void;
}

function formatWIB(iso?: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Jakarta' }).format(d);
  const dayNum = new Intl.DateTimeFormat('en-US', { day: '2-digit', timeZone: 'Asia/Jakarta' }).format(d);
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'Asia/Jakarta' }).format(d);
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Asia/Jakarta' }).format(d);
  const hm = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).format(d);
  return `${dayName}, ${dayNum} ${monthName} ${year} ${hm} WIB`;
}

export const FeedDetailsModal: React.FC<FeedDetailsModalProps> = ({ open, feed, onClose, onEdit }) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feed Details</DialogTitle>
        </DialogHeader>
        {feed ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Device</span><span className="font-medium">{feed.deviceId}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Feed Name</span><span className="font-medium">{feed.feedName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{feed.feedType}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount (kg)</span><span className="font-medium">{feed.feedAmountKg.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Event Time</span><span className="font-medium">{formatWIB(feed.fedAt || feed.createdAt)}</span></div>
            {feed.feedingSchedule && (
              <div>
                <div className="text-muted-foreground mb-1">Schedule</div>
                <pre className="bg-muted rounded p-2 text-xs overflow-auto">{JSON.stringify(feed.feedingSchedule, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No feed selected</div>
        )}
        <DialogFooter>
          {feed && (
            <Button variant="outline" onClick={() => onEdit?.(feed)}>Edit</Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
