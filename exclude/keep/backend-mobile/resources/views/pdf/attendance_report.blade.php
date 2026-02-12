<!DOCTYPE html>
<html>
<head>
    <title>Laporan Absensi</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Laporan Absensi Siswa</h2>
        <p>Tanggal: {{ $date }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Status</th>
                <th>Waktu</th>
            </tr>
        </thead>
        <tbody>
            @foreach($attendances as $attendance)
            <tr>
                <td>{{ $attendance->student->user->name ?? 'N/A' }}</td>
                <td>{{ $attendance->schedule->class->name ?? 'N/A' }}</td>
                <td>{{ $attendance->status }}</td>
                <td>{{ $attendance->checked_in_at ? $attendance->checked_in_at->format('H:i') : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
