"use client"

import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PitchDataPoint {
  pitch_number: number
  velocity: number
}

interface PitchTypeSeries {
  pitch_type: string
  data: PitchDataPoint[]
}

interface VelocityByPitchNumberResponse {
  filename: string
  series: PitchTypeSeries[]
}

// Color palette for different pitch types
const PITCH_COLORS: Record<string, string> = {
  Fastball: "#2563eb",    // Blue
  ChangeUp: "#16a34a",    // Green
  Slider: "#dc2626",      // Red
  Curveball: "#9333ea",   // Purple
  Sinker: "#ea580c",      // Orange
  Cutter: "#0891b2",      // Cyan
}

export function VelocityByPitchTypeChart({ fileId }: { fileId: string }) {
  const [chartData, setChartData] = React.useState<any[]>([])
  const [pitchTypes, setPitchTypes] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:8000/analysis/velocity_by_pitch_number/${fileId}`)
        const json: VelocityByPitchNumberResponse = await res.json()

        // Transform data for Recharts
        // We need format: [{ pitch_number: 1, Fastball: 80.1, ChangeUp: null }, ...]
        const pitchNumberMap = new Map<number, any>()
        const typesSet = new Set<string>()

        json.series.forEach(series => {
          typesSet.add(series.pitch_type)
          series.data.forEach(point => {
            if (!pitchNumberMap.has(point.pitch_number)) {
              pitchNumberMap.set(point.pitch_number, { pitch_number: point.pitch_number })
            }
            pitchNumberMap.get(point.pitch_number)![series.pitch_type] = point.velocity
          })
        })

        const formatted = Array.from(pitchNumberMap.values()).sort((a, b) => a.pitch_number - b.pitch_number)
        const types = Array.from(typesSet)

        console.log("Formatted chart data:", formatted)
        console.log("Pitch types:", types)

        setChartData(formatted)
        setPitchTypes(types)
      } catch (err: any) {
        console.error(err)
        setError("Failed to load velocity data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fileId])

  if (loading) return <p className="text-muted-foreground p-4">Loading velocity data...</p>
  if (error) return <p className="text-red-500 p-4">{error}</p>
  if (!chartData.length) return <p className="text-muted-foreground p-4">No velocity data available.</p>

  // Build chart config dynamically based on pitch types
  const chartConfig: any = {}
  pitchTypes.forEach((type, index) => {
    chartConfig[type] = {
      label: type,
      color: PITCH_COLORS[type] || `hsl(${index * 60}, 70%, 50%)`, // Fallback colors
    }
  })

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader>
        <CardTitle>Velocity by Pitch Type</CardTitle>
        <CardDescription>Track velocity trends across pitch numbers for each pitch type.</CardDescription>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="h-[420px] sm:h-[520px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{ top: 30, bottom: 30, left: 24, right: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="pitch_number"
              tickLine={false}
              axisLine={false}
              padding={{ left: 20, right: 20 }}
              label={{ value: "Pitch Number", position: "insideBottom", offset: -10 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              label={{ value: "Velocity (mph)", angle: -90, position: "insideLeft" }}
              domain={[70, 100]}
              ticks={[70, 75, 80, 85, 90, 95, 100]}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Pitch #${value}`}
                />
              }
            />

            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
            />

            {/* Render a Line for each pitch type */}
            {pitchTypes.map((type) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={chartConfig[type].color}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 6, strokeWidth: 2, fill: "#ffffff" }}
                connectNulls
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
