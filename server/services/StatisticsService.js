const {Sequelize} = require('sequelize');
const {ParkingSlot, Zone, Tariff, User, Car} = require('../models/Models');
const sequelize = require('../db');

class StatisticsService {
    async getOverview(start, end) {
        let dateCondBookings = '';
        let dateCondCars = '';
        const replacements = {};

        if (start) {
            dateCondBookings += ` AND b.start_time::date >= :startDate`;
            replacements.startDate = start;
        }
        if (end) {
            dateCondBookings += ` AND b.end_time::date <= :endDate`;
            replacements.endDate = end;
        }

        if (start) {
            dateCondCars += ` AND c.exit_time::date >= :startDate`;
            replacements.startDate = start;
        }
        if (end) {
            dateCondCars += ` AND c.entry_time::date <= :endDate`;
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
                ${dateCondCars}
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
                ${dateCondCars}
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
        let dateCondCars = '';
        const replacements = {};

        if (start) {
            dateCondBookings += ` AND b.start_time::date >= :startDate`;
            replacements.startDate = start;
        }
        if (end) {
            dateCondBookings += ` AND b.end_time::date <= :endDate`;
            replacements.endDate = end;
        }

        if (start) {
            dateCondCars += ` AND c.exit_time::date >= :startDate`;
            replacements.startDate = start;
        }
        if (end) {
            dateCondCars += ` AND c.entry_time::date <= :endDate`;
            replacements.endDate = end;
        }

        const zonesStatsQuery = `
            SELECT z.id                  AS zone_id,
                   z.name                AS zone_name,

                   COUNT(DISTINCT ps.id) AS total_slots,

                   COUNT(
                           DISTINCT CASE
                                        WHEN ps.status = 'free' THEN ps.id
                                        ELSE NULL
                       END
                   )                     AS free_slots,

                   COUNT(b.id) FILTER (
                       WHERE b.status = 'approved'
                           ${dateCondBookings}
                       )                 AS approved_bookings,

                   COUNT(c.id) FILTER (
                       WHERE c.exit_time IS NOT NULL
                                            ${dateCondCars} )                     AS cars_count,

                COALESCE(
          SUM(
            EXTRACT(EPOCH FROM (c.exit_time - c.entry_time)) / 3600 * t.price_per_hour
          ) FILTER (
            WHERE c.exit_time IS NOT NULL ${dateCondCars}
                ), 0
                ) AS revenue

            FROM zones z
                JOIN tariffs t
            ON t.id = z.tariff_id
                LEFT JOIN parking_slots ps ON ps.zone_id = z.id
                LEFT JOIN bookings b
                ON b.parking_slot_id = ps.id
                AND b.status = 'approved'
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
