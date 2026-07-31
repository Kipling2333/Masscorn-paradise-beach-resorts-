import { NextResponse } from "next/server";

const CONDITIONS: Record<number, string> = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Sea mist", 48: "Sea mist", 51: "Light drizzle", 61: "Soft rain",
  63: "Rain showers", 80: "Passing showers", 95: "Tropical storm",
};

export async function GET() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-6.26&longitude=39.47&current_weather=true&hourly=relativehumidity_2m&forecast_days=1&timezone=Africa%2FDar_es_Salaam",
      { next: { revalidate: 900 } }
    );
    const data = await res.json();
    const w = data.current_weather;
    const hour = new Date().getHours();
    const humidity = data.hourly?.relativehumidity_2m?.[hour] ?? 72;
    const code = Number(w.weathercode ?? 1);
    return NextResponse.json({
      temp: w.temperature,
      wind: w.windspeed,
      humidity,
      code,
      condition: CONDITIONS[code] ?? (code > 80 ? "Passing showers" : "Ocean breeze"),
    });
  } catch {
    return NextResponse.json({ temp: 29, wind: 14, humidity: 72, code: 1, condition: "Ocean breeze" });
  }
}
