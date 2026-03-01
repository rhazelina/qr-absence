import React from 'react';
import MasterDataPage from '../../components/Admin/MasterDataPage';
import apiService from '../../utils/api';

export default function DataRooms() {
  return (
    <MasterDataPage
      title="Data Ruangan"
      fetchFunction={apiService.getRooms.bind(apiService)}
      createFunction={apiService.addRoom.bind(apiService)}
      updateFunction={apiService.updateRoom.bind(apiService)}
      deleteFunction={apiService.deleteRoom.bind(apiService)}
      columns={[
        { key: 'name', label: 'Nama' },
        { key: 'location', label: 'Lokasi' },
        { key: 'capacity', label: 'Kapasitas' }
      ]}
      formFields={[
        { name: 'name', label: 'Nama Ruangan' },
        { name: 'location', label: 'Lokasi' },
        { name: 'capacity', label: 'Kapasitas' }
      ]}
    />
  );
}
