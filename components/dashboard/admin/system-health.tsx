'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Server, 
  Cpu,
  HardDrive,
  Wifi,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Loader2 
} from 'lucide-react';

interface SystemHealthProps {
  token: string;
  detailed?: boolean;
}

export function SystemHealth({ token, detailed = false }: SystemHealthProps) {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      // const data = await AdminAPI.getSystemHealth(token);
      // setHealth(data);
      
      // Mock data
      setHealth({
        status: 'healthy',
        uptime: '15d 7h 23m',
        cpu: {
          usage: 34,
          cores: 8,
          load: [2.1, 1.8, 1.5]
        },
        memory: {
          total: 16,
          used: 8.5,
          free: 7.5,
          usage: 53
        },
        disk: {
          total: 500,
          used: 320,
          free: 180,
          usage: 64
        },
        database: {
          status: 'connected',
          connections: 24,
          latency: 45,
          size: 2.4
        },
        api: {
          status: 'operational',
          requestsPerMinute: 234,
          errorRate: 0.5,
          avgResponseTime: 180
        },
        services: [
          { name: 'Authentication', status: 'operational' },
          { name: 'Database', status: 'operational' },
          { name: 'Storage', status: 'operational' },
          { name: 'Email', status: 'degraded' }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealth();
  };

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
        <div className="flex items-center gap-2">
          <CardTitle>System Health</CardTitle>
          <Badge className={
            health?.status === 'healthy' ? 'bg-green-500' :
            health?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
          }>
            {health?.status === 'healthy' ? <CheckCircle className="h-3 w-3 mr-1" /> : 
             <AlertCircle className="h-3 w-3 mr-1" />}
            {health?.status?.toUpperCase()}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Uptime */}
          <div className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span>Uptime: {health?.uptime}</span>
          </div>

          {/* CPU Usage */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className="text-sm">{health?.cpu.usage}%</span>
            </div>
            <Progress value={health?.cpu.usage} className="h-2" />
            {detailed && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Cores: {health?.cpu.cores}</span>
                <span>Load: {health?.cpu.load.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <span className="text-sm">{health?.memory.usage}%</span>
            </div>
            <Progress value={health?.memory.usage} className="h-2" />
            {detailed && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Total: {health?.memory.total}GB</span>
                <span>Used: {health?.memory.used}GB</span>
                <span>Free: {health?.memory.free}GB</span>
              </div>
            )}
          </div>

          {/* Disk Usage */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Disk Usage</span>
              </div>
              <span className="text-sm">{health?.disk.usage}%</span>
            </div>
            <Progress value={health?.disk.usage} className="h-2" />
            {detailed && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Total: {health?.disk.total}GB</span>
                <span>Used: {health?.disk.used}GB</span>
                <span>Free: {health?.disk.free}GB</span>
              </div>
            )}
          </div>

          {/* Database Status */}
          {detailed && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Database</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{health?.database.status}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="font-medium">{health?.database.connections}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latency</p>
                <p className="font-medium">{health?.database.latency}ms</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium">{health?.database.size}GB</p>
              </div>
            </div>
          )}

          {/* Services Status */}
          <div>
            <h4 className="text-sm font-medium mb-3">Services</h4>
            <div className="space-y-2">
              {health?.services.map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{service.name}</span>
                  <Badge className={
                    service.status === 'operational' ? 'bg-green-500' :
                    service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }>
                    {service.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* API Metrics */}
          {detailed && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">API Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Requests/min</p>
                  <p className="text-lg font-bold">{health?.api.requestsPerMinute}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Error Rate</p>
                  <p className="text-lg font-bold text-red-500">{health?.api.errorRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                  <p className="text-lg font-bold">{health?.api.avgResponseTime}ms</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}