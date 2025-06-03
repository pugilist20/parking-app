const {Sequelize} = require('sequelize');
const {ParkingSlot, Zone, Tariff, User, Car} = require('../models/Models');
const sequelize = require('../db');

class StatisticsService {
    /**
     * 1) Общая статистика:
     *    • totalBookings   — всего бронирований за период (не изменялось)
     *    • approvedCount   — одобренных бронирований за период (не изменялось)
     *    • totalCars       — количество машин, чья сессия пересекла [start, end]
     *    • totalRevenue    — суммарная выручка по машинам (calculating by (exit_time-entry_time)*price)
     *    • totalUsers      — общее количество пользователей (без фильтра)
     *
     * @param {string} start — 'YYYY-MM-DD', опционально
     * @param {string} end   — 'YYYY-MM-DD', опционально
     */
    async getOverview(start, end) {
        let dateCondBookings = '';
        let dateCondCarsIntersect = '';
        const replacements = {};


        if (start) {
            dateCondBookings += ` AND b.start_time >= :startDate`;
            replacements.startDate = start;
        }
        if (end) {
            dateCondBookings += ` AND b.start_time <= :endDate`;
            replacements.endDate = end;
        }




        if (start) {
            dateCondCarsIntersect += ` AND c.exit_time >= :startDate`;
            replacements.startDate = start;
        }
        if (end) {
            dateCondCarsIntersect += ` AND c.entry_time <= :endDate`;
            replacements.endDate = end;
        }


        const totalBookingsQuery = `
            SELECT COUNT(*) AS total_bookings
            FROM bookings b
            WHERE 1 = 1
                ${dateCondBookings}
        `;
        const totalBookingsResult = await sequelize.query(totalBookingsQuery, {
            type: Sequelize.QueryTypes.SELECT,
            replacements
        });
        const totalBookings = parseInt(totalBookingsResult[0].total_bookings, 10) || 0;


        const approvedCountQuery = `
            SELECT COUNT(*) AS approved_count
            FROM bookings b
            WHERE b.status = 'approved'
                ${dateCondBookings}
        `;
        const approvedCountResult = await sequelize.query(approvedCountQuery, {
            type: Sequelize.QueryTypes.SELECT,
            replacements
        });
        const approvedCount = parseInt(approvedCountResult[0].approved_count, 10) || 0;


        const totalCarsQuery = `
            SELECT COUNT(*) AS total_cars
            FROM cars c
            WHERE c.exit_time IS NOT NULL
                ${dateCondCarsIntersect}
        `;
        const totalCarsResult = await sequelize.query(totalCarsQuery, {
            type: Sequelize.QueryTypes.SELECT,
            replacements
        });
        const totalCars = parseInt(totalCarsResult[0].total_cars, 10) || 0;

        const revenueQuery = `
            SELECT COALESCE(SUM(
                                    EXTRACT(EPOCH FROM (c.exit_time - c.entry_time)) / 3600 * t.price_per_hour
                            ), 0) AS total_revenue
            FROM cars c
                     JOIN parking_slots ps ON ps.id = c.parking_slot_id
                     JOIN zones z ON z.id = ps.zone_id
                     JOIN tariffs t ON t.id = z.tariff_id
            WHERE c.exit_time IS NOT NULL
                ${dateCondCarsIntersect}
        `;
        const revenueResult = await sequelize.query(revenueQuery, {
            type: Sequelize.QueryTypes.SELECT,
            replacements
        });
        const totalRevenue = parseFloat(revenueResult[0].total_revenue) || 0.0;


        const totalUsers = await User.count();

        return {
            totalBookings,
            approvedCount,
            totalCars,
            totalRevenue,
            totalUsers
        };
    }

    async getByZone(start, end) {
        let dateCondBookings = '';
        let dateCondCarsIntersect = '';
        const replacements = {};


        if (start) {
            dateCondBookings += ` AND b.start_time >= :startDate`;
            replacements.startDate = start;
        }
        if (end) {
            dateCondBookings += ` AND b.start_time <= :endDate`;
            replacements.endDate = end;
        }



        if (start) {
            dateCondCarsIntersect += ` AND c.exit_time >= :startDate`;

        }
        if (end) {
            dateCondCarsIntersect += ` AND c.entry_time <= :endDate`;

        }

        const zonesStatsQuery = `
            SELECT z.id                  AS zone_id,
                   z.name                AS zone_name,

                   -- 3) Общее количество **уникальных** слотов в зоне:
                   COUNT(DISTINCT ps.id) AS total_slots,

                   -- 4) Количество **уникальных** свободных слотов (ps.status = 'free'):
                   COUNT(
                           DISTINCT CASE
                                        WHEN ps.status = 'free' THEN ps.id
                                        ELSE NULL
                       END
                   )                     AS free_slots,

                   -- 5) Количество одобренных бронирований (status='approved'), с учётом фильтра по датам:
                   COUNT(b.id) FILTER (
                       WHERE b.status = 'approved'
                           ${dateCondBookings}
                       )                 AS approved_bookings,

                   -- 6) Количество машин в зоне (carsCount), т. е. 
                   --    считаем **каждую** запись из cars (не DISTINCT),
                   --    только те, чья сессия пересекла период:
                   COUNT(c.id) FILTER (
                       WHERE c.exit_time IS NOT NULL
                                            ${dateCondCarsIntersect} ) AS cars_count,

              -- 7) Выручка по зоне: 
              --    для каждой машины (из cars) берём (exit_time - entry_time)/3600 * price_per_hour,
              --    фильтруем те же условия по car (exit_time IS NOT NULL + пересечение периода).
              COALESCE(
                SUM(
                  EXTRACT(EPOCH FROM (c.exit_time - c.entry_time)) / 3600 * t.price_per_hour
                ) FILTER (
                  WHERE c.exit_time IS NOT NULL ${dateCondCarsIntersect}
                ), 0
                ) AS revenue

            FROM zones z
                JOIN tariffs t
            ON t.id = z.tariff_id
                LEFT JOIN parking_slots ps ON ps.zone_id = z.id
                LEFT JOIN bookings b
                ON b.parking_slot_id = ps.id AND b.status = 'approved'
                LEFT JOIN cars c
                ON c.parking_slot_id = ps.id

            GROUP BY z.id, z.name, t.price_per_hour
            ORDER BY z.id;
        `;

        const zonesStats = await sequelize.query(zonesStatsQuery, {
            type: Sequelize.QueryTypes.SELECT,
            replacements
        });

        return zonesStats.map(row => ({
            zoneId: row.zone_id,
            zoneName: row.zone_name,
            totalSlots: parseInt(row.total_slots, 10),
            freeSlots: parseInt(row.free_slots, 10),
            approvedBookings: parseInt(row.approved_bookings, 10),
            carsCount: parseInt(row.cars_count, 10),
            revenue: parseFloat(row.revenue)
        }));
    }
}

module.exports.StatisticsService = StatisticsService;
