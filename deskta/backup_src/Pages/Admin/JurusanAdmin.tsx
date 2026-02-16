import { useState } from "react";
import AdminLayout from "../../component/Admin/AdminLayout";
import { Button } from "../../component/Shared/Button";
import { SearchBox } from "../../component/Shared/Search";
import { Table } from "../../component/Shared/Table";
 import { TambahJurusanForm } from "../../component/Shared/Form/JurusanForm"
// import { TambahJurusanForm } from "../../component/Shared/Form/JurusanForm";
import AWANKIRI from "../../assets/Icon/AWANKIRI.png";
import AwanBawahkanan from "../../assets/Icon/AwanBawahkanan.png";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

interface User {
  role: string;
  name: string;
}

interface Jurusan {
  id: string;
  kode: string;
  nama: string;
}

interface JurusanAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

const dummyData: Jurusan[] = [
  { id: "1", kode: "0874621525", nama: "Rekayasa Perangkat Lunak" },
  { id: "2", kode: "0874621525", nama: "Elektronika Industri" },
  { id: "3", kode: "0874621525", nama: "Mekatronika" },
  { id: "4", kode: "0874621525", nama: "Animasi" },
  { id: "5", kode: "0874621525", nama: "Desain Komunikasi Visual" },
];

export default function JurusanAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: JurusanAdminProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>(dummyData);
  const [editingJurusan, setEditingJurusan] = useState<Jurusan | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const columns = [
    { key: "kode", label: "Kode Jurusan" },
    { key: "nama", label: "Konsentrasi Keahlian" },
    {
      key: "aksi",
      label: "Aksi",
      render: (_: any, row: Jurusan) => (
        <div style={{ position: "relative" }}>
          <button
            onClick={() =>
              setOpenActionId((prev) => (prev === row.id ? null : row.id))
            }
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <MoreVertical size={20} strokeWidth={1.5} />
          </button>

          {openActionId === row.id && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 6,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                zIndex: 20,
                overflow: "hidden",
                minWidth: 140,
              }}
            >
              <button
                onClick={() => {
                  setOpenActionId(null);
                  setEditingJurusan(row);
                  setIsModalOpen(true);
                }}
                style={{ ...actionBtnStyle, color: "#0F172A" }}
              >
                <Edit size={18} strokeWidth={2} /> Edit
              </button>
              <button
                onClick={() => handleDelete(row)}
                style={{ ...actionBtnStyle, color: "#B91C1C" }}
              >
                <Trash2 size={18} strokeWidth={2} /> Hapus
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const actionBtnStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "none",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
  };

  const filteredData = jurusanList.filter(
    (j) =>
      j.kode.includes(searchValue) ||
      j.nama.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleDelete = (row: Jurusan) => {
    if (confirm(`Hapus "${row.nama}"?`)) {
      setJurusanList((prev) => prev.filter((j) => j.id !== row.id));
    }
  };

  return (
    <AdminLayout
      pageTitle="Data Jurusan"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      <img src={AWANKIRI} style={bgLeft} />
      <img src={AwanBawahkanan} style={bgRight} />

      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(6px)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255,255,255,0.6)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <SearchBox
            placeholder="Cari Jurusan..."
            value={searchValue}
            onChange={setSearchValue}
          />
          <Button label="Tambahkan" onClick={() => setIsModalOpen(true)} />
        </div>

        <Table columns={columns} data={filteredData} keyField="id" />
      </div>

      <TambahJurusanForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJurusan(null);
        }}
        isEdit={!!editingJurusan}
        initialData={
          editingJurusan
            ? {
                namaJurusan: editingJurusan.nama,
                kodeJurusan: editingJurusan.kode,
              }
            : undefined
        }
        onSubmit={(data) => {
          if (editingJurusan) {
            // ✅ FIX EDIT UPDATE
            setJurusanList((prev) =>
              prev.map((j) =>
                j.id === editingJurusan.id
                  ? {
                      ...j,
                      nama: data.namaJurusan,
                      kode: data.kodeJurusan,
                    }
                  : j
              )
            );
          } else {
            setJurusanList((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                nama: data.namaJurusan,
                kode: data.kodeJurusan,
              },
            ]);
          }

          setIsModalOpen(false);
          setEditingJurusan(null);
        }}
      />
    </AdminLayout>
  );
}

const bgLeft: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: 220,
  zIndex: 0,
};

const bgRight: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  right: 0,
  width: 220,
  zIndex: 0,
};
