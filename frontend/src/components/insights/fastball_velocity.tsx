"use client"

import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Fastball {
  No: number
  "Pitch Type": string
  Velocity: number
  PitchIndex?: number // Add optional PitchIndex for sequential numbering
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
            PitchIndex: index + 1, // sequential numbering
          }))
          .filter(f => !isNaN(f.No) && !isNaN(f.Velocity))

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
        <CardDescription>Velocity (mph) by pitch number</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={{ Velocity: { label: "Fastball", color: "var(--chart-1)" } }} className="h-[300px] w-full">
          <LineChart data={data} margin={{ top: 20, bottom: 20, left: 12, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="PitchIndex"
              tickLine={false}
              axisLine={false}
              label={{ value: "Pitches", position: "insideBottomLeft", offset: -5 }}
            />
            <YAxis
              dataKey="Velocity"
              tickLine={false}
              axisLine={false}
              label={{ value: "Velocity (mph)", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="Pitch Type"
                  labelFormatter={(val) => {
                    const pitch = data.find(d => d.PitchIndex === val)
                    return `Pitch #${pitch?.No ?? "?"}`
                  }}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="Velocity"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
