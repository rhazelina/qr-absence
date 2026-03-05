import React from 'react';
import MasterDataPage from '../../components/Admin/MasterDataPage';
import apiService from '../../utils/api';

export default function DataSubjects() {
  return (
    <MasterDataPage
      title="Data Mata Pelajaran"
      fetchFunction={apiService.getSubjects.bind(apiService)}
      createFunction={apiService.addSubject.bind(apiService)}
      updateFunction={apiService.updateSubject.bind(apiService)}
      deleteFunction={apiService.deleteSubject.bind(apiService)}
      columns={[
        { key: 'code', label: 'Kode' },
        { key: 'name', label: 'Nama Mata Pelajaran' }
      ]}
      formFields={[
        { name: 'code', label: 'Kode Mata Pelajaran' },
        { name: 'name', label: 'Nama Mata Pelajaran' }
      ]}
    />
  );
}
