import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FILTER_OPTIONS, type FilterOption } from '@/config/constants'
import { ListFilter, ArrowUpDown } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface TodoFiltersProps {
    filter: FilterOption
    onFilterChange: (filter: FilterOption) => void
    sort: string
    onSortChange: (sort: string) => void
}

export function TodoFilters({ filter, onFilterChange, sort, onSortChange }: TodoFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1">
                {FILTER_OPTIONS.map((f) => (
                    <button
                        key={f}
                        onClick={() => onFilterChange(f)}
                        className={cn(
                            'relative px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize',
                            filter === f
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground/70'
                        )}
                    >
                        {filter === f && (
                            <motion.div
                                layoutId="filter-tab"
                                className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-md"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{f}</span>
                    </button>
                ))}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ListFilter className="w-3.5 h-3.5" />
                    <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <Select value={sort} onValueChange={onSortChange}>
                    <SelectTrigger className="h-8 w-[120px] text-xs bg-secondary/30">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="due_date">Due Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
