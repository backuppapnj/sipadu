import { formatDate } from '@/lib/sipadu-utils';
import { StatusBadge } from './StatusBadge';
import type { Complaint } from '@/types';

interface PrintableComplaintCardProps {
    complaint: Complaint;
}

/**
 * Kartu pengaduan yang diformat untuk dicetak.
 * Berisi: nomor tiket, detail pengaduan, tanggal pengajuan.
 * Format tanda terima resmi PA Penajam.
 */
export function PrintableComplaintCard({ complaint }: PrintableComplaintCardProps) {
    return (
        <div className="print-only hidden p-8 font-serif text-black bg-white" id="printable-complaint">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-lg font-bold uppercase">Pengadilan Agama Penajam</h1>
                <p className="text-sm">Jl. Provinsi KM. 9, Kec. Penajam, Kab. PPU, Kaltim 76142</p>
                <p className="text-sm">Telp: 0822-5693-1508 | Website: pa-penajam.go.id</p>
            </div>

            {/* Judul */}
            <div className="text-center mb-6">
                <h2 className="text-base font-bold uppercase">Tanda Terima Pengaduan Layanan</h2>
                <p className="text-sm text-gray-600">SIPADU — Sistem Informasi Pengaduan Layanan</p>
            </div>

            {/* Detail */}
            <table className="w-full text-sm mb-6">
                <tbody>
                    <tr>
                        <td className="py-1 font-medium w-1/3">Nomor Tiket</td>
                        <td className="py-1">: <strong>{complaint.ticket_no}</strong></td>
                    </tr>
                    <tr>
                        <td className="py-1 font-medium">Tanggal Pengajuan</td>
                        <td className="py-1">: {formatDate(complaint.created_at)}</td>
                    </tr>
                    <tr>
                        <td className="py-1 font-medium">Kategori</td>
                        <td className="py-1">: {complaint.category?.name}</td>
                    </tr>
                    <tr>
                        <td className="py-1 font-medium">Judul Pengaduan</td>
                        <td className="py-1">: {complaint.title}</td>
                    </tr>
                    <tr>
                        <td className="py-1 font-medium">Tanggal Kejadian</td>
                        <td className="py-1">: {formatDate(complaint.incident_date)}</td>
                    </tr>
                    <tr>
                        <td className="py-1 font-medium">Lokasi Kejadian</td>
                        <td className="py-1">: {complaint.incident_location ?? '-'}</td>
                    </tr>
                    <tr>
                        <td className="py-1 font-medium">Status</td>
                        <td className="py-1">: <StatusBadge status={complaint.status} /></td>
                    </tr>
                    <tr>
                        <td className="py-1 font-medium">Batas Penyelesaian</td>
                        <td className="py-1">: {formatDate(complaint.sla_deadline)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Uraian */}
            <div className="mb-6">
                <p className="font-medium mb-1">Uraian Pengaduan:</p>
                <p className="text-sm leading-relaxed border p-3 rounded">
                    {complaint.description}
                </p>
            </div>

            {/* QR Code placeholder */}
            <div className="flex justify-between items-end mt-8">
                <div className="text-center">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-400">
                        QR Code
                    </div>
                    <p className="text-xs mt-1">Scan untuk lacak status</p>
                </div>

                <div className="text-center">
                    <p className="text-sm">Penajam, {formatDate(complaint.created_at)}</p>
                    <div className="h-16" />
                    <p className="text-sm border-t border-black pt-1">Petugas PTSP</p>
                </div>
            </div>

            {/* Catatan */}
            <div className="mt-8 border-t pt-4 text-xs text-gray-600">
                <p className="font-medium">Catatan:</p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>Simpan tanda terima ini sebagai bukti pengajuan pengaduan.</li>
                    <li>Gunakan nomor tiket untuk melacak status pengaduan di website SIPADU.</li>
                    <li>Batas waktu penyelesaian pengaduan sesuai kategori (hari kerja).</li>
                </ul>
            </div>
        </div>
    );
}
