const { Reservation, ParkingSpot } = require('../models');

exports.cleanupExpiredReservations = async () => {
    try {
        const now = new Date();

        // Encontrar todas as reservas ativas/pendentes
        const activeReservations = await Reservation.findAll({
            where: {
                status: ['confirmed', 'pending']
            }
        });

        const pendingExpired = [];
        const confirmedExpired = [];

        for (const r of activeReservations) {
            const [sYear, sMonth, sDay] = r.date.split('-').map(Number);
            const [sHour, sMin] = r.start_time.split(':').map(Number);
            const [eHour, eMin] = r.end_time.split(':').map(Number);

            const startDatetime = new Date(sYear, sMonth - 1, sDay, sHour, sMin);
            const endDatetime = new Date(sYear, sMonth - 1, sDay, eHour, eMin);

            if (r.status === 'confirmed') {
                if (now >= endDatetime) {
                    confirmedExpired.push(r);
                }
            } else if (r.status === 'pending') {
                const limitDatetime = new Date(startDatetime.getTime() - 30 * 60 * 1000);
                if (now >= endDatetime || now >= limitDatetime) {
                    pendingExpired.push(r);
                }
            }
        }

        const totalExpiredCount = pendingExpired.length + confirmedExpired.length;

        if (totalExpiredCount > 0) {
            console.log(`[Cleanup] Encontradas ${totalExpiredCount} reservas expiradas (${pendingExpired.length} pendentes, ${confirmedExpired.length} confirmadas).`);

            if (pendingExpired.length > 0) {
                const pendingIds = pendingExpired.map(r => r.id_reservation);
                await Reservation.update(
                    { status: 'cancelled' },
                    { where: { id_reservation: pendingIds } }
                );
            }

            if (confirmedExpired.length > 0) {
                const confirmedIds = confirmedExpired.map(r => r.id_reservation);
                await Reservation.update(
                    { status: 'completed' },
                    { where: { id_reservation: confirmedIds } }
                );
            }

            // Libertar os lugares correspondentes
            const allExpiredSpots = [...pendingExpired, ...confirmedExpired].map(r => r.id_spot);
            // Remover duplicados por precaução
            const uniqueSpotIds = [...new Set(allExpiredSpots)];

            await ParkingSpot.update(
                { status: 'free' },
                { where: { id_spot: uniqueSpotIds } }
            );

            console.log(`[Cleanup] Lugar(es) [${uniqueSpotIds.join(', ')}] libertado(s) com sucesso.`);
        }
    } catch (err) {
        console.error('[Cleanup] Erro ao limpar reservas expiradas:', err);
    }
};
