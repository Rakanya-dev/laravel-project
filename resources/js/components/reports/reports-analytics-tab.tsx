import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { MonitorPlay, Power } from 'lucide-react';

interface AnalyticsProps {
    data: {
        monthlyTrends: any[];
        domainPerformance: any[];
        outcomeDistribution: any[];
    };
}

// --- HELPER: TV Overlay Component ---
const TvOverlay = () => (
    <div className="absolute inset-0 w-full h-full z-20 flex items-center justify-center bg-black animate-in fade-in duration-1000 pointer-events-none">
        <img
            src="/images/vox.gif"
            alt="Signal Intercepted"
            className="w-full h-full object-cover opacity-90"
        />
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%]"></div>
    </div>
);

export function ReportsAnalyticsTab({ data }: AnalyticsProps) {
    const rankedDomains = [...data.domainPerformance].sort((a, b) => b.score - a.score);

    // State to toggle the "TV Channel"
    const [showTvChannel, setShowTvChannel] = useState(false);

    // Ref for the hover timer
    const hoverTimer = useRef<any>(null);

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (hoverTimer.current) clearTimeout(hoverTimer.current);
        };
    }, []);

    // --- SHARED HOVER LOGIC ---
    const handleMouseEnter = () => {
        // Start a timer when mouse enters ANY card
        if (hoverTimer.current) clearTimeout(hoverTimer.current);

        hoverTimer.current = setTimeout(() => {
            if (!showTvChannel) {
                setShowTvChannel(true);
                toast("System Override", {
                    icon: <MonitorPlay className="size-4 text-cyan-500" />,
                    description: "Broadcast signal intercepted..."
                });
            }
        }, 3000); // 3 seconds delay
    };

    const handleMouseLeave = () => {
        // Cancel timer if leaving
        if (hoverTimer.current) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
        }
        // Turn off TV when leaving
        setShowTvChannel(false);
    };

    // Common card classes for the TV effect
    const tvCardClass = `relative group transition-all duration-500 overflow-hidden ${
        showTvChannel ? 'bg-black ring-2 ring-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : ''
    }`;

    // Common header title classes
    const tvTitleClass = (baseClass: string) => `text-sm font-medium transition-opacity duration-300 ${
        showTvChannel ? 'opacity-0' : 'opacity-100'
    } ${baseClass}`;

    return (
        <div className="space-y-6">
            {/* Row 1: Trends & Domain Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                    className={tvCardClass}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {showTvChannel && <TvOverlay />}
                    <CardHeader className="relative z-30">
                        <CardTitle className={tvTitleClass("")}>Monthly Assessment Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.monthlyTrends}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                                <YAxis stroke="#666" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }} />
                                <Legend />
                                <Area type="monotone" dataKey="assessments" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total" />
                                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card
                    className={tvCardClass}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {showTvChannel && <TvOverlay />}
                    <CardHeader className="relative z-30">
                        <CardTitle className={tvTitleClass("")}>Domain Rankings (Strengths & Weaknesses)</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={rankedDomains} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="domain" type="category" width={100} tick={{ fontSize: 11, fill: '#666' }} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Avg Score" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Outcome Pie & Domain Profile Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                    className={tvCardClass}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {showTvChannel && <TvOverlay />}
                    <CardHeader className="flex flex-row items-center justify-between relative z-30">
                        <CardTitle className={tvTitleClass("")}>Outcome Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.outcomeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.outcomeDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={tvCardClass}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {showTvChannel && <TvOverlay />}
                    <CardHeader className="relative z-30">
                        <CardTitle className={tvTitleClass("")}>Developmental Profile (Skill Balance)</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.domainPerformance}>
                                <PolarGrid stroke="#e5e5e5" />
                                <PolarAngleAxis dataKey="domain" tick={{ fill: '#666', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Class Average"
                                    dataKey="score"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fill="#8b5cf6"
                                    fillOpacity={0.4}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
