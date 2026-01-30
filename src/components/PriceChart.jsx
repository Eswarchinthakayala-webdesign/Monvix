import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const PriceChart = ({ history, currency = 'USD' }) => {
    if (!history || history.length === 0) {
        return (
            <div className="h-48 md:h-64 w-full flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl bg-black/20 text-sm">
                No price history available.
            </div>
        );
    }

    const data = history.map(item => ({
        ...item,
        date: new Date(item.checked_at),
        price: Number(item.price)
    }));

    return (
        <div className="h-[250px] md:h-[400px] w-full bg-transparent rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(date, 'MMM d')}
                        stroke="#666"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis 
                        stroke="#666"
                        fontSize={10}
                        tickFormatter={(val) => {
                            if (val >= 1000) return `${currency === 'USD' ? '$' : currency}${val/1000}k`;
                            return `${currency === 'USD' ? '$' : currency}${val}`;
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={45}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: 'var(--primary)' }}
                        labelFormatter={(date) => format(date, 'MMM d, p')}
                        formatter={(value) => [`${currency === 'USD' ? '$' : currency} ${value}`, 'Price']}
                        cursor={{ stroke: 'white', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.3 }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="var(--primary)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        animationDuration={1500}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PriceChart;
