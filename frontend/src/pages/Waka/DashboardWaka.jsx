import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { FaUser } from "react-icons/fa";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./DashboardWaka.css";
import { useNavigate } from "react-router-dom";
import NavbarWaka from "../../components/Waka/NavbarWaka";
import apiService from '../../utils/api';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardWaka() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [statistik, setStatistik] = useState({ hadir:0, izin:0, sakit:0, alfa:0, pulang:0 });
  const [chartData, setChartData] = useState({ labels:[], datasets:[] });
  const [classesList, setClassesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => { const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t); },[]);

  useEffect(() => {
    const fetchSem = async () => {
      try{
        const resp = await apiService.getSemesters();
        const list = Array.isArray(resp)?resp:(Array.isArray(resp?.data)?resp.data:[]);
        setSemesters(list);
        if(list.length){
          const active = list.find(i=>i.active)||list[0];
          setSelectedSemesterId(String(active.id));
        }
      }catch(e){console.error(e);}
      try{
        const r = await apiService.getClasses({ per_page:1000 });
        setClassesList(r.data||r||[]);
      }catch(e){console.error(e);}
    };
    fetchSem();
  },[]);

  useEffect(()=>{
    if(semesters.length && !selectedSemesterId) return;
    const controller = new AbortController();
    const fetchData = async () => {
      setIsLoading(true); setErrorMessage("");
      try{
        const res = await apiService.getWakaDashboardSummary(selectedSemesterId||undefined,{signal:controller.signal});
        const statApi = res?.statistik||{};
        setStatistik({ hadir:statApi.hadir||0, izin:statApi.izin||0, sakit:statApi.sakit||0, alfa:statApi.alpha||0, pulang:statApi.pulang||0 });
        const labels = res?.trend?.map(i=>i.month) || [];
        setChartData({ labels, datasets: [
          { label:"Hadir", data:labels.map(l=>res?.trend.find(t=>t.month===l)?.present||0), backgroundColor:"#1FA83D", borderRadius:6 },
          { label:"Izin", data:labels.map(l=>res?.trend.find(t=>t.month===l)?.izin||0), backgroundColor:"#EDD329", borderRadius:6 },
          { label:"Sakit", data:labels.map(l=>res?.trend.find(t=>t.month===l)?.sick||0), backgroundColor:"#9A0898", borderRadius:6 },
          { label:"Alfa", data:labels.map(l=>res?.trend.find(t=>t.month===l)?.absent||0), backgroundColor:"#D90000", borderRadius:6 },
          { label:"Pulang", data:labels.map(l=>res?.trend.find(t=>t.month===l)?.return||0), backgroundColor:"#FF5F1A", borderRadius:6 }
        ]});
      }catch(err){ if(err.name!=='AbortError'){console.error(err); setErrorMessage(err.message||"Error");}}
      finally{setIsLoading(false);}
    };

    fetchData();
    return()=>controller.abort();
  },[selectedSemesterId]);

  const tanggal = now.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const jam = now.toLocaleTimeString("id-ID");
  const handleLogout = () => { if(window.confirm('Apakah Anda yakin ingin keluar?')){localStorage.removeItem('token');localStorage.removeItem('user');sessionStorage.clear();navigate('/');alert('Anda telah berhasil logout');}};

  return (
    <div className="dashboard-page">
      <NavbarWaka />
      {/* template content with sidebar, top row, stats mini cards, chart and semester dropdown */}
    </div>
  );
}
