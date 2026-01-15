import { Download, FileSpreadsheet, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskExportMenuProps {
    context: 'user' | 'global' | 'team' | 'project';
    contextId?: string;
}

export function TaskExportMenu({ context, contextId }: TaskExportMenuProps) {
    const getExportUrl = (format: 'csv' | 'pdf') => {
        const params = new URLSearchParams();
        params.set('context', context);
        if (contextId) {
            params.set('context_id', contextId);
        }
        return `/tasks-export/${format}?${params.toString()}`;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <a href={getExportUrl('csv')} download>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        <span>Export to CSV</span>
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={getExportUrl('pdf')} download>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Export to PDF</span>
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
