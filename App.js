import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Share,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Path, G } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import { useFonts, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

// --- Backend Configuration ---
const BIN_ID = '684632fb8960c979a5a6d012'; 
const API_KEY = '$2a$10$29zKNT6hruUMkLUoxNEPR.K49EnNhwz0uXOAwgx6s1RnFavfvl4s.';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// --- Theme and Constants ---
const COLORS = {
  bgMain: '#FDF7FA',
  bgCard: '#FFFFFF',
  textPrimary: '#4E3D52',
  textSecondary: '#8A798D',
  textOnAccent: '#FFFFFF',
  accentPrimary: '#EF9A9A',
  accentPrimaryDarker: '#E57373',
  accentSecondary: '#CE93D8',
  borderColor: '#F3EAF5',
  shadowColor: 'rgba(149, 117, 205, 0.3)',
  gradientQuoteStart: '#FFAB91',
  gradientQuoteEnd: '#E57373',
  // New Notepad Colors
  notepadBg: '#FFF9F9',
  notepadPrimary: '#E57373',
  notepadAccent: '#FFCDD2',
  noteCardColors: [
      ['#E1F5FE', '#B3E5FC'], // Light Blue
      ['#F3E5F5', '#E1BEE7'], // Light Purple
      ['#E8F5E9', '#C8E6C9'], // Light Green
      ['#FFFDE7', '#FFF9C4'], // Light Yellow
      ['#FFEBEE', '#FFCDD2'], // Light Red
  ],
  // UPDATED Music Player Colors & Gradients
  musicPlayerPastelGradients: [
    ['#ffdde1', '#ee9ca7'], // Piggy Pink
    ['#e1eec3', '#f05053'], // Rose-colored glasses
    ['#D3CCE3', '#E9E4F0'], // Lavender
    ['#f8b500', '#fceabb'], // Lemon Twist
    ['#84fab0', '#8fd3f4'], // Light Blue
    ['#a1c4fd', '#c2e9fb'], // Winter Neva
  ],
  musicPlayerAccent: '#E57373', // A theme-consistent accent
};

// New Music Player Avatars
const musicPlayerAvatarNames = [
    'headphones', 'vinyl', 'notes', 'cassette'
];

const MusicAvatar = ({ name, size = 120 }) => {
    switch (name) {
        case 'headphones':
            return (
                <Svg height={size} width={size} viewBox="0 0 100 100">
                    <G stroke={COLORS.textPrimary} strokeWidth="3" fill="none">
                        <Path d="M20 50 C20 27, 80 27, 80 50 V 75 A 10 10 0 0 1 70 85 H 65 A 10 10 0 0 1 55 75 V 60" />
                        <Path d="M80 50 V 75 A 10 10 0 0 0 90 85 H 95 A 10 10 0 0 0 105 75 V 60" transform="scale(-1, 1) translate(-100, 0)" />
                        <Circle cx="35" cy="67.5" r="12" fill="rgba(0,0,0,0.05)" />
                        <Circle cx="65" cy="67.5" r="12" fill="rgba(0,0,0,0.05)" />
                    </G>
                </Svg>
            );
        case 'vinyl':
            return (
                <Svg height={size} width={size} viewBox="0 0 100 100">
                    <G stroke={COLORS.textPrimary} strokeWidth="2" fill="rgba(0,0,0,0.05)">
                        <Circle cx="50" cy="50" r="45" />
                        <Circle cx="50" cy="50" r="15" fill={COLORS.musicPlayerAccent} stroke="none"/>
                        <Circle cx="50" cy="50" r="5" fill="rgba(0,0,0,0.2)" stroke="none"/>
                        <Circle cx="50" cy="50" r="30" strokeDasharray="5, 5" />
                        <Circle cx="50" cy="50" r="35" strokeDasharray="3, 7" />
                    </G>
                </Svg>
            );
        case 'notes':
            return (
                <Svg height={size} width={size} viewBox="0 0 100 100">
                    <G fill={COLORS.textPrimary}>
                        <Path d="M40,65 L40,25 C40,15 50,15 55,25 L55,55 C55,60 50,60 45,55" opacity="0.8"/>
                        <Circle cx="35" cy="65" r="5" />
                        <Circle cx="50" cy="55" r="5" />
                        <Path d="M60,70 L60,30 C60,20 70,20 75,30 L75,60 C75,65 70,65 65,60" opacity="0.6"/>
                        <Circle cx="55" cy="70" r="5" />
                        <Circle cx="70" cy="60" r="5" />
                    </G>
                </Svg>
            );
        case 'cassette':
             return (
                <Svg height={size} width={size} viewBox="0 0 100 100">
                     <G stroke={COLORS.textPrimary} strokeWidth="3" fill="rgba(0,0,0,0.05)">
                        <Path d="M10 25 H 90 V 75 H 10 Z" rx="5"/>
                        <Circle cx="30" cy="50" r="10" />
                        <Circle cx="70" cy="50" r="10" />
                        <Path d="M20 35 H 80" strokeWidth="2"/>
                        <Path d="M20 40 H 40" strokeWidth="2"/>
                        <Path d="M60 40 H 80" strokeWidth="2"/>
                    </G>
                </Svg>
            );
        default:
            return <FontAwesome5 name="music" size={size * 0.8} color={COLORS.textPrimary} style={{opacity: 0.8}}/>;
    }
};

const FONT_FAMILY = {
  playfair: 'PlayfairDisplay_600SemiBold',
  poppins: 'Poppins_400Regular',
  poppinsMedium: 'Poppins_500Medium',
  poppinsBold: 'Poppins_600SemiBold',
};

// --- Daily Quotes Data (Expanded) ---
const dailyQuotes = [
    "With you, I am home.", "You are my favorite daydream.", "Our love story is my favorite.", "You make my heart smile.", "Life is beautiful with you by my side.", "Every moment with you is a treasure.", "You are the poetry my heart writes.", "My love for you grows stronger each day.", "You are my sunshine after the rain.", "To love and be loved is to feel the sun from both sides.", "In your eyes, I found my forever.", "You are the best thing that’s ever been mine.", "I love you more than words can say.", "You are my today and all of my tomorrows.", "My heart is and always will be yours.", "I choose you. And I'll choose you over and over.", "You're the reason I believe in love.", "Every love song is about you.", "You are my greatest adventure.", "I'm much more me when I'm with you.", "Your love is all I need to feel complete.", "I have found the one whom my soul loves.", "You are the beat in my heart, the music in my laughter.", "In a sea of people, my eyes will always search for you.", "You are my sun, my moon, and all my stars.", "I love you not only for what you are but for what I am when I am with you.", "The best thing to hold onto in life is each other.", "You are nothing short of my everything.", "I love you, not for what you are, but for what I am when I am with you.", "For the two of us, home isn't a place. It is a person. And we are finally home.", "I want all of my lasts to be with you.", "When I saw you, I fell in love, and you smiled because you knew.", "You are the answer to every prayer I've offered.", "You have bewitched me, body and soul.", "My love for you is a journey, starting at forever and ending at never.", "If I know what love is, it is because of you.", "You are the source of my joy, the center of my world and the whole of my heart.", "Your arms feel more like home than any house ever did.", "You are my paradise and I would happily get stranded on you for a lifetime.", "I can't stop thinking about you, today... tomorrow... always.", "Thank you for always being my rainbow after the storm.", "I am so in love with you that there isn't anything else.", "I love you because the entire universe conspired to help me find you.", "You are the last thought in my mind before I drift off to sleep and the first thought when I wake up each morning.", "You are the finest, loveliest, tenderest, and most beautiful person I have ever known—and even that is an understatement.", "I love you past the moon and miss you beyond the stars.", "You stole my heart, but I'll let you keep it.", "Your love shines in my heart as the sun that shines on the earth.", "My day is not complete if I don't tell you I love you.", "You are the cream in my coffee and the milk in my tea.", "I'd rather spend one moment holding you than a lifetime knowing I never could.", "Every day I spend with you is the new best day of my life.", "I love you for all that you are, all that you have been and all that you're yet to be.", "I wasn't looking for love, but you found me.", "I love you more than I have ever found a way to say to you.", "I love you more than coffee, but please don't make me prove it.", "You're the peanut butter to my jelly.", "It was love at first sight, at last sight, at ever and ever sight.", "I love you like a fat kid loves cake.", "You're the one for me. I've never been so sure of anything in my life.", "I have waited for this opportunity for a lifetime, to be with you.", "You make me want to be a better man.", "He looked at her the way all women want to be looked at by a man.", "I would rather share one lifetime with you than face all the ages of this world alone.", "You are my heart, my life, my one and only thought.", "I love you. You complete me.", "I will never stop trying. Because when you find the one... you never give up.", "It’s like in that moment the whole universe existed just to bring us together.", "I love you very much, probably more than anybody could love another person.", "The greatest thing you'll ever learn is just to love and be loved in return.", "I've come here with no expectations, only to profess, now that I am at liberty to do so, that my heart is, and always will be, yours.", "You have bewitched me, body and soul, and I love, I love, I love you.", "I could die right now, Clem. I'm just... happy. I've never felt that before. I'm just exactly where I want to be.", "I think I'd miss you even if we'd never met.", "You're the closest to heaven that I'll ever be.", "Whatever our souls are made of, his and mine are the same.", "If you are a bird, I'm a bird.", "I am who I am because of you. You are every reason, every hope, and every dream I've ever had.", "I vow to fiercely love you in all your forms, now and forever. I promise to never forget that this is a once in a lifetime love.", "To me, you are perfect.", "I'm in love with you, and I'm not in the business of denying myself the simple pleasure of saying true things.", "I wish I had done everything on earth with you.", "And I've realized that the Beatles got it wrong. Love isn't all we need—love is all there is.", "If you love me, I'll be in your heart. If you hate me, I'll be in your mind.", "The heart wants what it wants. There's no logic to these things. You meet someone and you fall in love and that's that.", "Love is composed of a single soul inhabiting two bodies.", "Love isn't something you find. Love is something that finds you.", "If I had a flower for every time I thought of you... I could walk through my garden forever.", "A flower cannot blossom without sunshine, and man cannot live without love.", "Love is when you meet someone who tells you something new about your self.", "Love is a friendship set to music.", "The best and most beautiful things in this world cannot be seen or even heard, but must be felt with the heart.", "The giving of love is an education in itself.", "To be your friend was all I ever wanted; to be your lover was all I ever dreamed.", "My heart is perfect because you are inside.", "Love is not about how many days, weeks or months you’ve been together, it’s all about how much you love each other every day.", "If you live to be a hundred, I want to live to be a hundred minus one day so I never have to live without you.", "I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more.", "You know you're in love when you can't fall asleep because reality is finally better than your dreams.", "I swear I couldn't love you more than I do right now, and yet I know I will tomorrow."
];

// --- Helper Functions ---
const formatTime = (millis) => {
  if (!millis || isNaN(millis)) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

function getDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Weather Helper Functions and Data ---
const weatherData = {
    sunny: { icon: 'sun', quotes: ["You shine brighter than the sun.", "Let my love be your shade.", "Warm sun, warmer thoughts of you."] },
    cloudy: { icon: 'cloud-sun', quotes: ["You're the silver lining to my cloudy day.", "Under this sky, all I want is you.", "My love for you peeks through the clouds."] },
    rainy: { icon: 'cloud-rain', quotes: ["Every drop carries my heart to you.", "Let's dance in this rain together.", "In every puddle, I see us."] },
    stormy: { icon: 'bolt', quotes: ["No thunder is louder than my heart for you.", "Let the sky shout—my love is louder.", "This storm reminds me how strong my feelings are."] },
    snowy: { icon: 'snowflake', quotes: ["My love is warmer than any blanket.", "You keep my soul warm in this cold.", "Every snowflake is a memory of us."] },
    foggy: { icon: 'smog', quotes: ["Even in the mist, my love is clear.", "This fog can't hide my feelings for you.", "You're the only clear thing in my world."] },
    default: { icon: 'cloud', quotes: ["No matter the weather, I'm thinking of you."] }
};

const getTemperatureGradient = (temp) => {
    if (temp <= 5) return ['#A1C4FD', '#C2E9FB']; // Icy Blue
    if (temp <= 15) return ['#B0BEC5', '#E0E7FF']; // Cool Lilac/Blue
    if (temp <= 25) return ['#A8E6CF', '#FFD3B6']; // Mild Mint/Peach
    if (temp <= 35) return ['#FFD180', '#FFAB91']; // Warm Orange
    return ['#FF8A65', '#FF7043']; // Hot Coral
};

const getWeatherInfo = (weatherCode) => {
    if (weatherCode >= 200 && weatherCode < 300) return weatherData.stormy;
    if (weatherCode >= 300 && weatherCode < 600) return weatherData.rainy;
    if (weatherCode >= 600 && weatherCode < 700) return weatherData.snowy;
    if (weatherCode >= 700 && weatherCode < 800) return weatherData.foggy;
    if (weatherCode === 800) return weatherData.sunny;
    if (weatherCode > 800) return weatherData.cloudy;
    switch(weatherCode) {
        case 0: case 1: return weatherData.sunny;
        case 2: case 3: return weatherData.cloudy;
        case 45: case 48: return weatherData.foggy;
        case 51: case 53: case 55: case 56: case 57: return weatherData.rainy;
        case 61: case 63: case 65: case 66: case 67: return weatherData.rainy;
        case 71: case 73: case 75: case 77: return weatherData.snowy;
        case 80: case 81: case 82: return weatherData.rainy;
        case 85: case 86: return weatherData.snowy;
        case 95: case 96: case 99: return weatherData.stormy;
        default: return weatherData.default;
    }
};

// --- Reusable Components ---
const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>;
const CardHeader = ({ title, icon, subtitle, onDisconnect }) => (
    <View style={styles.cardHeaderContainer}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>{title}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {onDisconnect && (
                    <TouchableOpacity onPress={onDisconnect} style={{marginRight: 10, padding: 5}}>
                        <FontAwesome5 name="unlink" size={16} color={COLORS.accentPrimaryDarker} />
                    </TouchableOpacity>
                )}
                {icon && <FontAwesome5 name={icon} size={16} color={COLORS.accentPrimary} />}
            </View>
        </View>
        {subtitle && <Text style={styles.cardHeaderSubtitle}>{subtitle}</Text>}
    </View>
);
const AppButton = ({ title, onPress, icon, type = 'primary', style, disabled = false, loading = false }) => {
    const isPrimary = type === 'primary';
    const buttonStyle = [ styles.btn, isPrimary ? styles.btnPrimary : styles.btnSecondary, style, (disabled || loading) && styles.btnDisabled ];
    return (
        <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled || loading}>
            {loading ? <ActivityIndicator color={isPrimary ? COLORS.textOnAccent : COLORS.textPrimary} /> : (
                <>
                    {icon && <FontAwesome name={icon} size={14} color={isPrimary ? COLORS.textOnAccent : COLORS.accentPrimary} style={{ marginRight: 8 }} />}
                    <Text style={[styles.btnText, isPrimary ? styles.btnTextPrimary : styles.btnTextSecondary]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    )
};
const AppTextInput = (props) => ( <TextInput style={styles.textInput} placeholderTextColor="#B0A5B3" {...props} /> );

// --- Screen and Modal Components ---

const LovingWeather = () => {
    const [weather, setWeather] = useState(null);
    const [locationName, setLocationName] = useState('near you');
    const [loading, setLoading] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [quote, setQuote] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const WEATHER_STORAGE_KEY = '@AminaAura:weatherData';
    const LOCATION_STORAGE_KEY = '@AminaAura:locationData';

    const pickRandomQuote = (quotes) => {
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    const updateWeatherState = (weatherData, locationName) => {
        const info = getWeatherInfo(weatherData?.weathercode);
        setWeather(weatherData);
        setLocationName(locationName);
        setQuote(pickRandomQuote(info.quotes));
        if (weatherData.timestamp) {
            setLastUpdated(new Date(weatherData.timestamp));
        }
    };

    const fetchAndSetWeather = async (latitude, longitude) => {
        setLoading(true);
        try {
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherJson = await weatherResponse.json();
            if (weatherJson && weatherJson.current_weather) {
                const updatedTimestamp = new Date();
                const newWeatherData = { ...weatherJson.current_weather, timestamp: updatedTimestamp.getTime() };
                let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
                const newLocationName = geocode && geocode.length > 0 ? `${geocode[0].city || 'your area'}` : 'near you';
                
                updateWeatherState(newWeatherData, newLocationName);
                await AsyncStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(newWeatherData));
                await AsyncStorage.setItem(LOCATION_STORAGE_KEY, newLocationName);
                setLastUpdated(updatedTimestamp);
            }
        } catch (error) {
            console.error("Error fetching new weather data:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadWeather = async (forceRefresh = false) => {
        setLoading(true);
        setPermissionDenied(false);
        try {
            const storedWeatherJSON = await AsyncStorage.getItem(WEATHER_STORAGE_KEY);
            const storedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
            const now = new Date().getTime();
            
            if (!forceRefresh && storedWeatherJSON && storedLocation) {
                const storedWeather = JSON.parse(storedWeatherJSON);
                if (now - storedWeather.timestamp < 3 * 60 * 60 * 1000) { // 3 hours cache
                    updateWeatherState(storedWeather, storedLocation);
                    setLoading(false);
                    return;
                }
            }
            
            let { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                status = (await Location.requestForegroundPermissionsAsync()).status;
            }

            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                await fetchAndSetWeather(location.coords.latitude, location.coords.longitude);
            } else {
                setPermissionDenied(true);
            }
        } catch (error) {
            console.error("Error loading weather data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWeather();
    }, []);

    if (permissionDenied && !weather) {
        return (
            <View style={[styles.weatherCard, {padding: 20, backgroundColor: COLORS.bgCard}]}>
                <Text style={styles.weatherInfoText}>Enable location for a loving forecast.</Text>
                 <AppButton title="Enable Location" icon="map-marker" onPress={() => loadWeather(true)} type="secondary" style={{marginTop: 10, alignSelf: 'center'}}/>
            </View>
        )
    }

    if (!weather) {
         return (
             <View style={[styles.weatherCard, {padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgCard}]}>
                 <ActivityIndicator color={COLORS.accentPrimary} />
             </View>
        );
    }
    
    const weatherInfo = getWeatherInfo(weather.weathercode);
    const tempGradient = getTemperatureGradient(weather.temperature);
    const lastUpdatedString = lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '';

    return (
        <LinearGradient colors={tempGradient} style={styles.weatherCard}>
             <View style={styles.weatherMainContent}>
                <View style={styles.weatherTopRow}>
                    <FontAwesome5 name={weatherInfo.icon} size={20} color={COLORS.textPrimary} style={styles.weatherIcon}/>
                    <Text style={styles.weatherTempText}>{Math.round(weather.temperature)}°C in {locationName}</Text>
                </View>
                <Text style={styles.weatherQuoteText} numberOfLines={2}>{quote}</Text>
             </View>
             <View style={styles.weatherFooter}>
                <TouchableOpacity onPress={() => loadWeather(true)} disabled={loading} style={styles.updateButton}>
                    {loading ? <ActivityIndicator size="small" color={COLORS.textPrimary} /> : <FontAwesome5 name="sync-alt" size={12} color={COLORS.textPrimary} />}
                </TouchableOpacity>
                <Text style={styles.updateTimestamp}>{lastUpdatedString}</Text>
             </View>
        </LinearGradient>
    );
};

const AuraConnectCard = ({
    partnerID,
    distance,
    partnerLastUpdate,
    partnerLocationName,
    isLoading,
    handleUpdateAndGetDistance,
    handleDisconnect,
}) => {
    return (
        <LinearGradient colors={['#F3E5F5', '#E1BEE7']} style={styles.auraConnectCard}>
            <View style={styles.weatherMainContent}>
                 <View style={styles.weatherTopRow}>
                    <FontAwesome5 name="heart" size={18} color={COLORS.textPrimary} style={styles.weatherIcon}/>
                    <Text style={styles.weatherTempText}>Connected with {partnerID}</Text>
                </View>
                 <View style={styles.distanceDisplay}>
                    
                    {distance !== null ? (
                        <>
                            <Text style={styles.distanceValue}>{distance.toFixed(1)} <Text style={styles.distanceUnit}>km</Text></Text>
                            {partnerLocationName && <Text style={styles.distanceLocationText}>{partnerLocationName}</Text>}
                        </>
                    ) : (
                        <Text style={[styles.distanceInfoText, {paddingHorizontal: 10, fontSize: 12, marginBottom: 0}]}>Ask your partner to update their location!</Text>
                    )}
                </View>
            </View>
             <View style={styles.weatherFooter}>
                <TouchableOpacity onPress={() => handleUpdateAndGetDistance()} disabled={isLoading} style={styles.updateButton}>
                    {isLoading ? <ActivityIndicator size="small" color={COLORS.textPrimary} /> : <FontAwesome5 name="sync-alt" size={12} color={COLORS.textPrimary} />}
                </TouchableOpacity>
                <Text style={styles.updateTimestamp}>{partnerLastUpdate ? `Partner updated: ${new Date(partnerLastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'No update yet'}</Text>
                <TouchableOpacity onPress={handleDisconnect} style={styles.updateButton}>
                    <FontAwesome5 name="unlink" size={12} color={COLORS.textPrimary} />
                </TouchableOpacity>
             </View>
        </LinearGradient>
    );
};

const AuraConnectSetupCard = ({myUserID, partnerCodeInput, setPartnerCodeInput, isLoading, handleConnectPartner, handleShareCode}) => (
    <View style={styles.auraConnectCard}>
        <CardHeader title="Aura Connect" icon="connectdevelop" subtitle="Connect with your partner" />
        {myUserID ? (
            <>
                <View style={{alignItems: 'center', paddingHorizontal: 10, marginBottom: 10}}>
                    <Text style={styles.distanceInfoText}>Your Code: <Text style={styles.codeText}>{myUserID}</Text></Text>
                    <TouchableOpacity onPress={handleShareCode}><FontAwesome5 name="share-alt" size={16} color={COLORS.accentPrimaryDarker}/></TouchableOpacity>
                </View>
                <View style={styles.connectInputContainer}>
                     <AppTextInput 
                        placeholder="Enter Partner's Code" 
                        value={partnerCodeInput} 
                        onChangeText={setPartnerCodeInput} 
                        autoCapitalize="characters"
                        style={{flex: 1, marginBottom: 0, marginRight: 10, height: 44}} 
                    />
                    <TouchableOpacity onPress={handleConnectPartner} disabled={isLoading || !partnerCodeInput} style={styles.connectButton}>
                        {isLoading ? <ActivityIndicator color="white" /> : <FontAwesome5 name="link" size={16} color="white" />}
                    </TouchableOpacity>
                </View>
            </>
        ) : <ActivityIndicator color={COLORS.accentPrimary} /> }
    </View>
);

const UsernameSetupModal = ({ isVisible, onSave, isLoading }) => {
    const [username, setUsername] = useState('');
    return (
        <Modal visible={isVisible} transparent={true} animationType="fade">
             <View style={styles.setupModalOverlay}>
                <View style={styles.setupContainer}>
                    <Text style={styles.setupTitle}>Welcome to Aura Connect</Text>
                    <Text style={styles.setupSubtitle}>Create a unique username to connect with your partner.</Text>
                    <AppTextInput
                        placeholder="Enter your username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="characters"
                        maxLength={12}
                    />
                    <AppButton title="Save Username" icon="check" onPress={() => onSave(username)} loading={isLoading} disabled={isLoading || username.length < 3} />
                </View>
             </View>
        </Modal>
    )
}

const QuotesScreen = () => {
  const [currentQuote, setCurrentQuote] = useState('');
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  
  const [myUserID, setMyUserID] = useState(null);
  const [partnerID, setPartnerID] = useState(null);
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [distance, setDistance] = useState(null);
  const [partnerLastUpdate, setPartnerLastUpdate] = useState(null);
  const [partnerLocationName, setPartnerLocationName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupModalVisible, setSetupModalVisible] = useState(false);

  const STORAGE_KEY_FAVORITES = '@AminaAura:favoriteQuotes';
  const STORAGE_KEY_USER = '@AminaAura:auraConnectUser';

  useEffect(() => {
    const today = new Date();
    const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % dailyQuotes.length;
    setCurrentQuote(dailyQuotes[dayIndex]);
    loadFavoriteQuotes();
    initializeApp();
  }, []);

  const initializeApp = async () => {
      setIsLoading(true);
      let userDataJson = await AsyncStorage.getItem(STORAGE_KEY_USER);
      let userData = userDataJson ? JSON.parse(userDataJson) : {};
      if (userData.myUserID) {
        setMyUserID(userData.myUserID);
        if (userData.partnerID) { 
            setPartnerID(userData.partnerID);
            handleUpdateAndGetDistance(true, userData.myUserID, userData.partnerID);
        }
      } else {
        // Don't force modal, user will tap a card to open it
      }
      setIsLoading(false);
  };

  const handleSaveUsername = async (newUsername) => {
    if (!newUsername || newUsername.trim().length < 3) {
      Alert.alert("Invalid Username", "Username must be at least 3 characters long.");
      return;
    }
    const username = newUsername.trim().toUpperCase();
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify({ myUserID: username }));
    setMyUserID(username);
    setSetupModalVisible(false);
  };

  const loadFavoriteQuotes = async () => { try { const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_FAVORITES); if (jsonValue !== null) setFavoriteQuotes(JSON.parse(jsonValue)) } catch (e) { console.error("Failed to load favorite quotes.", e) } };
  const saveFavoriteQuotes = async (newFavorites) => { try { const jsonValue = JSON.stringify(newFavorites); await AsyncStorage.setItem(STORAGE_KEY_FAVORITES, jsonValue); setFavoriteQuotes(newFavorites) } catch (e) { console.error("Failed to save favorite quotes.", e) } };
  const isFavorite = (quote) => favoriteQuotes.includes(quote);
  const handleToggleFavorite = (quote) => { saveFavoriteQuotes(isFavorite(quote) ? favoriteQuotes.filter(q => q !== quote) : [...favoriteQuotes, quote]) };

  const getBinData = async () => {
    const res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY, 'X-Access-Key': API_KEY } });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Could not fetch data. Server responded: ${res.status} ${errorBody}`);
    }
    const data = await res.json();
    return data.record || data;
  };

  const updateBinData = async (newData) => {
    const res = await fetch(BIN_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY, 'X-Bin-Versioning': 'false' },
      body: JSON.stringify(newData),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Could not save data. Server responded: ${res.status} ${errorBody}`);
    }
  };

  const handleConnectPartner = async () => {
    if (!partnerCodeInput || !myUserID) return;
    setIsLoading(true);
    try {
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) throw new Error('No internet connection.');
      const record = await getBinData();
      const partnerCode = partnerCodeInput.trim().toUpperCase();
      
      record.locations = record.locations || {};
      record.pairings = record.pairings || {};

      record.pairings[myUserID] = partnerCode;
      record.pairings[partnerCode] = myUserID;
      
      await updateBinData(record);
      setPartnerID(partnerCode);
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify({ myUserID, partnerID: partnerCode }));
      Alert.alert('Success!', `You are now connected with ${partnerCode}.`);
    } catch (error) { Alert.alert('Connection Failed', error.message) }
    finally { setIsLoading(false); setPartnerCodeInput('') }
  };
  
  const handleUpdateAndGetDistance = async (isInitialLoad = false, currentUserID = myUserID, currentPartnerID = partnerID) => {
    if(!currentPartnerID) return;
    setIsLoading(true);
    try {
      const netInfoState = await NetInfo.fetch();
      if (!netInfoState.isConnected) throw new Error('No internet connection.');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Permission to access location was denied.');
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let locationName = 'Unknown Location';
      if (geocode && geocode.length > 0) {
          const { city, country } = geocode[0];
          locationName = `${city || ''}, ${country || ''}`.replace(/^,|,$/g, '').trim();
      }

      const record = await getBinData();
      
      record.locations = { 
        ...record.locations, 
        [currentUserID]: { latitude, longitude, timestamp: Date.now(), locationName } 
      };
      
      const partnerLocation = record.locations[currentPartnerID];
      if (partnerLocation?.latitude) {
        setDistance(getDistance(latitude, longitude, partnerLocation.latitude, partnerLocation.longitude));
        setPartnerLastUpdate(partnerLocation.timestamp);
        setPartnerLocationName(partnerLocation.locationName || null);
      } else { 
        setDistance(null);
        setPartnerLastUpdate(null);
        setPartnerLocationName(null);
        if(!isInitialLoad) Alert.alert("Waiting for Partner", "Your location is updated. Ask your partner to update their location too!");
      }
      await updateBinData(record);
      if (partnerLocation?.latitude && !isInitialLoad) Alert.alert('Updated!', 'Your location has been shared and distance calculated.');
    } catch (error) { if(!isInitialLoad) Alert.alert('Update Failed', error.message) }
    finally { setIsLoading(false) }
  };
  
  const handleShareCode = async () => {
      if(!myUserID) return;
      try { await Share.share({ message: `Let's connect on Amina's Aura! My code is: ${myUserID}` }) }
      catch (error) { Alert.alert('Error', 'Could not share your code.') }
  };

  const handleDisconnect = async () => {
      Alert.alert(
          "Disconnect Partner",
          "Are you sure you want to disconnect? This will remove your pairing.",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Disconnect", style: "destructive", onPress: async () => {
                  setPartnerID(null);
                  setDistance(null);
                  setPartnerLocationName(null);
                  setPartnerLastUpdate(null);
                  await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify({ myUserID }));
              } }
          ]
      );
  };

  return (
    <View style={{flex: 1}}>
        <UsernameSetupModal 
            isVisible={isSetupModalVisible}
            onSave={handleSaveUsername}
            isLoading={isLoading}
        />
        <ScrollView contentContainerStyle={styles.screenContainer}>
            {showFavorites ? (
                <>
                  <AppButton title={"Show Daily Quote"} onPress={() => setShowFavorites(!showFavorites)} type="secondary" icon={"calendar-day"} style={{marginBottom: 15}} />
                  <CardHeader title="Favorite Quotes" icon="heart" />
                  {favoriteQuotes.map((quote, index) => (
                    <Card key={index} style={styles.favoriteQuoteCard}>
                      <Text style={styles.favoriteQuoteText}>{quote}</Text>
                      <TouchableOpacity onPress={() => handleToggleFavorite(quote)} style={styles.favoriteActionBtn}><FontAwesome name="trash" size={16} color={COLORS.accentPrimaryDarker}/></TouchableOpacity>
                    </Card>
                  ))}
                </>
            ) : (
              <>
                {favoriteQuotes.length > 0 && <AppButton title={"Show Favorites"} onPress={() => setShowFavorites(!showFavorites)} type="secondary" icon={"heart"} style={{marginBottom: 15}} />}
                <LinearGradient 
                    colors={[COLORS.gradientQuoteStart, COLORS.gradientQuoteEnd]}
                    style={styles.dailyQuoteCard}
                >
                    <View style={styles.quoteHeader}>
                        <Text style={styles.quoteHeaderText}>Daily Quote</Text>
                        <TouchableOpacity onPress={() => handleToggleFavorite(currentQuote)} style={styles.quoteFavoriteButton}>
                            <FontAwesome name={isFavorite(currentQuote) ? 'heart' : 'heart-o'} size={24} color={COLORS.textOnAccent} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.quoteSubtitle}>A new quote will appear each day to inspire you.</Text>
                    <View style={styles.quoteBody}>
                        <FontAwesome5 name="quote-left" size={20} color={COLORS.textOnAccent} style={{ opacity: 0.6 }}/>
                        <Text style={styles.quoteText}>{currentQuote}</Text>
                        <FontAwesome5 name="quote-right" size={20} color={COLORS.textOnAccent} style={{ opacity: 0.6, alignSelf: 'flex-end' }}/>
                    </View>
                </LinearGradient>
                <LovingWeather />
                {myUserID ? (
                    partnerID ? (
                        <AuraConnectCard
                            partnerID={partnerID}
                            distance={distance}
                            partnerLastUpdate={partnerLastUpdate}
                            partnerLocationName={partnerLocationName}
                            isLoading={isLoading}
                            handleUpdateAndGetDistance={() => handleUpdateAndGetDistance()}
                            handleDisconnect={handleDisconnect}
                        />
                    ) : (
                        <AuraConnectSetupCard 
                            myUserID={myUserID}
                            partnerCodeInput={partnerCodeInput}
                            setPartnerCodeInput={setPartnerCodeInput}
                            isLoading={isLoading}
                            handleConnectPartner={handleConnectPartner}
                            handleShareCode={handleShareCode}
                        />
                    )
                ) : (
                    <TouchableOpacity onPress={() => setSetupModalVisible(true)}>
                         <View style={styles.auraConnectPromptCard}>
                           <FontAwesome5 name="connectdevelop" size={22} color={COLORS.accentPrimaryDarker} />
                           <Text style={styles.auraConnectPromptText}>Setup Aura Connect</Text>
                        </View>
                    </TouchableOpacity>
                )}
              </>
            )}
        </ScrollView>
    </View>
  );
};

const NotepadScreen = () => {
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All'); // 'All' or 'Favorites'
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingNote, setEditingNote] = useState(null); // null for new, note object for editing
    const [modalColorPair, setModalColorPair] = useState(COLORS.noteCardColors[0]);

    const STORAGE_KEY = '@AminaAura:notes';

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            if (jsonValue !== null) {
                const loadedNotes = JSON.parse(jsonValue);
                // Initial sort by date when loading
                const sorted = loadedNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
                setNotes(sorted);
            }
        } catch (e) {
            console.error("Failed to load notes.", e);
        }
    };

    const saveNotes = async (newNotes) => {
        try {
            const jsonValue = JSON.stringify(newNotes);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
            setNotes(newNotes);
        } catch (e) {
            console.error("Failed to save notes.", e);
        }
    };

    const handleSaveNote = (noteToSave) => {
        // Do not save if both title and content are empty
        if (!noteToSave.title.trim() && !noteToSave.content.trim()) {
            setModalVisible(false);
            setEditingNote(null);
            return;
        };

        let newNotes;
        if (editingNote && editingNote.id) {
            // --- Editing an existing note ---
            const noteIndex = notes.findIndex(n => n.id === editingNote.id);
            if (noteIndex > -1) {
                // Update the note in its current position
                const updatedNote = { ...notes[noteIndex], ...noteToSave, date: new Date().toISOString() };
                newNotes = [...notes];
                newNotes[noteIndex] = updatedNote;
                // BUG FIX: Do NOT sort the array on edit. Let the note stay in place.
                // This prevents the "wrong note locked" issue.
            } else {
                // Should not happen, but as a fallback, do nothing to the array
                newNotes = [...notes]; 
            }
        } else {
            // --- Creating a new note ---
            const newNote = {
                id: Date.now().toString(),
                ...noteToSave,
                date: new Date().toISOString(),
            };
            // Add the new note to the beginning of the array
            newNotes = [newNote, ...notes];
        }

        saveNotes(newNotes);
        setModalVisible(false);
        setEditingNote(null);
    };

    const handleDeleteNote = (id) => {
        const newNotes = notes.filter(note => note.id !== id);
        saveNotes(newNotes);
    };

    const handleOpenModalForEdit = (note, colorPair) => {
        setEditingNote(note);
        setModalColorPair(colorPair);
        setModalVisible(true);
    };

    const handleOpenModalForNew = () => {
        // Explicitly set editingNote to null to signify a new note
        setEditingNote(null); 
        // Choose a color for the new note
        setModalColorPair(COLORS.noteCardColors[notes.length % COLORS.noteCardColors.length]);
        setModalVisible(true);
    };
    
    const handleCloseModal = () => {
        setModalVisible(false);
        // Ensure editing state is cleared when modal is closed without saving
        setEditingNote(null);
    };

    const notesToDisplay = useMemo(() => {
        let filteredNotes = notes;

        if (activeFilter === 'Favorites') {
            filteredNotes = filteredNotes.filter(note => note.isFavorite);
        }

        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(searchLower) || 
                note.content.toLowerCase().includes(searchLower)
            );
        }
        
        // The main list is now sorted once on load and new notes are prepended.
        // We can apply a sort here if we want displayed notes to be sorted differently
        // but for now, we will respect the manual order.
        return filteredNotes;

    }, [notes, searchQuery, activeFilter]);
    
    return (
        <View style={styles.notepadContainer}>
            {/* Header: Search and Filters */}
            <View style={styles.notepadHeader}>
                <View style={styles.notepadSearchContainer}>
                    <FontAwesome5 name="search" size={16} color={COLORS.textSecondary} style={{marginRight: 10}} />
                    <TextInput
                        placeholder="Search notes..."
                        placeholderTextColor={COLORS.textSecondary}
                        style={styles.notepadSearchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <View style={styles.notepadFilterContainer}>
                    <TouchableOpacity onPress={() => setActiveFilter('All')}>
                        <View style={[styles.notepadFilterButton, activeFilter === 'All' && styles.notepadFilterActive]}>
                            <Text style={[styles.notepadFilterText, activeFilter === 'All' && styles.notepadFilterTextActive]}>All</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveFilter('Favorites')}>
                        <View style={[styles.notepadFilterButton, activeFilter === 'Favorites' && styles.notepadFilterActive]}>
                             <Text style={[styles.notepadFilterText, activeFilter === 'Favorites' && styles.notepadFilterTextActive]}>Favorites</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Notes List */}
            {notesToDisplay.length > 0 ? (
                <FlatList
                    data={notesToDisplay}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 10, paddingBottom: 100 }}
                    renderItem={({ item, index }) => {
                        // Find the original index to maintain consistent color mapping
                        const originalIndex = notes.findIndex(n => n.id === item.id);
                        const colorPair = COLORS.noteCardColors[originalIndex % COLORS.noteCardColors.length];
                        return (
                            <NoteCard 
                                note={item} 
                                onPress={() => handleOpenModalForEdit(item, colorPair)}
                                colorPair={colorPair}
                            />
                        )
                    }}
                />
            ) : (
                <View style={styles.notepadEmptyContainer}>
                    <FontAwesome5 name="file-alt" size={48} color={COLORS.accentSecondary} />
                    <Text style={styles.notepadEmptyText}>{searchQuery || activeFilter === 'Favorites' ? 'No matching notes found.' : 'Create your first note!'}</Text>
                </View>
            )}

            {/* FAB */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={[styles.fab, styles.fabMain]} onPress={handleOpenModalForNew}>
                    <FontAwesome5 name={"plus"} size={24} color={COLORS.textOnAccent} />
                </TouchableOpacity>
            </View>
            
            {/* Edit/Create Modal */}
            <EditNoteModal
                // The key ensures the component fully re-mounts when switching between notes
                key={editingNote ? editingNote.id : 'new-note-modal'}
                isVisible={isModalVisible}
                note={editingNote}
                colorPair={modalColorPair}
                onSave={handleSaveNote}
                onClose={handleCloseModal}
                onDelete={handleDeleteNote}
            />
        </View>
    );
};

const NoteCard = ({ note, onPress, colorPair }) => {
    const formatDate = (dateString) => {
         const date = new Date(dateString);
         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    return (
        <TouchableOpacity onPress={onPress} style={styles.noteCardWrapper}>
            <LinearGradient colors={colorPair} style={styles.noteCard}>
                {note.isLocked ? (
                    <View style={styles.noteCardLockedView}>
                         <FontAwesome5 name="lock" size={32} color={COLORS.textPrimary} style={{opacity: 0.5}}/>
                    </View>
                ) : (
                    <Text style={styles.noteCardContent} numberOfLines={6}>{note.content}</Text>
                )}

                <View style={styles.noteCardFooter}>
                    <Text style={styles.noteCardTitle} numberOfLines={1}>{note.title || 'Untitled'}</Text>
                    <Text style={styles.noteCardDate}>{formatDate(note.date)}</Text>
                </View>

                {note.isFavorite && (
                    <View style={styles.noteCardFavoriteIcon}>
                        <FontAwesome name="star" size={12} color={COLORS.accentPrimaryDarker}/>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const EditNoteModal = ({ isVisible, note, onSave, onClose, onDelete, colorPair }) => {
    // State is initialized based on the 'note' prop.
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);
    const [isLocked, setIsLocked] = useState(note?.isLocked || false);
    const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

    // BUG FIX: This useEffect hook robustly resets the modal's state whenever the `note` prop changes.
    // This is more reliable than relying only on component remounting via key.
    // It guarantees that opening a new note (where `note` is null) clears the fields.
    useEffect(() => {
        setTitle(note?.title || '');
        setContent(note?.content || '');
        setIsFavorite(note?.isFavorite || false);
        setIsLocked(note?.isLocked || false);
    }, [note]);


    const handleSave = () => {
        onSave({ title, content, isFavorite, isLocked });
    };

    const handleDeletePress = () => {
        if (note && note.id) {
            setDeleteConfirmVisible(true);
        }
    };
    
    const confirmDelete = () => {
        if(note && note.id) {
            onDelete(note.id);
            setDeleteConfirmVisible(false);
            onClose(); // Close the main editor modal after deletion
        }
    }
    
    const gradientColors = colorPair || COLORS.noteCardColors[0];

    return(
        <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
            <LinearGradient colors={gradientColors} style={{flex: 1}}>
            <SafeAreaView style={styles.notepadEditorContainer}>
                <View style={styles.notepadEditorHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.notepadEditorButton}>
                        <Text style={styles.notepadEditorButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.notepadEditorTitle}>{note ? 'Edit Note' : 'Create Note'}</Text>
                    <TouchableOpacity onPress={handleSave} style={styles.notepadEditorButton}>
                        <Text style={[styles.notepadEditorButtonText, {fontWeight: 'bold'}]}>Save</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.notepadEditorContent}>
                    <TextInput
                        placeholder="Title"
                        placeholderTextColor={COLORS.textPrimary}
                        style={styles.notepadEditorInputTitle}
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        placeholder="Your thoughts here..."
                        placeholderTextColor={COLORS.textPrimary}
                        style={styles.notepadEditorInputContent}
                        value={content}
                        onChangeText={setContent}
                        multiline
                    />
                </ScrollView>
                <View style={styles.notepadEditorToolbar}>
                    <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.notepadEditorToolbarButton}>
                        <FontAwesome name={isFavorite ? "star" : "star-o"} size={22} color={isFavorite ? COLORS.accentPrimaryDarker : COLORS.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsLocked(!isLocked)} style={styles.notepadEditorToolbarButton}>
                        <FontAwesome5 name={isLocked ? "lock" : "unlock-alt"} size={20} color={isLocked ? COLORS.accentPrimaryDarker : COLORS.textPrimary} />
                    </TouchableOpacity>
                    {note && (
                       <TouchableOpacity onPress={handleDeletePress} style={styles.notepadEditorToolbarButton}>
                          <FontAwesome5 name="trash-alt" size={20} color={COLORS.textPrimary} />
                       </TouchableOpacity>
                    )}
                </View>

                <DeleteConfirmModal 
                    isVisible={isDeleteConfirmVisible}
                    onClose={() => setDeleteConfirmVisible(false)}
                    onConfirm={confirmDelete}
                />
            </SafeAreaView>
            </LinearGradient>
        </Modal>
    );
};

const DeleteConfirmModal = ({ isVisible, onClose, onConfirm }) => {
    return(
        <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.deleteModalOverlay}>
                <View style={styles.deleteModalContainer}>
                    <Text style={styles.deleteModalTitle}>Delete Note</Text>
                    <Text style={styles.deleteModalMessage}>Are you sure you want to permanently delete this note?</Text>
                    <View style={styles.deleteModalActions}>
                        <TouchableOpacity style={[styles.deleteModalButton, styles.deleteModalCancelButton]} onPress={onClose}>
                            <Text style={styles.deleteModalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.deleteModalButton, styles.deleteModalConfirmButton]} onPress={onConfirm}>
                            <Text style={[styles.deleteModalButtonText, {color: 'white'}]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const MusicScreen = React.memo(({ musicAppState, handlers }) => {
    const { displayedSongs, sort, showFavoritesOnly, currentTrack, isLoading, permissionGranted, currentAvatar } = musicAppState;
    const { onSearch, onSort, onToggleFavorites, onSetTrack, onToggleFavoriteSong, onRefresh } = handlers;
    
    const getSortButtonText = (type) => {
        if (type === 'alpha') {
            if (sort.type !== 'alpha') return 'A-Z';
            if (sort.order === 'asc') return 'A-Z';
            return 'Z-A';
        }
        if (type === 'date') {
            if (sort.type !== 'date') return 'Newest';
            if (sort.order === 'desc') return 'Newest';
            return 'Oldest';
        }
    };

    return (
        <View style={styles.musicScreenContainer}>
            <AppTextInput
                placeholder="Search for a song..."
                onChangeText={onSearch}
                style={styles.musicSearchInput}
                placeholderTextColor={'#A99DAA'}
            />
            <View style={styles.musicControlsContainer}>
                <View style={styles.sortContainer}>
                    <TouchableOpacity onPress={() => onSort('alpha')} style={[styles.sortButton, sort.type === 'alpha' && styles.sortButtonActive]}><Text style={[styles.sortButtonText, sort.type === 'alpha' && styles.sortButtonTextActive]}>{getSortButtonText('alpha')}</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => onSort('date')} style={[styles.sortButton, sort.type === 'date' && styles.sortButtonActive]}><Text style={[styles.sortButtonText, sort.type === 'date' && styles.sortButtonTextActive]}>{getSortButtonText('date')}</Text></TouchableOpacity>
                    {sort.type !== 'default' && (<TouchableOpacity onPress={() => onSort('clear')} style={[styles.sortButton]}><Text style={styles.sortButtonText}>Clear</Text></TouchableOpacity>)}
                </View>
                <TouchableOpacity onPress={onToggleFavorites} style={styles.favoriteToggle}>
                    <FontAwesome name={showFavoritesOnly ? "heart" : "heart-o"} size={20} color={showFavoritesOnly ? COLORS.musicPlayerAccent : '#A99DAA'} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.musicPlayerAccent} style={{flex: 1}}/>
            ) : (
                <FlatList
                  data={displayedSongs}
                  keyExtractor={item => item.id}
                  contentContainerStyle={{paddingBottom: 80}}
                  renderItem={({ item, index }) => {
                      const isCurrentlyPlaying = item.id === currentTrack?.id;
                      const itemAvatar = musicPlayerAvatarNames[index % musicPlayerAvatarNames.length];
                      return (
                          <TouchableOpacity style={styles.songItem} onPress={() => onSetTrack(item, itemAvatar)}>
                               <View style={[styles.songItemArt, isCurrentlyPlaying && {backgroundColor: 'rgba(0,0,0,0.05)'}]}>
                                   <MusicAvatar name={isCurrentlyPlaying ? currentAvatar : itemAvatar} size={24} />
                               </View>
                               <View style={{flex: 1}}>
                                  <Text style={[styles.songItemText, isCurrentlyPlaying && {color: COLORS.musicPlayerAccent}]} numberOfLines={1}>{item.filename}</Text>
                                  <Text style={styles.songItemSubText}>Tap to play</Text>
                               </View>
                               <TouchableOpacity onPress={(e) => { e.stopPropagation(); onToggleFavoriteSong(item.id); }}>
                                  <FontAwesome name={item.isFavorite ? "heart" : "heart-o"} size={20} color={item.isFavorite ? COLORS.musicPlayerAccent : COLORS.textSecondary} />
                               </TouchableOpacity>
                          </TouchableOpacity>
                      )
                    }}
                  ListEmptyComponent={ 
                    <View style={styles.emptyListContainer}>
                        <FontAwesome5 name="compact-disc" size={48} color={COLORS.textSecondary} />
                        <Text style={styles.infoText}>No songs found.</Text>
                        <Text style={styles.infoSubText}>Try changing your filter or refreshing your library.</Text>
                        <AppButton title="Refresh Music Library" icon="refresh" onPress={onRefresh} style={{marginTop: 20}} disabled={!permissionGranted || isLoading} loading={isLoading} />
                    </View> 
                  }
                />
            )}
        </View>
    );
});


const GalleryScreen = () => {
    const [images, setImages] = useState([]);
    const [imageToAdd, setImageToAdd] = useState(null);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const STORAGE_KEY = '@AminaAura:images';

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue) setImages(JSON.parse(jsonValue));
    };

    const saveImages = async (newImages) => {
        const sorted = newImages.sort((a,b) => new Date(b.date) - new Date(a.date));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
        setImages(sorted);
    };

    const pickImage = async () => {
        let r = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.7
        });
        if (!r.canceled) {
            setImageToAdd({ uri: r.assets[0].uri });
            setAddModalVisible(true);
        }
    };

    const handleSaveImage = (title) => {
        const newImage = {
            id: Date.now().toString(),
            uri: imageToAdd.uri,
            title: title.trim(),
            date: new Date().toISOString(),
        };
        saveImages([newImage, ...images]);
        setImageToAdd(null);
        setAddModalVisible(false);
    };

    const deleteImage = (idToDelete) => {
        Alert.alert(
            "Delete Photo",
            "Are you sure you want to delete this photo?",
            [{
                text: "Cancel",
                style: "cancel"
            }, {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    saveImages(images.filter(img => img.id !== idToDelete));
                    setViewerVisible(false); // Close viewer if open
                }
            }]
        );
    };

    const openViewer = (index) => {
        setSelectedIndex(index);
        setViewerVisible(true);
    };
    
    const memoizedImages = useMemo(() => {
        const leftCol = images.filter((_, i) => i % 2 === 0);
        const rightCol = images.filter((_, i) => i % 2 !== 0);
        return { leftCol, rightCol };
    }, [images]);

    return (
        <View style={styles.galleryContainer}>
            <ScrollView contentContainerStyle={styles.galleryScrollContainer}>
                {images.length === 0 ? (
                     <View style={styles.notepadEmptyContainer}>
                        <FontAwesome5 name="images" size={48} color={COLORS.accentSecondary} />
                        <Text style={styles.notepadEmptyText}>Add your first memory!</Text>
                    </View>
                ) : (
                    <View style={styles.galleryGrid}>
                        <View style={styles.galleryColumn}>
                            {memoizedImages.leftCol.map((item, index) => (
                                <GalleryCard key={item.id} image={item} onPress={() => openViewer(images.indexOf(item))} />
                            ))}
                        </View>
                        <View style={styles.galleryColumn}>
                            {memoizedImages.rightCol.map((item, index) => (
                                <GalleryCard key={item.id} image={item} onPress={() => openViewer(images.indexOf(item))} />
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.fabContainer}>
                <TouchableOpacity style={[styles.fab, styles.fabMain]} onPress={pickImage}>
                    <FontAwesome5 name="plus" size={24} color={COLORS.textOnAccent} />
                </TouchableOpacity>
            </View>

            <AddPhotoModal 
                isVisible={isAddModalVisible} 
                imageUri={imageToAdd?.uri} 
                onClose={() => setAddModalVisible(false)} 
                onSave={handleSaveImage} 
            />

            <Modal visible={viewerVisible} transparent={true} animationType="fade" onRequestClose={() => setViewerVisible(false)}>
                <View style={styles.viewerContainer}>
                    <TouchableOpacity style={styles.viewerCloseButton} onPress={() => setViewerVisible(false)}>
                        <FontAwesome name="close" size={30} color="white" />
                    </TouchableOpacity>
                    
                    {images[selectedIndex] ? (
                        <>
                            <Image
                                source={{ uri: images[selectedIndex]?.uri }}
                                style={styles.viewerImage}
                                resizeMode="contain"
                            />
                            {selectedIndex > 0 && (
                                <TouchableOpacity style={[styles.viewerNav, styles.viewerNavLeft]} onPress={() => setSelectedIndex(selectedIndex - 1)}>
                                    <FontAwesome5 name="chevron-left" size={30} color="white" />
                                </TouchableOpacity>
                            )}
                            {selectedIndex < images.length - 1 && (
                                <TouchableOpacity style={[styles.viewerNav, styles.viewerNavRight]} onPress={() => setSelectedIndex(selectedIndex + 1)}>
                                    <FontAwesome5 name="chevron-right" size={30} color="white" />
                                </TouchableOpacity>
                            )}
                             <TouchableOpacity style={styles.viewerDeleteButton} onPress={() => deleteImage(images[selectedIndex].id)}>
                                <FontAwesome5 name="trash-alt" size={22} color="white" />
                            </TouchableOpacity>
                        </>
                    ) : null}
                </View>
            </Modal>
        </View>
    );
};

const GalleryCard = ({ image, onPress }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    return (
        <TouchableOpacity onPress={onPress} style={styles.galleryCard}>
            <ImageBackground source={{ uri: image.uri }} style={styles.galleryCardImage} imageStyle={{borderRadius: 18}}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.galleryCardOverlay}
                >
                    <Text style={styles.galleryCardDate}>{formatDate(image.date)}</Text>
                    <Text style={styles.galleryCardTitle} numberOfLines={2}>{image.title || "Untitled Memory"}</Text>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const AddPhotoModal = ({ isVisible, imageUri, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const handleSave = () => { onSave(title); setTitle('') };
    return(
        <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={styles.optionsMenuOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={styles.addPhotoContainer}>
                        <CardHeader title="Add a Title" icon="pen-fancy"/>
                        <Image source={{uri: imageUri}} style={styles.galleryImagePreview} resizeMode="contain" />
                        <AppTextInput placeholder="Title (optional)" value={title} onChangeText={setTitle} />
                        <View style={{flexDirection: 'row', marginTop: 10}}>
                            <AppButton title="Save Photo" icon="save" onPress={handleSave} style={{flex: 1, marginRight: 5}}/>
                            <AppButton title="Cancel" type="secondary" onPress={onClose} style={{flex: 1, marginLeft: 5}}/>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const PlayerModal = React.memo(({ isVisible, onClose, musicState, handlers }) => {
    const { currentTrack, playbackStatus, isPlaying, isShuffleOn, repeatMode, sleepTimerId, currentGradient, currentAvatar } = musicState;
    const { handlePlayPause, handleNext, handlePrevious, handleSeek, handleToggleRepeat, handleToggleShuffle, handleSetTimer } = handlers;
    
    if (!currentTrack) return null;

    return (
        <Modal visible={isVisible} onRequestClose={onClose} animationType="slide">
            <LinearGradient colors={currentGradient} style={styles.playerModalContainer}>
            <SafeAreaView style={{flex: 1}}>
                <View style={styles.playerModalHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.playerModalCloseButton}>
                        <FontAwesome5 name="chevron-down" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.playerModalHeaderText}>Now Playing</Text>
                    <TouchableOpacity onPress={handleSetTimer} style={styles.playerModalHeaderButton}>
                         <FontAwesome5 name="clock" size={22} color={sleepTimerId ? COLORS.musicPlayerAccent : COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.playerModalContent}>
                    <View style={styles.playerModalArtContainer}>
                        <MusicAvatar name={currentAvatar} size={140} />
                    </View>
                    
                    <View style={styles.playerModalTrackInfo}>
                        <Text style={styles.playerModalTrackTitle} numberOfLines={1}>{currentTrack.filename}</Text>
                        <Text style={styles.playerModalTrackArtist}>Artist Not Available</Text>
                    </View>
                    
                    <View style={styles.playerModalSliderContainer}>
                        <Slider 
                            style={{width: '100%', height: 40}} 
                            minimumValue={0} 
                            maximumValue={playbackStatus?.durationMillis || 1} 
                            value={playbackStatus?.positionMillis || 0} 
                            onSlidingComplete={handleSeek} 
                            minimumTrackTintColor={COLORS.musicPlayerAccent} 
                            maximumTrackTintColor={'rgba(0, 0, 0, 0.1)'}
                            thumbTintColor={COLORS.textPrimary}
                        />
                        <View style={styles.playerModalTimeContainer}>
                            <Text style={styles.playerModalTimeText}>{formatTime(playbackStatus?.positionMillis)}</Text>
                            <Text style={styles.playerModalTimeText}>{formatTime(playbackStatus?.durationMillis)}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.mainControlsContainer}>
                        <TouchableOpacity onPress={handlePrevious} style={styles.modalControlButton}>
                            <FontAwesome5 name="step-backward" size={30} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePlayPause} style={[styles.modalControlButton, styles.modalPlayButton]}>
                            <FontAwesome5 name={isPlaying ? "pause" : "play"} size={32} color={COLORS.textOnAccent} style={{ marginLeft: isPlaying ? 0 : 4 }}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNext} style={styles.modalControlButton}>
                            <FontAwesome5 name="step-forward" size={30} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>

                     <View style={styles.secondaryControlsContainer}>
                         <TouchableOpacity onPress={handleToggleShuffle} style={styles.modalControlButton}>
                            <FontAwesome5 name="random" size={20} color={isShuffleOn ? COLORS.musicPlayerAccent : COLORS.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleToggleRepeat} style={styles.modalControlButton}>
                            {repeatMode === 'one' 
                                ? <MaterialIcons name="repeat-one" size={28} color={COLORS.musicPlayerAccent} /> 
                                : <MaterialIcons name="repeat" size={28} color={repeatMode === 'all' ? COLORS.musicPlayerAccent : COLORS.textPrimary} />
                            }
                        </TouchableOpacity>
                     </View>
                </View>
            </SafeAreaView>
            </LinearGradient>
        </Modal>
    );
});

const TimerInputModal = ({ isVisible, onClose, onSetTimer }) => {
    const [minutes, setMinutes] = useState('');
    const handleSet = () => { onSetTimer(minutes); setMinutes('') };
    return (
        <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.optionsMenuOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={styles.timerInputContainer}>
                        <Text style={styles.timerInputTitle}>Set Sleep Timer</Text>
                        <AppTextInput placeholder="Enter minutes..." value={minutes} onChangeText={setMinutes} keyboardType="number-pad" />
                        <View style={{flexDirection: 'row', width: '100%'}}>
                            <AppButton title="Cancel" type="secondary" onPress={onClose} style={{flex: 1, marginRight: 5}} />
                            <AppButton title="Set" onPress={handleSet} style={{flex: 1, marginLeft: 5}} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

// --- Main App Component ---
export default function App() {
  const [fontsLoaded, fontError] = useFonts({ PlayfairDisplay_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });
  const [activeTab, setActiveTab] = useState('Quotes');
  const [isPlayerModalVisible, setPlayerModalVisible] = useState(false);
  const [isTimerInputVisible, setTimerInputVisible] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  
  const soundObject = useRef(new Audio.Sound());
  const [musicAppState, setMusicAppState] = useState({
      playlist: [], 
      currentTrack: null, 
      sleepTimerId: null, 
      isShuffleOn: false, 
      repeatMode: 'off', 
      searchQuery: '', 
      sort: { type: 'default', order: 'asc' }, 
      showFavoritesOnly: false,
      currentGradient: COLORS.musicPlayerPastelGradients[0],
      currentAvatar: musicPlayerAvatarNames[0],
  });

  const { currentTrack, playlist, sleepTimerId, isShuffleOn, repeatMode, sort, showFavoritesOnly, searchQuery, currentGradient, currentAvatar } = musicAppState;
  const isPlaying = playbackStatus?.isLoaded && playbackStatus.isPlaying;
  const STORAGE_KEY = '@AminaAura:playlist';

  const displayedSongs = useMemo(() => {
    let songs = [...playlist];
    if (showFavoritesOnly) songs = songs.filter(s => s.isFavorite);
    if (searchQuery) songs = songs.filter(s => s.filename.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sort.type === 'alpha') { songs.sort((a, b) => a.filename.localeCompare(b.filename)); if (sort.order === 'desc') songs.reverse() }
    else if (sort.type === 'date') { songs.sort((a, b) => (b.creationTime || 0) - (a.creationTime || 0)); if (sort.order === 'asc') songs.reverse() }
    return songs;
  }, [playlist, searchQuery, sort, showFavoritesOnly]);

  const handleNext = useCallback((didJustFinish = false) => {
      if (!currentTrack || displayedSongs.length === 0) return;
      let nextIndex;
      const currentIndex = displayedSongs.findIndex(t => t.id === currentTrack.id);

      if (isShuffleOn) {
          if (displayedSongs.length > 1) {
              do {
                  nextIndex = Math.floor(Math.random() * displayedSongs.length);
              } while (nextIndex === currentIndex)
          } else {
              nextIndex = 0;
          }
      } else {
          const isLastSong = currentIndex === displayedSongs.length - 1;
          if (isLastSong && repeatMode !== 'all' && didJustFinish) {
              soundObject.current.stopAsync();
              setPlaybackStatus(prev => ({ ...prev, isPlaying: false }));
              return;
          }
          nextIndex = (currentIndex + 1) % displayedSongs.length;
      }
      handleSelectTrack(displayedSongs[nextIndex]);
  }, [currentTrack, displayedSongs, isShuffleOn, repeatMode, soundObject]);

  const handlePlaybackStatusUpdate = useCallback((status) => {
    setPlaybackStatus(status);
    if (status.didJustFinish) {
        if (repeatMode === 'one') {
            soundObject.current.setPositionAsync(0).then(() => soundObject.current.playAsync());
        } else {
            handleNext(true);
        }
    }
  }, [repeatMode, handleNext, soundObject]);
  
  const handleSelectTrack = (track, avatar) => {
      if (!track) return;

      const trackIndex = playlist.findIndex(t => t.id === track.id);
      const newGradient = COLORS.musicPlayerPastelGradients[trackIndex % COLORS.musicPlayerPastelGradients.length];
      const newAvatar = avatar || musicPlayerAvatarNames[trackIndex % musicPlayerAvatarNames.length];

      setMusicAppState(prev => ({ 
          ...prev, 
          currentTrack: track, 
          currentGradient: newGradient, 
          currentAvatar: newAvatar 
      }));

      setTimeout(async () => {
          try {
              const status = await soundObject.current.getStatusAsync();
              if (status.isLoaded) {
                  await soundObject.current.unloadAsync();
              }
              await soundObject.current.loadAsync({ uri: track.uri }, { shouldPlay: true });
          } catch (e) {
              console.error("Failed to play track", e);
              Alert.alert("Playback Error", "Could not play the selected track.");
              setMusicAppState(prev => ({...prev, currentTrack: null}));
          }
      }, 50);
  };

  useEffect(() => {
    Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, staysActiveInBackground: true, shouldDuckAndroid: true, playThroughEarpieceAndroid: false });
    soundObject.current.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
    
    (async () => { const { status } = await MediaLibrary.requestPermissionsAsync(); if (status !== 'granted') Alert.alert("Permission Required", "This app needs permission to access your audio files."); setPermissionGranted(status === 'granted') })();
    
    const loadPlaylist = async () => { const jsonValue = await AsyncStorage.getItem(STORAGE_KEY); if (jsonValue) setMusicAppState(prev => ({...prev, playlist: JSON.parse(jsonValue)})) };
    loadPlaylist();
    
    return () => { 
        soundObject.current.unloadAsync(); 
        if(musicAppState.sleepTimerId) clearTimeout(musicAppState.sleepTimerId);
    }
  }, []);

  const handlePlayPause = async () => { 
      const status = await playbackStatus; 
      if (!status?.isLoaded) { 
          if (playlist.length > 0) handleSelectTrack(playlist[0]); 
          return;
      } 
      if (status.isPlaying) await soundObject.current.pauseAsync(); 
      else await soundObject.current.playAsync() 
  };
  
  const handlePrevious = () => { 
      if (!currentTrack || displayedSongs.length <= 1) return; 
      const currentIndex = displayedSongs.findIndex(t => t.id === currentTrack.id); 
      const prevIndex = (currentIndex - 1 + displayedSongs.length) % displayedSongs.length; 
      handleSelectTrack(displayedSongs[prevIndex]);
  };
  
  const handleSeek = async (value) => { if (playbackStatus?.isLoaded) await soundObject.current.setPositionAsync(value) };
  const handleToggleRepeat = () => { const modes = ['off', 'all', 'one']; setMusicAppState(prev => ({...prev, repeatMode: modes[(modes.indexOf(prev.repeatMode) + 1) % modes.length]})) };
  const handleToggleShuffle = () => setMusicAppState(prev => ({...prev, isShuffleOn: !prev.isShuffleOn}));
  const handleSetTimer = () => { if (sleepTimerId) { clearTimeout(sleepTimerId); setMusicAppState(prev => ({...prev, sleepTimerId: null})); Alert.alert("Timer Canceled") } else { setTimerInputVisible(true) } };
  const handleConfirmTimer = (minutes) => { setTimerInputVisible(false); const mins = parseInt(minutes, 10); if (isNaN(mins) || mins <= 0) { Alert.alert("Invalid Input", "Please enter valid minutes."); return } const timeoutId = setTimeout(() => { soundObject.current.pauseAsync(); setMusicAppState(prev => ({ ...prev, sleepTimerId: null })) }, mins * 60 * 1000); setMusicAppState(prev => ({...prev, sleepTimerId: timeoutId})); Alert.alert("Timer Set", `Music will stop in ${mins} minutes.`) };
  const handleToggleFavoriteSong = (songId) => { const newPlaylist = playlist.map(s => s.id === songId ? {...s, isFavorite: !s.isFavorite} : s); setMusicAppState(prev => ({...prev, playlist: newPlaylist})); AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaylist)) };
  const handleSortMusic = (type) => {
      if (type === 'clear') { setMusicAppState(prev => ({...prev, sort: {type: 'default', order: 'asc'}})); return }
      const currentSort = musicAppState.sort;
      if (type === 'alpha') { const newOrder = currentSort.type === 'alpha' && currentSort.order === 'asc' ? 'desc' : 'asc'; setMusicAppState(prev => ({...prev, sort: {type: 'alpha', order: newOrder}})) }
      else if (type === 'date') { const newOrder = currentSort.type === 'date' && currentSort.order === 'desc' ? 'asc' : 'desc'; setMusicAppState(prev => ({...prev, sort: {type: 'date', order: newOrder}})) }
  };
  const handleRefreshMusic = async () => {
        if (!permissionGranted) { Alert.alert("Permission Denied"); return }
        setIsLoading(true);
        try { const currentFavorites = new Map(playlist.filter(p => p.isFavorite).map(p => [p.id, true])); let allAssets = [], hasNextPage = true, after; while(hasNextPage) { const result = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 100, after, sortBy: [MediaLibrary.SortBy.creationTime] }); if (result.assets.length > 0) allAssets.push(...result.assets); hasNextPage = result.hasNextPage; after = result.endCursor } const newTracks = allAssets.map(asset => ({ id: asset.id, filename: asset.filename, uri: asset.uri, duration: asset.duration, creationTime: asset.creationTime, isFavorite: currentFavorites.has(asset.id) || false })); if (newTracks.length > 0) { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTracks)); setMusicAppState(prev => ({...prev, playlist: newTracks})); Alert.alert("Playlist Refreshed", `Found ${newTracks.length} songs.`) } else { Alert.alert("No Songs Found") }
        } catch (error) { console.error(error); Alert.alert("Error refreshing playlist.") } finally { setIsLoading(false) }
  };

  if (!fontsLoaded && !fontError) return null;

  const renderScreen = () => {
    switch (activeTab) {
      case 'Quotes': return <QuotesScreen />;
      case 'Notepad': return <NotepadScreen />;
      case 'Music': return <MusicScreen musicAppState={{...musicAppState, displayedSongs, permissionGranted, isLoading}} handlers={{ onSearch: (q) => setMusicAppState(p=>({...p, searchQuery: q})), onSort: handleSortMusic, onToggleFavorites: () => setMusicAppState(p=>({...p, showFavoritesOnly: !p.showFavoritesOnly})), onSetTrack: handleSelectTrack, onToggleFavoriteSong: handleToggleFavoriteSong, onRefresh: handleRefreshMusic }} />;
      case 'Gallery': return <GalleryScreen />;
      default: return <QuotesScreen />;
    }
  };

  const NavItem = ({ name, icon }) => ( <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab(name)}> <FontAwesome5 name={icon} size={22} color={activeTab === name ? COLORS.accentPrimaryDarker : COLORS.textSecondary} /> <Text style={[ styles.navText, { color: activeTab === name ? COLORS.accentPrimaryDarker : COLORS.textSecondary }]}> {name} </Text> {activeTab === name && <View style={styles.activeIndicator} />} </TouchableOpacity> );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Amina's Aura</Text></View>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
      {playbackStatus?.isLoaded && ( <TouchableOpacity onPress={() => setPlayerModalVisible(true)}> <LinearGradient colors={currentGradient} style={styles.miniPlayerContainer}> <View style={styles.miniPlayerArt}><MusicAvatar name={currentAvatar} size={28} /></View> <View style={styles.miniPlayerInfo}> <Text style={styles.miniPlayerTitle} numberOfLines={1}>{currentTrack?.filename ?? 'Select a Song'}</Text> <Text style={styles.miniPlayerArtist}>Tap to open player</Text> </View> <TouchableOpacity onPress={(e) => { e.stopPropagation(); handlePlayPause(); }} style={styles.miniPlayerControls}> <FontAwesome5 name={isPlaying ? "pause" : "play"} size={22} color={COLORS.textPrimary}/> </TouchableOpacity> </LinearGradient> </TouchableOpacity> )}
      <PlayerModal isVisible={isPlayerModalVisible} onClose={() => setPlayerModalVisible(false)} musicState={{...musicAppState, playbackStatus, isPlaying}} handlers={{handlePlayPause, handleNext, handlePrevious, handleSeek, handleToggleRepeat, handleToggleShuffle, handleSetTimer}} />
      <TimerInputModal isVisible={isTimerInputVisible} onClose={() => setTimerInputVisible(false)} onSetTimer={handleConfirmTimer} />
      <View style={styles.navBar}> <NavItem name="Quotes" icon="lightbulb" /> <NavItem name="Notepad" icon="book-open" /> <NavItem name="Music" icon="headphones-alt" /> <NavItem name="Gallery" icon="image" /> </View>
    </SafeAreaView>
  );
}


// --- Stylesheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgMain, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  header: { padding: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  headerTitle: { fontSize: 24, color: COLORS.accentPrimaryDarker, fontFamily: FONT_FAMILY.playfair },
  screenContainer: { flexGrow: 1, padding: 15 },
  navBar: { flexDirection: 'row', height: 65, borderTopWidth: 1, borderTopColor: COLORS.borderColor, backgroundColor: COLORS.bgCard },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, marginTop: 4, fontFamily: FONT_FAMILY.poppins },
  activeIndicator: { position: 'absolute', bottom: 0, width: '40%', height: 3, backgroundColor: COLORS.accentPrimaryDarker, borderRadius: 2 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 18, marginBottom: 15, shadowColor: COLORS.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardHeaderContainer: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor, },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardHeaderTitle: { fontSize: 16, color: COLORS.textPrimary, fontFamily: FONT_FAMILY.poppinsBold },
  cardHeaderSubtitle: { fontSize: 12, color: COLORS.textSecondary, fontFamily: FONT_FAMILY.poppins, marginTop: 4 },
  infoText: { textAlign: 'center', color: COLORS.textSecondary, fontFamily: FONT_FAMILY.poppins, marginTop: 10, marginBottom: 10, fontSize: 13, },
  infoSubText: { textAlign: 'center', color: COLORS.textSecondary, fontFamily: FONT_FAMILY.poppins, fontSize: 12, marginTop: 4 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  btnPrimary: { backgroundColor: COLORS.accentPrimary },
  btnSecondary: { backgroundColor: '#F8F2F9', borderWidth: 1, borderColor: COLORS.accentSecondary },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 15, fontFamily: FONT_FAMILY.poppinsMedium },
  btnTextPrimary: { color: COLORS.textOnAccent },
  btnTextSecondary: { color: COLORS.accentPrimaryDarker },
  textInput: { borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 15, width: '100%', backgroundColor: 'white', color: COLORS.textPrimary, fontSize: 15, fontFamily: FONT_FAMILY.poppins, marginBottom: 10 },
  
  // QUOTE SCREEN STYLES
  dailyQuoteCard: {
    borderRadius: 24, paddingVertical: 15, paddingHorizontal: 20, marginBottom: 15, shadowColor: COLORS.shadowColor, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10,
  },
  quoteHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%'
  },
  quoteHeaderText: {
    fontFamily: FONT_FAMILY.poppinsBold, fontSize: 16, color: COLORS.textOnAccent,
  },
  quoteFavoriteButton: {
    padding: 8,
  },
   quoteSubtitle: {
    fontFamily: FONT_FAMILY.poppins, fontSize: 11, color: COLORS.textOnAccent, opacity: 0.8, marginTop: 2, marginBottom: 8,
  },
  quoteBody: {
      alignItems: 'center', paddingHorizontal: 5,
  },
  quoteText: {
    fontSize: 20, lineHeight: 30, color: COLORS.textOnAccent, fontFamily: FONT_FAMILY.playfair, textAlign: 'center', marginVertical: 10,
  },
  favoriteQuoteCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 12, backgroundColor: 'white', marginBottom: 10, shadowColor: COLORS.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  favoriteQuoteText: { flex: 1, fontSize: 18, fontFamily: FONT_FAMILY.playfair, color: COLORS.textPrimary, lineHeight: 28, paddingRight: 10 },
  favoriteActionBtn: { padding: 8, marginLeft: 15, },
  
  // MINI PLAYER STYLES (NOW WITH GRADIENT)
  miniPlayerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    paddingHorizontal: 15, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  miniPlayerArt: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    backgroundColor: 'rgba(0,0,0,0.05)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  miniPlayerInfo: { flex: 1, marginLeft: 12, },
  miniPlayerTitle: { 
    fontSize: 15, 
    fontFamily: FONT_FAMILY.poppinsMedium, 
    color: COLORS.textPrimary
  },
  miniPlayerArtist: { 
    fontSize: 12, 
    fontFamily: FONT_FAMILY.poppins, 
    color: 'rgba(0,0,0,0.6)'
  },
  miniPlayerControls: { paddingLeft: 15 },
  
  // NEW MUSIC PLAYER STYLES
  musicScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  musicSearchInput: {
      backgroundColor: COLORS.bgCard,
      color: COLORS.textPrimary,
  },
  musicControlsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10,
    marginTop: 15,
  },
  sortContainer: { flexDirection: 'row', alignItems: 'center' },
  sortButton: { 
      paddingVertical: 8, 
      paddingHorizontal: 16, 
      borderRadius: 20, 
      backgroundColor: COLORS.bgCard, 
      marginRight: 10, 
  },
  sortButtonActive: { 
      backgroundColor: COLORS.accentSecondary,
  },
  sortButtonText: { 
      fontFamily: FONT_FAMILY.poppinsMedium, 
      color: COLORS.textSecondary, 
      fontSize: 13 
  },
  sortButtonTextActive: {
      color: COLORS.textOnAccent
  },
  favoriteToggle: { padding: 8 },
  songItem: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: 12, 
      paddingHorizontal: 10,
      marginBottom: 10,
      borderRadius: 12,
  },
  songItemArt: {
      width: 45,
      height: 45,
      borderRadius: 10,
      backgroundColor: COLORS.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
  },
  songItemText: { 
      fontSize: 15, 
      fontFamily: FONT_FAMILY.poppinsMedium, 
      color: COLORS.textPrimary, 
  },
  songItemSubText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.poppins,
      color: COLORS.textSecondary,
      marginTop: 2,
  },
  emptyListContainer: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginTop: 50, 
      paddingHorizontal: 20,
  },

  // NEW PLAYER MODAL STYLES
  playerModalContainer: { 
      flex: 1, 
  },
  playerModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
  },
  playerModalCloseButton: {
      padding: 10,
  },
   playerModalHeaderButton: {
      padding: 10,
  },
  playerModalHeaderText: {
      fontFamily: FONT_FAMILY.poppinsMedium,
      fontSize: 16,
      color: COLORS.textPrimary,
  },
  playerModalContent: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'space-around', 
      paddingHorizontal: 30, 
      paddingBottom: 20 
  },
  playerModalArtContainer: { 
      width: Dimensions.get('window').width * 0.75, 
      height: Dimensions.get('window').width * 0.75, 
      borderRadius: 30, 
      backgroundColor: 'rgba(255,255,255,0.2)', 
      justifyContent: 'center', 
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 10
  },
  playerModalTrackInfo: { alignItems: 'center', marginVertical: 15 },
  playerModalTrackTitle: { 
      fontFamily: FONT_FAMILY.playfair, 
      fontSize: 26, 
      color: COLORS.textPrimary, 
      textAlign: 'center' 
  },
  playerModalTrackArtist: { 
      fontFamily: FONT_FAMILY.poppins, 
      fontSize: 16, 
      color: 'rgba(0,0,0,0.5)', 
      marginTop: 8 
  },
  playerModalSliderContainer: { width: '100%' },
  playerModalTimeContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      width: '100%', 
      marginTop: 5 
  },
  playerModalTimeText: { fontFamily: FONT_FAMILY.poppins, color: 'rgba(0,0,0,0.5)', fontSize: 12 },
  mainControlsContainer: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-around', 
      width: '100%', 
  },
  modalControlButton: { padding: 10 },
  modalPlayButton: { 
      backgroundColor: COLORS.musicPlayerAccent,
      width: 70, 
      height: 70, 
      borderRadius: 35, 
      justifyContent: 'center', 
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8
  },
  secondaryControlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '60%',
      marginTop: 10,
      opacity: 0.8
  },

  optionsMenuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  timerInputContainer: { backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 25, width: '90%', alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  timerInputTitle: { fontSize: 18, fontFamily: FONT_FAMILY.poppinsBold, color: COLORS.textPrimary, marginBottom: 15, textAlign: 'center' },
  
  // --- NEW GALLERY STYLES ---
  galleryContainer: {
      flex: 1,
      backgroundColor: COLORS.bgMain,
  },
  galleryScrollContainer: {
      paddingHorizontal: 8,
      paddingBottom: 100,
  },
  galleryGrid: {
      flexDirection: 'row',
  },
  galleryColumn: {
      flex: 1,
  },
  galleryCard: {
      margin: 8,
      borderRadius: 18,
      backgroundColor: COLORS.borderColor,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 4,
  },
  galleryCardImage: {
      width: '100%',
      aspectRatio: 2/3, // Default aspect ratio, can be adjusted
      justifyContent: 'flex-end',
  },
  galleryCardOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      padding: 12,
      borderRadius: 18,
  },
  galleryCardDate: {
      fontFamily: FONT_FAMILY.poppins,
      fontSize: 12,
      color: COLORS.textOnAccent,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10
  },
  galleryCardTitle: {
      fontFamily: FONT_FAMILY.playfair,
      fontSize: 18,
      color: COLORS.textOnAccent,
      lineHeight: 24,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10
  },
  addPhotoContainer: { backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 20, width: '90%', alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  galleryImagePreview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15, backgroundColor: COLORS.borderColor },
  viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  viewerImage: { width: '100%', height: '80%' },
  viewerCloseButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 30, right: 20, padding: 10, zIndex: 10 },
  viewerDeleteButton: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 20, padding: 15 },
  viewerNav: { position: 'absolute', top: '50%', padding: 15, transform: [{ translateY: -15 }] },
  viewerNavLeft: { left: 15 },
  viewerNavRight: { right: 15 },

  
  // WEATHER STYLES
  weatherCard: {
    borderRadius: 18, marginTop: 15, shadowColor: COLORS.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6, overflow: 'hidden',
  },
  weatherMainContent: {
      padding: 12,
  },
  weatherTopRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  weatherIcon: {
    marginRight: 10,
  },
  weatherTempText: {
    fontFamily: FONT_FAMILY.poppinsBold, fontSize: 15, color: COLORS.textPrimary, flexShrink: 1,
  },
  weatherInfoText: {
    fontFamily: FONT_FAMILY.poppins, fontSize: 14, color: COLORS.textSecondary, textAlign: 'center'
  },
  weatherQuoteText: {
    fontFamily: FONT_FAMILY.playfair, fontSize: 15, fontStyle: 'italic', color: COLORS.textPrimary, marginTop: 8, textAlign: 'left', lineHeight: 22,
  },
  weatherFooter: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingVertical: 6, paddingHorizontal: 12,
  },
  updateButton: {
      padding: 5,
  },
  updateTimestamp: {
      fontFamily: FONT_FAMILY.poppins, fontSize: 11, color: COLORS.textSecondary,
  },

  // DISTANCE CONNECTOR / AURA CONNECT STYLES
  auraConnectCard: {
    borderRadius: 18, marginTop: 15, shadowColor: COLORS.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6, overflow: 'hidden', backgroundColor: COLORS.bgCard, padding: 12
  },
  auraConnectPromptCard: {
    borderRadius: 18, marginTop: 15, shadowColor: COLORS.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6, overflow: 'hidden', backgroundColor: COLORS.bgCard, padding: 15, alignItems: 'center',
  },
   auraConnectPromptText: {
    fontFamily: FONT_FAMILY.poppinsBold, fontSize: 16, color: COLORS.accentPrimaryDarker, marginTop: 8,
  },
  distanceInfoText: {
    textAlign: 'center', color: COLORS.textSecondary, marginBottom: 8, fontSize: 12, fontFamily: FONT_FAMILY.poppins,
  },
  codeContainer: {
    backgroundColor: COLORS.bgMain, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderColor, flexDirection: 'row', justifyContent: 'space-between'
  },
  codeText: {
    fontSize: 16, fontFamily: FONT_FAMILY.poppinsBold, color: COLORS.accentPrimaryDarker, letterSpacing: 1
  },
  connectInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  distanceDisplay: {
    alignItems: 'center', marginVertical: 8,
  },
  distanceValue: {
    fontSize: 28, fontFamily: FONT_FAMILY.playfair, color: COLORS.textPrimary,
  },
  distanceUnit: {
    fontSize: 14, color: COLORS.textSecondary, fontFamily: FONT_FAMILY.poppins, marginLeft: 5,
  },
  distanceLocationText: {
      fontFamily: FONT_FAMILY.poppins,
      fontSize: 14,
      color: COLORS.textSecondary,
      marginTop: 4,
  },
  updateText: {
    fontSize: 11, color: COLORS.textSecondary, marginTop: 5, fontFamily: FONT_FAMILY.poppins,
  },
  setupModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupContainer: {
      width: '90%',
      padding: 20,
      backgroundColor: COLORS.bgMain,
      borderRadius: 20,
  },
  setupTitle: {
      fontSize: 24,
      fontFamily: FONT_FAMILY.playfair,
      color: COLORS.textPrimary,
      textAlign: 'center',
      marginBottom: 10,
  },
  setupSubtitle: {
      fontSize: 15,
      fontFamily: FONT_FAMILY.poppins,
      color: COLORS.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
  },
  distanceLabel: {
      fontFamily: FONT_FAMILY.poppins,
      fontSize: 13,
      color: COLORS.textSecondary,
      marginBottom: 4,
  },

  // --- NEW NOTEPAD STYLES ---
  notepadContainer: {
    flex: 1,
    backgroundColor: COLORS.notepadBg,
  },
  notepadHeader: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  notepadSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
  },
  notepadSearchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONT_FAMILY.poppins,
    color: COLORS.textPrimary,
  },
  notepadFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  notepadFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    marginHorizontal: 5,
  },
  notepadFilterActive: {
    backgroundColor: COLORS.notepadPrimary,
  },
  notepadFilterText: {
    fontFamily: FONT_FAMILY.poppinsMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  notepadFilterTextActive: {
    color: COLORS.textOnAccent,
  },
  notepadEmptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 60,
  },
  notepadEmptyText: {
      fontFamily: FONT_FAMILY.poppins,
      fontSize: 16,
      color: COLORS.textSecondary,
      marginTop: 15,
  },
  noteCardWrapper: {
      width: '50%',
      padding: 8,
  },
  noteCard: {
      borderRadius: 18,
      padding: 15,
      height: Dimensions.get('window').width / 2 - 24, 
      justifyContent: 'space-between',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  noteCardTitle: {
      fontFamily: FONT_FAMILY.poppinsBold,
      fontSize: 15,
      color: COLORS.textPrimary,
  },
  noteCardContent: {
      fontFamily: FONT_FAMILY.poppins,
      fontSize: 13,
      color: COLORS.textPrimary,
      opacity: 0.7,
      flex: 1,
  },
   noteCardLockedView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
  noteCardFooter: {
      //
  },
  noteCardDate: {
      fontFamily: FONT_FAMILY.poppins,
      fontSize: 10,
      color: COLORS.textPrimary,
      opacity: 0.5,
      marginTop: 2,
  },
  noteCardFavoriteIcon: {
      position: 'absolute',
      top: 12,
      right: 12,
  },
  fabContainer: {
      position: 'absolute',
      right: 25,
      bottom: 25,
      alignItems: 'center',
      zIndex: 10,
  },
  fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
  },
  fabMain: {
      backgroundColor: COLORS.notepadPrimary,
  },
  notepadEditorContainer: {
    flex: 1,
    backgroundColor: 'transparent', // The gradient is the background
  },
  notepadEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.2)' // Slight tint for header
  },
  notepadEditorButton: {
    padding: 8,
  },
  notepadEditorButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textPrimary,
  },
  notepadEditorTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.poppinsBold,
    color: COLORS.textPrimary,
  },
  notepadEditorContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  notepadEditorInputTitle: {
    fontFamily: FONT_FAMILY.playfair,
    fontSize: 28,
    color: COLORS.textPrimary,
    paddingBottom: 10,
    opacity: 0.9
  },
  notepadEditorInputContent: {
    fontFamily: FONT_FAMILY.poppins,
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
    textAlignVertical: 'top',
    lineHeight: 24,
    opacity: 0.8
  },
  notepadEditorToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)' // Slight tint for toolbar
  },
  notepadEditorToolbarButton: {
    padding: 10,
  },
  deleteModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  deleteModalContainer: {
    width: '85%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.poppinsBold,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  deleteModalMessage: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.poppins,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteModalCancelButton: {
    backgroundColor: COLORS.borderColor,
    marginRight: 10,
  },
  deleteModalConfirmButton: {
    backgroundColor: COLORS.accentPrimaryDarker,
    marginLeft: 10,
  },
  deleteModalButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textPrimary
  },
});
