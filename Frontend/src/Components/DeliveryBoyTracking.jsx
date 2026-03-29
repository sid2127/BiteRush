import React from 'react'
import scooter from '../assets/scooter.png'
import home from '../assets/home.png'
import L from 'leaflet'
import { MapContainer, Marker, Polygon, Popup, TileLayer } from 'react-leaflet';

const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [40,40],
})

const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40,40]
})
 

function DeliveryBoyTracking({ data }) {

    const deliveryBoyLat = data.deliveryOrder.assignedTo.location.coordinates[1];
    const deliveryBoyLon = data.deliveryOrder.assignedTo.location.coordinates[0];

    const customerLat = data.deliveryOrder.order.deliveryAddress.latitude;
    const customerLon = data.deliveryOrder.order.deliveryAddress.longitude;

   
    const center = [deliveryBoyLat, deliveryBoyLon];
    const path = [
        [deliveryBoyLat , deliveryBoyLon] , 
        [customerLat , customerLon]
    ]

    return (
        <div className='w-full h-full rounded-lg shadow p-4 overflow-hidden'>
            <MapContainer className='w-full h-full' center={center} zoom={16}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[deliveryBoyLat,deliveryBoyLon]} icon={deliveryBoyIcon}>
                    <Popup>Delivery Boy</Popup>
                </Marker>

                <Marker position={[customerLat,customerLon]} icon={customerIcon}>
                    <Popup>Customer Home</Popup>
                </Marker>

                <Polygon positions={path} color='blue'/>

            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking