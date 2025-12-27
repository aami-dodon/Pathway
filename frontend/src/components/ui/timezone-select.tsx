"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface TimezoneSelectProps {
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function TimezoneSelect({
    value,
    onValueChange,
    placeholder = "Select timezone...",
    className,
}: TimezoneSelectProps) {
    const [open, setOpen] = React.useState(false)

    // Memoize timezones to avoid recalculation
    const timezones = React.useMemo(() => {
        return [
            { label: "UTC", value: "UTC" },
            ...Intl.supportedValuesOf("timeZone").map((tz) => ({
                label: tz.replace(/_/g, " "),
                value: tz,
            }))
        ]
    }, [])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {value
                        ? timezones.find((tz) => tz.value === value)?.label || value
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search timezone..." />
                    <CommandList>
                        <CommandEmpty>No timezone found.</CommandEmpty>
                        <CommandGroup>
                            {timezones.map((tz) => (
                                <CommandItem
                                    key={tz.value}
                                    value={tz.label} // Search by label (friendly name)
                                    onSelect={() => {
                                        onValueChange(tz.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === tz.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {tz.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
