'use client';

import { router } from '@inertiajs/react';
import { CheckSquare, Folder, Loader2, Users } from 'lucide-react';
import * as React from 'react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';

interface SearchResult {
    id: string;
    name: string;
    description?: string;
    type: 'team' | 'project' | 'task';
    status?: string;
    url: string;
}

interface SearchResults {
    teams: SearchResult[];
    projects: SearchResult[];
    tasks: SearchResult[];
}

interface GlobalSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<SearchResults | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();

    // Reset state when dialog closes
    React.useEffect(() => {
        if (!open) {
            setQuery('');
            setResults(null);
        }
    }, [open]);

    // Debounced search
    React.useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.length < 2) {
            setResults(null);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/search?q=${encodeURIComponent(query)}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    setResults(data.results);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const handleSelect = (url: string) => {
        onOpenChange(false);
        router.visit(url);
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'in_progress':
                return 'text-blue-600';
            case 'pending':
                return 'text-yellow-600';
            default:
                return 'text-muted-foreground';
        }
    };

    const hasResults =
        results &&
        (results.teams.length > 0 ||
            results.projects.length > 0 ||
            results.tasks.length > 0);

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Search"
        >
            <CommandInput
                placeholder="Search teams, projects, tasks..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {isLoading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && query.length >= 2 && !hasResults && (
                    <CommandEmpty>No results found.</CommandEmpty>
                )}

                {!isLoading && query.length < 2 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        Type at least 2 characters to search...
                    </div>
                )}

                {!isLoading && hasResults && (
                    <>
                        {results.teams.length > 0 && (
                            <CommandGroup heading="Teams">
                                {results.teams.map((team) => (
                                    <CommandItem
                                        key={`team-${team.id}`}
                                        value={`team-${team.name}`}
                                        onSelect={() => handleSelect(team.url)}
                                        className="cursor-pointer"
                                    >
                                        <Users className="mr-2 h-4 w-4 text-blue-500" />
                                        <div className="flex flex-col">
                                            <span>{team.name}</span>
                                            {team.description && (
                                                <span className="text-xs text-muted-foreground line-clamp-1">
                                                    {team.description}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {results.teams.length > 0 &&
                            results.projects.length > 0 && <CommandSeparator />}

                        {results.projects.length > 0 && (
                            <CommandGroup heading="Projects">
                                {results.projects.map((project) => (
                                    <CommandItem
                                        key={`project-${project.id}`}
                                        value={`project-${project.name}`}
                                        onSelect={() =>
                                            handleSelect(project.url)
                                        }
                                        className="cursor-pointer"
                                    >
                                        <Folder className="mr-2 h-4 w-4 text-amber-500" />
                                        <div className="flex flex-col">
                                            <span>{project.name}</span>
                                            {project.description && (
                                                <span className="text-xs text-muted-foreground line-clamp-1">
                                                    {project.description}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {(results.teams.length > 0 ||
                            results.projects.length > 0) &&
                            results.tasks.length > 0 && <CommandSeparator />}

                        {results.tasks.length > 0 && (
                            <CommandGroup heading="Tasks">
                                {results.tasks.map((task) => (
                                    <CommandItem
                                        key={`task-${task.id}`}
                                        value={`task-${task.name}`}
                                        onSelect={() => handleSelect(task.url)}
                                        className="cursor-pointer"
                                    >
                                        <CheckSquare
                                            className={`mr-2 h-4 w-4 ${getStatusColor(task.status)}`}
                                        />
                                        <div className="flex flex-col">
                                            <span>{task.name}</span>
                                            {task.status && (
                                                <span
                                                    className={`text-xs ${getStatusColor(task.status)}`}
                                                >
                                                    {task.status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </>
                )}
            </CommandList>

            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
                <span>
                    Press <kbd className="rounded bg-muted px-1.5 py-0.5">↵</kbd> to select
                </span>
                <span>
                    <kbd className="rounded bg-muted px-1.5 py-0.5">Esc</kbd> to close
                </span>
            </div>
        </CommandDialog>
    );
}
