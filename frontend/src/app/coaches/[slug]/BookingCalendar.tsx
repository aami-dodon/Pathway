"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { API_BASE_URL } from "@/lib/api";

interface AvailableSlot {
    start: string;
    end: string;
}

interface BookingCalendarProps {
    coachId: string;
    coachName: string;
    timezone: string;
}

export default function BookingCalendar({
    coachId,
    coachName,
    timezone,
}: BookingCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [slots, setSlots] = useState<AvailableSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [loading, setLoading] = useState(false);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        topic: "",
        notes: "",
    });

    // Fetch slots when date is selected
    const fetchSlots = useCallback(async (date: Date) => {
        setLoading(true);
        setSlots([]);
        setSelectedSlot(null);

        try {
            const fromDate = new Date(date);
            fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(date);
            toDate.setHours(23, 59, 59, 999);

            const response = await fetch(
                `${API_BASE_URL}/api/availability?coach=${coachId}&from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
            );

            if (!response.ok) {
                console.error("Failed to fetch availability");
                return;
            }

            const data = await response.json();
            setSlots(data.slots || []);
        } catch (error) {
            console.error("Error fetching slots:", error);
        } finally {
            setLoading(false);
        }
    }, [coachId]);

    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate, fetchSlots]);

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days: (Date | null)[] = [];

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isPast = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isSelected = (date: Date) => {
        return selectedDate?.toDateString() === date.toDateString();
    };

    const formatSlotTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: timezone || "UTC",
        });
    };

    const handleBookSession = async () => {
        if (!selectedSlot || !formData.name || !formData.email) return;

        setBookingLoading(true);
        setBookingError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/coaching-sessions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionTitle: `Coaching Session with ${coachName}`,
                    coach: coachId,
                    bookerName: formData.name,
                    bookerEmail: formData.email,
                    bookerPhone: formData.phone || undefined,
                    scheduledAt: selectedSlot.start,
                    duration: 30,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    topic: formData.topic || undefined,
                    bookerNotes: formData.notes || undefined,
                    status: "pending",
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.errors?.[0]?.message || "Booking failed");
            }

            setBookingSuccess(true);
            // Reset form
            setFormData({ name: "", email: "", phone: "", topic: "", notes: "" });
            setSelectedSlot(null);
            // Refresh slots
            if (selectedDate) {
                fetchSlots(selectedDate);
            }
        } catch (error) {
            console.error("Booking error:", error);
            setBookingError(error instanceof Error ? error.message : "Failed to book session");
        } finally {
            setBookingLoading(false);
        }
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = getDaysInMonth(currentMonth);

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                        setCurrentMonth(
                            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                        )
                    }
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">
                    {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                    })}
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                        setCurrentMonth(
                            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                        )
                    }
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                    <div key={index} className="aspect-square">
                        {day && (
                            <button
                                onClick={() => !isPast(day) && setSelectedDate(day)}
                                disabled={isPast(day)}
                                className={`w-full h-full rounded-lg text-sm font-medium transition-all
                                    ${isPast(day)
                                        ? "text-muted-foreground/40 cursor-not-allowed"
                                        : "hover:bg-primary/10"
                                    }
                                    ${isToday(day) ? "ring-1 ring-primary" : ""}
                                    ${isSelected(day)
                                        ? "bg-primary text-primary-foreground hover:bg-primary"
                                        : ""
                                    }
                                `}
                            >
                                {day.getDate()}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Selected Date & Slots */}
            {selectedDate && (
                <div className="mt-6 pt-6 border-t border-border/50">
                    <h4 className="font-medium mb-3">
                        {selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </h4>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : slots.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No available slots for this day
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {slots.map((slot, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedSlot(slot);
                                        setBookingDialogOpen(true);
                                        setBookingSuccess(false);
                                        setBookingError(null);
                                    }}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all
                                        ${selectedSlot?.start === slot.start
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
                                        }
                                    `}
                                >
                                    {formatSlotTime(slot.start)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Booking Dialog */}
            <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    {bookingSuccess ? (
                        <>
                            <DialogHeader>
                                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <DialogTitle className="text-center">
                                    Booking Confirmed!
                                </DialogTitle>
                                <DialogDescription className="text-center">
                                    Your session has been booked. You&apos;ll receive a confirmation
                                    email with details and the meeting link.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => setBookingDialogOpen(false)}
                                >
                                    Done
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>Book Your Session</DialogTitle>
                                <DialogDescription>
                                    Confirm your booking with {coachName} on{" "}
                                    {selectedDate?.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                    })}{" "}
                                    at {selectedSlot && formatSlotTime(selectedSlot.start)}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Your full name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone (optional)</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="topic">
                                        What would you like to discuss?
                                    </Label>
                                    <Textarea
                                        id="topic"
                                        placeholder="Brief description of your goals..."
                                        value={formData.topic}
                                        onChange={(e) =>
                                            setFormData({ ...formData, topic: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Additional notes (optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any other information..."
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({ ...formData, notes: e.target.value })
                                        }
                                    />
                                </div>

                                {bookingError && (
                                    <p className="text-sm text-red-500">{bookingError}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setBookingDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleBookSession}
                                    disabled={
                                        bookingLoading || !formData.name || !formData.email
                                    }
                                >
                                    {bookingLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Booking...
                                        </>
                                    ) : (
                                        "Confirm Booking"
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
