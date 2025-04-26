const { kendaraanQueue } = require('../config/middleware/queue');
const Model_Kendaraan = require('../model/model_kendaraan');

kendaraanQueue.process(async (job) => {
    const { action, id, Data } = job.data;

    console.log(`Memproses antrian kendaraan... (ID: ${job.id}, Action: ${action})`);

    try {
        if (action === 'get') {
            const hasilQuery = await Model_Kendaraan.getAll();
            console.log(`Antrian ID ${job.id} selesai: Data kendaraan diambil.`);
            return { Data: hasilQuery };
        }

        if (action === 'store') {
            await Model_Kendaraan.Store(Data);
            console.log(`Antrian ID ${job.id} selesai: Kendaraan berhasil ditambahkan.`);
            return { message: "Kendaraan berhasil ditambahkan" };
        }

        if (action === 'update') {
            await Model_Kendaraan.update(id, Data);
            console.log(`Antrian ID ${job.id} selesai: Data kendaraan ID ${id} berhasil diperbarui.`);
            return { message: `Kendaraan dengan ID ${id} berhasil diperbarui` };
        }

        if (action === 'delete') {
            await Model_Kendaraan.delete(id);
            console.log(`Antrian ID ${job.id} selesai: Data kendaraan ID ${id} berhasil dihapus.`);
            return { message: `Kendaraan dengan ID ${id} berhasil dihapus` };
        }

        if (action === 'getBelumKeluar') {
            const hasilQuery = await Model_Kendaraan.getBelumKeluar();
            console.log(`Antrian ID ${job.id} selesai: Data kendaraan belum keluar diambil.`);
            return { Data: hasilQuery };
        }

        if (action === 'getSudahKeluar') {
            const hasilQuery = await Model_Kendaraan.getSudahKeluar();
            console.log(`Antrian ID ${job.id} selesai: Data kendaraan sudah keluar diambil.`);
            return { Data: hasilQuery };
        }

        if (action === 'getTotalIncome') {
            const total = await Model_Kendaraan.getTotalIncome();
            console.log(`Antrian ID ${job.id} selesai: Total income dihitung.`);
            return { total_income: total };
        }

        if (action === 'getTotalIncomeBulanIni') {
            const total = await Model_Kendaraan.getTotalIncomeBulanIni();
            console.log(`Antrian ID ${job.id} selesai: Total income bulan ini dihitung.`);
            return { total_income: total };
        }

        if (action === 'getTotalIncomeHariIni') {
            const total = await Model_Kendaraan.getTotalIncomeHariIni();
            console.log(`Antrian ID ${job.id} selesai: Total income hari ini dihitung.`);
            return { total_income: total };
        }

        if (action === 'getSlotKosong') {
            const slot = await Model_Kendaraan.getSlotKosong();
            console.log(`Antrian ID ${job.id} selesai: Slot parkir kosong didapatkan.`);
            return { slot };
        }

        throw new Error('Action tidak dikenal');

    } catch (error) {
        console.error(`Antrian ID ${job.id} gagal: ${error.message}`);
        throw error;
    }
});

console.log("Worker kendaraan berjalan dan siap memproses antrian...");
