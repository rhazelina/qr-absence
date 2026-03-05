import React from 'react';
import MasterDataPage from '../../components/Admin/MasterDataPage';
import apiService from '../../utils/api';

export default function DataTimeSlots() {
  return (
    <MasterDataPage
      title="Data Time Slot"
      fetchFunction={apiService.getTimeSlots.bind(apiService)}
      createFunction={apiService.addTimeSlot.bind(apiService)}
      updateFunction={apiService.updateTimeSlot.bind(apiService)}
      deleteFunction={apiService.deleteTimeSlot.bind(apiService)}
      columns={[
        { key: 'name', label: 'Nama' },
        { key: 'start_time', label: 'Mulai' },
        { key: 'end_time', label: 'Selesai' }
      ]}
      formFields={[
        { name: 'name', label: 'Nama Slot' },
        { name: 'start_time', label: 'Waktu Mulai', type: 'time' },
        { name: 'end_time', label: 'Waktu Selesai', type: 'time' }
      ]}
    />
  );
}
