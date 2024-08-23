import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Weather.css';

function Weather({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // OpenWeatherMap API 키를 여기에 입력하세요
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;

      try {
        const response = await axios.get(url);
        setWeather(response.data);
        setLoading(false);
      } catch (error) {
        console.error('날씨 정보 가져오기 실패:', error);
        setError('날씨 정보를 가져오는데 실패했습니다.');
        setLoading(false);
      }
    };

    if (location) {
      fetchWeather();
    }
  }, [location]);

  if (loading) return <div>날씨 정보를 불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  if (!weather) return null;

  return (
    <div className="weather-container">
      <h3>현재 날씨: {data.city}</h3>
      <p>온도: {data.temperature}°C</p>
      <p>날씨: {data.description}</p>
      <img 
        src={`http://openweathermap.org/img/w/${data.icon}.png`} 
        alt={data.description}
        className="weather-icon"
      />
    </div>
  );
}

export default Weather;