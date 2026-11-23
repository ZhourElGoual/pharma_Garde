import { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Props = {
  pharmacies: any[];
};

const PharmacyMap = forwardRef<MapView, Props>(
  ({ pharmacies }, ref) => (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFillObject}
      initialRegion={{
        latitude: 34.6867,
        longitude: -1.9114,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation
    >
      {pharmacies.map((p) => (
        <Marker
          key={p.id}
          coordinate={{
            latitude: p.latitude,
            longitude: p.longitude,
          }}
          title={p.name}
          description={p.address}
          pinColor={p.onDuty ? 'green' : 'gray'}
        />
      ))}
    </MapView>
  )
);

export default PharmacyMap;