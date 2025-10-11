import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/Maps.css'

// Fix for missing marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

var firstrun=false

// Util component to update map view dynamically
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords, map]);
  return null;
}

export default function MapWithSearchAndLocation() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [position, setPosition] = useState([28.6139, 77.2090]); // Default: Delhi
  const [selectedName, setSelectedName] = useState('Default: Delhi');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const inputRef = useRef();

  // Fetch location suggestions (autocomplete)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };
    const timeout = setTimeout(fetchSuggestions, 400); // debounce
    return () => clearTimeout(timeout);
  }, [query]);

  // Handle user selecting a suggestion
  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setPosition([lat, lon]);
    setSelectedName(place.display_name);
    setSuggestions([]);
    setQuery('');
  };

//   useEffect(()=>{
//     if(firstrun)
//         return;
//     firstrun=true
//     handleCurrentLocation()
//   },[])

  // Handle current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setSelectedName('📍 Your Current Location');
        setLoadingLocation(false);
      },
      (err) => {
        console.error(err);
        alert('Unable to fetch your location.');
        setLoadingLocation(false);
      }
    );
  };

  return (
    <div>
      {/* Search + current location controls */}
      <div
        className='search'
      >
        <input
            className='search-input'
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search location..."
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              maxHeight: 150,
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderTop: 'none',
              background: 'white',
              borderRadius: '0 0 6px 6px',
            }}
          >
            {suggestions.map((place, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(place)}
                style={{
                  padding: '8px 10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
                onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}

        {/* Current location button */}
        <button
        className="currloc"
          onClick={handleCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? 'Getting location...' : '📍 Use Current Location'}
        </button>
      </div>

      {/* Leaflet Map */}
      <MapContainer center={position} zoom={13} style={{margin:'auto', height: '50vh', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeMapView coords={position} />
        <Marker position={position}>
          <Popup>{selectedName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
