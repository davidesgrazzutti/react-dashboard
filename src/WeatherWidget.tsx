import React, { useEffect, useState } from "react";
import axios from "axios";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

const API_KEY = process.env.REACT_APP_WEATHER_KEY!;


const WeatherWidget: React.FC = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      // Puoi cambiare "Udine" con la tua città
      const city = "Udine";

      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=it`
      );

      setData({
        temp: res.data.main.temp,
        description: res.data.weather[0].description,
        icon: res.data.weather[0].icon,
        city: res.data.name,
      });
    } catch (err: any) {
        const errorMessage =
            err?.response?.data ||
            err?.message ||
            "Errore sconosciuto";
            
        console.error("Errore meteo:", errorMessage);
        }finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) return <p>Caricamento meteo...</p>;
  if (!data) return <p>Errore nel caricare il meteo.</p>;

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>{data.city}</h3>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
          alt="icon"
          style={{ width: 60, height: 60 }}
        />
        <div style={{ marginLeft: 10 }}>
          <div style={{ fontSize: 24 }}>{Math.round(data.temp)}°C</div>
          <div style={{ fontSize: 14, textTransform: "capitalize" }}>
            {data.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
