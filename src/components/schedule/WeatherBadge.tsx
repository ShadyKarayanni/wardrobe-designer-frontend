import { View, StyleSheet } from 'react-native';
import { Text, XStack } from 'tamagui';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Droplets } from '@tamagui/lucide-icons';
import { WeatherForecast } from '@/lib/wardrobe/types';

interface WeatherBadgeProps {
  weather: WeatherForecast;
  compact?: boolean;
}

function getWeatherIcon(icon: string, description: string, size: number = 16) {
  const iconColor = '#666666';
  // Normalize both icon and description for matching
  const iconLower = (icon || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const combined = `${iconLower} ${descLower}`;

  // Rain conditions (including OpenWeatherMap codes 09x, 10x)
  if (combined.includes('rain') || combined.includes('drizzle') ||
      combined.includes('shower') || iconLower.startsWith('09') || iconLower.startsWith('10')) {
    return <CloudRain size={size} color={iconColor} />;
  }
  // Snow conditions (OpenWeatherMap code 13x)
  if (combined.includes('snow') || combined.includes('sleet') || iconLower.startsWith('13')) {
    return <CloudSnow size={size} color={iconColor} />;
  }
  // Thunderstorm (OpenWeatherMap code 11x)
  if (combined.includes('thunder') || combined.includes('storm') || iconLower.startsWith('11')) {
    return <CloudLightning size={size} color={iconColor} />;
  }
  // Cloudy conditions (OpenWeatherMap codes 02x, 03x, 04x)
  if (combined.includes('cloud') || combined.includes('overcast') || combined.includes('fog') ||
      combined.includes('mist') || combined.includes('haze') ||
      iconLower.startsWith('02') || iconLower.startsWith('03') || iconLower.startsWith('04') || iconLower.startsWith('50')) {
    return <Cloud size={size} color={iconColor} />;
  }
  // Clear/sunny (default, OpenWeatherMap code 01x)
  return <Sun size={size} color="#F59E0B" />;
}

export function WeatherBadge({ weather, compact = false }: WeatherBadgeProps) {
  // Handle precipitation as decimal (0-1) or percentage (0-100)
  const rawChance = weather.precipitation_chance ?? 0;
  const precipitationPercent = rawChance <= 1 && rawChance > 0
    ? Math.round(rawChance * 100)
    : Math.round(rawChance);

  if (compact) {
    return (
      <XStack alignItems="center" gap="$1">
        {getWeatherIcon(weather.icon, weather.description, 14)}
        <Text fontSize={12} color="$textSecondary">
          {Math.round(weather.temp_min)}-{Math.round(weather.temp_max)}°
        </Text>
        {precipitationPercent > 0 && (
          <>
            <Droplets size={10} color="#3B82F6" />
            <Text fontSize={10} color="#3B82F6">
              {precipitationPercent}%
            </Text>
          </>
        )}
      </XStack>
    );
  }

  return (
    <View style={styles.container}>
      <XStack alignItems="center" gap="$2">
        {getWeatherIcon(weather.icon, weather.description, 20)}
        <View>
          <Text fontSize={14} fontWeight="600" color="$text">
            {Math.round(weather.temp_min)}° - {Math.round(weather.temp_max)}°C
          </Text>
          <Text fontSize={12} color="$textSecondary" numberOfLines={1}>
            {weather.description}
          </Text>
        </View>
      </XStack>
      {precipitationPercent > 0 && (
        <XStack alignItems="center" gap="$1" marginTop="$1">
          <Droplets size={12} color="#3B82F6" />
          <Text fontSize={11} color="$textSecondary">
            {precipitationPercent}% chance of rain
          </Text>
        </XStack>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
});
