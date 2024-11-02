import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, Server, Cpu, Activity } from 'lucide-react';
import _ from 'lodash';

// Seeded random number generator
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }

  // Linear Congruential Generator
  random() {
    this.seed = (1664525 * this.seed + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}

const SystemDashboard = () => {
  const seededRandom = new SeededRandom(12345);
  
  // Generate mock data
  const generateTimeSeriesData = (points, base, variance) => {
    return Array.from({ length: points }, (_, i) => ({
      timestamp: new Date(Date.now() - (points - i) * 60000).toISOString(),
      value: base + seededRandom.random() * variance
    }));
  };

  const generateMetricData = () => ({
    cpu: generateTimeSeriesData(100, 45, 30),
    memory: generateTimeSeriesData(100, 75, 15),
    network: generateTimeSeriesData(100, 60, 25),
    disk: generateTimeSeriesData(100, 50, 20),
    errorRate: generateTimeSeriesData(100, 2, 3),
    responseTime: generateTimeSeriesData(100, 250, 150),
  });

  const [metrics, setMetrics] = useState(generateMetricData());
  const [activeIncidents, setActiveIncidents] = useState(2);
  const [systemHealth, setSystemHealth] = useState(94);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateMetricData());
      setSystemHealth(Math.min(100, Math.max(0, systemHealth + (seededRandom.random() - 0.5) * 2)));
      setActiveIncidents(Math.max(0, activeIncidents + (seededRandom.random() < 0.3 ? 1 : -1)));
    }, 5000);
    return () => clearInterval(interval);
  }, [systemHealth, activeIncidents]);

  const SimpleOverview = () => (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>System Health Overview</CardTitle>
          <CardDescription>Current system status and health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {systemHealth > 90 ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              )}
              <div>
                <div className="text-2xl font-bold">{systemHealth.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Overall Health</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{activeIncidents}</div>
              <div className="text-sm text-gray-500">Active Incidents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeIncidents > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Active Incidents Detected</AlertTitle>
          <AlertDescription>
            There are currently {activeIncidents} active incidents requiring attention.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const DetailedMetrics = () => (
    <div className="grid gap-4">
      {/* CPU Usage Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4" />
            <CardTitle>CPU Usage</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.cpu}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="CPU %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <CardTitle>Memory Usage</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.memory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Network Traffic Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <CardTitle>Network Traffic</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.network}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Network Usage %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Disk Usage Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <CardTitle>Disk Usage</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.disk}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#ffc658" name="Disk Usage %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Error Rate Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <CardTitle>Error Rate</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.errorRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#ff7300" name="Errors/min" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Response Time Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <CardTitle>Response Time</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.responseTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#413ea0" name="Response Time (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* System Resources Distribution */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <CardTitle>Resource Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'CPU', value: _.last(metrics.cpu)?.value || 0 },
                    { name: 'Memory', value: _.last(metrics.memory)?.value || 0 },
                    { name: 'Disk', value: _.last(metrics.disk)?.value || 0 },
                    { name: 'Network', value: _.last(metrics.network)?.value || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-4 w-full">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <SimpleOverview />
        </TabsContent>
        <TabsContent value="detailed">
          <DetailedMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemDashboard;