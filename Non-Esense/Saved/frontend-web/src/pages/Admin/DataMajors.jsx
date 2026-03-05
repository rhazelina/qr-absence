import React from 'react';
import MasterDataPage from '../../components/Admin/MasterDataPage';
import apiService from '../../utils/api';

export default function DataMajors() {
  return (
    <MasterDataPage
      title="Data Jurusan"
      fetchFunction={apiService.getMajors.bind(apiService)}
      createFunction={apiService.addMajor.bind(apiService)}
      updateFunction={apiService.updateMajor.bind(apiService)}
      deleteFunction={apiService.deleteMajor.bind(apiService)}
      columns={[
        { key: 'code', label: 'Kode' },
        { key: 'name', label: 'Nama Jurusan' }
      ]}
      formFields={[
        { name: 'code', label: 'Kode Jurusan' },
        { name: 'name', label: 'Nama Jurusan' }
      ]}
    />
  );
}
