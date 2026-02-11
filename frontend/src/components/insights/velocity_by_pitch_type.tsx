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
  const [activePitchType, setActivePitchType] = React.useState<string>("All")
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
      color: PITCH_COLORS[type] || `hsl(${index * 60}, 70%, 50%)`,
    }
  })

  // Re-index x from 1 for both "All" and single pitch type views
  const displayData = activePitchType === "All"
    ? chartData.map((point, index) => ({ ...point, pitch_number: index + 1 }))
    : chartData
        .filter(point => point[activePitchType] != null)
        .map((point, index) => ({ ...point, pitch_number: index + 1 }))

  const displayTypes = activePitchType === "All" ? pitchTypes : [activePitchType]

  // Dynamic Y-axis: min velocity - 5 to max velocity + 5
  let minVel = Infinity
  let maxVel = -Infinity
  displayData.forEach(point => {
    displayTypes.forEach(type => {
      const v = point[type]
      if (v != null) {
        if (v < minVel) minVel = v
        if (v > maxVel) maxVel = v
      }
    })
  })
  const yMin = minVel === Infinity ? 70 : Math.floor(minVel) - 5
  const yMax = maxVel === -Infinity ? 100 : Math.ceil(maxVel) + 5
  const yTicks: number[] = []
  for (let t = Math.ceil(yMin / 5) * 5; t <= yMax; t += 5) {
    yTicks.push(t)
  }

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader>
        <CardTitle>Velocity by Pitch Type</CardTitle>
        <CardDescription>Track velocity trends across pitch numbers for each pitch type.</CardDescription>
      </CardHeader>

      {/* Pitch type toggle buttons */}
      <div className="flex flex-wrap gap-2 px-6 pb-2">
        <button
          onClick={() => setActivePitchType("All")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
            activePitchType === "All"
              ? "bg-gray-200 text-gray-900 border-gray-200"
              : "bg-transparent text-gray-400 border-gray-600 hover:border-gray-400 hover:text-gray-200"
          }`}
        >
          All
        </button>
        {pitchTypes.map((type) => {
          const color = chartConfig[type].color
          const isActive = activePitchType === type
          return (
            <button
              key={type}
              onClick={() => setActivePitchType(type)}
              style={
                isActive
                  ? { backgroundColor: color, borderColor: color, color: "#fff" }
                  : { borderColor: color, color: color }
              }
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border bg-transparent hover:opacity-80`}
            >
              {type}
            </button>
          )
        })}
      </div>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="h-[420px] sm:h-[520px] w-full"
        >
          <LineChart
            data={displayData}
            margin={{ top: 30, bottom: 30, left: 24, right: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="pitch_number"
              tickLine={false}
              axisLine={false}
              padding={{ left: 20, right: 20 }}
              allowDecimals={false}
              label={{ value: "Pitch Number", position: "insideBottom", offset: -10 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              label={{ value: "Velocity (mph)", angle: -90, position: "insideLeft" }}
              domain={[yMin, yMax]}
              ticks={yTicks}
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

            {displayTypes.map((type) => (
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
