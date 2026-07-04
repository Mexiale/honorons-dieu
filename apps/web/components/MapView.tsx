'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Lieu } from '@/lib/types';

const ABIDJAN: [number, number] = [5.348, -4.007];

function markerIcon(couleur: string) {
  return L.divIcon({
    className: '',
    html: `<div class="hd-marker" style="background:${couleur}"><span>✦</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

function FitBounds({ lieux }: { lieux: Lieu[] }) {
  const map = useMap();
  useEffect(() => {
    if (!lieux.length) return;
    const bounds = L.latLngBounds(
      lieux.map((l) => [l.latitude, l.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [lieux, map]);
  return null;
}

export default function MapView({
  lieux,
  position,
}: {
  lieux: Lieu[];
  position?: [number, number] | null;
}) {
  return (
    <MapContainer
      center={position ?? ABIDJAN}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds lieux={lieux} />
      {position && (
        <Marker
          position={position}
          icon={L.divIcon({
            className: '',
            html: '<div style="width:16px;height:16px;border-radius:50%;background:#1E3A5F;border:3px solid white;box-shadow:0 0 0 4px rgba(30,58,95,.25)"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup>Vous êtes ici</Popup>
        </Marker>
      )}
      {lieux.map((lieu) => (
        <Marker
          key={lieu.id}
          position={[lieu.latitude, lieu.longitude]}
          icon={markerIcon(lieu.religion?.couleur ?? '#1E3A5F')}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold">{lieu.nom}</p>
              <p className="text-xs text-gray-500">
                {lieu.religion?.nom} · {lieu.commune ?? lieu.ville}
              </p>
              {lieu.distanceKm != null && (
                <p className="text-xs text-gray-500">à {lieu.distanceKm} km</p>
              )}
              <Link
                href={`/lieux/${lieu.id}`}
                className="mt-1 inline-block text-sm font-medium text-blue-700 underline"
              >
                Voir la fiche
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
