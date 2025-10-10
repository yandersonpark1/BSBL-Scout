"use client"

import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Fastball {
  No: number
  "Pitch Type": string
  Velocity: number
  PitchIndex?: number
}

interface FastballVelocityResponse {
  filename: string
  fastballs: Fastball[]
  count: number
}

export function FastballVelocityChart({ fileId }: { fileId: string }) {
  const [data, setData] = React.useState<Fastball[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:8000/analysis/fastball_velocity/${fileId}`)
        const json: FastballVelocityResponse = await res.json()

        const formatted: Fastball[] = json.fastballs
          .filter(f => f.Velocity != null && f.No != null)
          .map((f, index) => ({
            No: Number(f.No),
            "Pitch Type": f["Pitch Type"] ?? "Unknown",
            Velocity: Number(f.Velocity),
            PitchIndex: index + 1,
          }))
          .filter(f => !isNaN(f.No) && !isNaN(f.Velocity))

        console.log(formatted)
        setData(formatted)
      } catch (err: any) {
        console.error(err)
        setError("Failed to load fastball data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fileId])

  if (loading) return <p className="text-muted-foreground p-4">Loading fastball data...</p>
  if (error) return <p className="text-red-500 p-4">{error}</p>
  if (!data.length) return <p className="text-muted-foreground p-4">No fastball data available.</p>

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader>
        <CardTitle>Fastball Velocity Chart</CardTitle>
        <CardDescription>See how your velocity carries throughout your outing.</CardDescription>
      </CardHeader>

      {/* Bigger height: h-[420px] on small screens, larger on sm+ */}
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={{ Velocity: { label: "Fastball", color: "var(--chart-1)" } }}
          className="h-[420px] sm:h-[520px] w-full"
        >
          <LineChart
            data={data}
            // increase margins so chart has breathing room
            margin={{ top: 30, bottom: 30, left: 24, right: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            {/* Add horizontal padding so first/last points aren't stuck to the edges */}
            <XAxis
              dataKey="PitchIndex"
              tickLine={false}
              axisLine={false}
              padding={{ left: 20, right: 20 }}
            />

            <YAxis
              dataKey="Velocity"
              tickLine={false}
              axisLine={false}
              label={{ value: "Velocity (mph)", angle: -90, position: "insideLeft" }}
              domain={[70, 100]}
              ticks={[70, 80, 90, 100]}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="Velocity"
                  labelFormatter={() => {
                    return "Fastball"
                  }}
                />
              }
            />

            {/* Blue line + matching dot / activeDot styling */}
            <Line
              type="monotone"
              dataKey="Velocity"
              stroke="#2563eb"         // blue (Tailwind blue-600 hex)
              strokeWidth={3}         // slightly thicker line
              dot={{ r: 4, stroke: "#2563eb", fill: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "#2563eb", fill: "#ffffff", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
