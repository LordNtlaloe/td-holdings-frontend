'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search,
    Filter,
    Download,
    User,
    Shield,
    Settings,
    Database,
    LogIn,
    LogOut,
    Edit,
    Trash2,
    Eye,
    Loader2
} from 'lucide-react';

interface AuditLogsProps {
    token: string;
}

export function AuditLogs({ token }: AuditLogsProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // const data = await AdminAPI.getAuditLogs(token);
                // setLogs(data);

                // Mock data
                setLogs([
                    {
                        id: '1',
                        timestamp: new Date().toISOString(),
                        user: 'John Doe',
                        action: 'LOGIN',
                        resource: 'Authentication',
                        details: 'User logged in successfully',
                        ip: '192.168.1.100'
                    },
                    {
                        id: '2',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        user: 'Jane Smith',
                        action: 'UPDATE',
                        resource: 'Product',
                        details: 'Updated product price for Tire 205/65 R15',
                        ip: '192.168.1.101'
                    },
                    {
                        id: '3',
                        timestamp: new Date(Date.now() - 7200000).toISOString(),
                        user: 'Admin User',
                        action: 'DELETE',
                        resource: 'User',
                        details: 'Deleted inactive user account',
                        ip: '192.168.1.102'
                    },
                    {
                        id: '4',
                        timestamp: new Date(Date.now() - 86400000).toISOString(),
                        user: 'System',
                        action: 'BACKUP',
                        resource: 'Database',
                        details: 'Automated database backup completed',
                        ip: 'System'
                    }
                ]);
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [token]);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'LOGIN': return <LogIn className="h-4 w-4 text-green-500" />;
            case 'LOGOUT': return <LogOut className="h-4 w-4 text-orange-500" />;
            case 'CREATE': return <Edit className="h-4 w-4 text-blue-500" />;
            case 'UPDATE': return <Settings className="h-4 w-4 text-yellow-500" />;
            case 'DELETE': return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'VIEW': return <Eye className="h-4 w-4 text-purple-500" />;
            case 'BACKUP': return <Database className="h-4 w-4 text-cyan-500" />;
            default: return <Shield className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActionBadge = (action: string) => {
        const variants: Record<string, string> = {
            LOGIN: 'bg-green-100 text-green-800',
            LOGOUT: 'bg-orange-100 text-orange-800',
            CREATE: 'bg-blue-100 text-blue-800',
            UPDATE: 'bg-yellow-100 text-yellow-800',
            DELETE: 'bg-red-100 text-red-800',
            VIEW: 'bg-purple-100 text-purple-800',
            BACKUP: 'bg-cyan-100 text-cyan-800'
        };

        return variants[action] || 'bg-gray-100 text-gray-800';
    };

    const filteredLogs = logs.filter(log =>
        (filter === 'all' || log.action === filter) &&
        (log.user.toLowerCase().includes(search.toLowerCase()) ||
            log.resource.toLowerCase().includes(search.toLowerCase()) ||
            log.details.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Audit Logs</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-3 py-2 border rounded-md"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Actions</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="VIEW">View</option>
                        <option value="BACKUP">Backup</option>
                    </select>
                </div>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Resource</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No audit logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {log.user}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getActionIcon(log.action)}
                                                <Badge className={getActionBadge(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>{log.resource}</TableCell>
                                        <TableCell className="max-w-md truncate">{log.details}</TableCell>
                                        <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}