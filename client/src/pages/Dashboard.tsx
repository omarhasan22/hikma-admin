import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { Users, Stethoscope, Building2, Activity, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 600 },
  { name: 'Mar', users: 800 },
  { name: 'Apr', users: 1200 },
  { name: 'May', users: 1800 },
  { name: 'Jun', users: 2400 },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of system performance and metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
          // trend="+12%"
          />
          <StatCard
            title="Total Doctors"
            value={stats?.totalDoctors || 0}
            icon={Stethoscope}
          // trend="+5%"
          />
          <StatCard
            title="Organizations"
            value={stats?.totalOrganizations || 0}
            icon={Building2}
          // trend="+2%"
          />
          <StatCard
            title="Active Specialties"
            value={stats?.activeServices || 0}
            icon={Activity}
          />
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold font-display">User Growth</h3>
                <p className="text-sm text-muted-foreground">New registrations over time</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-xl shadow-primary/20 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-display font-bold">Quick Actions</h3>
              <p className="text-primary-foreground/80 mt-1 text-sm">Common administrative tasks</p>
            </div>
            
            <div className="space-y-3 mt-8">
              <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-left transition-colors font-medium flex items-center gap-3">
                <Stethoscope className="w-5 h-5" />
                Verify New Doctors
              </button>
              <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-left transition-colors font-medium flex items-center gap-3">
                <Building2 className="w-5 h-5" />
                Review Organizations
              </button>
              <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-left transition-colors font-medium flex items-center gap-3">
                <Users className="w-5 h-5" />
                Manage Users
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </DashboardLayout>
  );
}
