
import { db } from '../db';
import { patientsTable, salesTransactionsTable } from '../db/schema';
import { gte, and, sql, desc } from 'drizzle-orm';
import { z } from 'zod';

// Dashboard statistics schema
const dashboardStatsSchema = z.object({
    total_patients_today: z.number(),
    total_patients_this_month: z.number(),
    total_sales_today: z.number(),
    total_sales_this_month: z.number(),
    recent_patients: z.array(z.object({
        id: z.number(),
        name: z.string(),
        examination_date: z.coerce.date()
    })),
    recent_sales: z.array(z.object({
        id: z.number(),
        item_service_name: z.string(),
        total: z.number(),
        created_at: z.coerce.date()
    }))
});

type DashboardStats = z.infer<typeof dashboardStatsSchema>;

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        // Calculate date boundaries
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count patients today
        const patientsToday = await db.select({
            count: sql<number>`count(*)::int`
        })
        .from(patientsTable)
        .where(gte(patientsTable.created_at, todayStart))
        .execute();

        // Count patients this month
        const patientsThisMonth = await db.select({
            count: sql<number>`count(*)::int`
        })
        .from(patientsTable)
        .where(gte(patientsTable.created_at, monthStart))
        .execute();

        // Calculate sales total today
        const salesToday = await db.select({
            total: sql<string>`coalesce(sum(total), 0)`
        })
        .from(salesTransactionsTable)
        .where(gte(salesTransactionsTable.created_at, todayStart))
        .execute();

        // Calculate sales total this month
        const salesThisMonth = await db.select({
            total: sql<string>`coalesce(sum(total), 0)`
        })
        .from(salesTransactionsTable)
        .where(gte(salesTransactionsTable.created_at, monthStart))
        .execute();

        // Get recent patients (last 5)
        const recentPatientsData = await db.select({
            id: patientsTable.id,
            name: patientsTable.name,
            examination_date: patientsTable.examination_date
        })
        .from(patientsTable)
        .orderBy(desc(patientsTable.created_at))
        .limit(5)
        .execute();

        // Get recent sales (last 5)
        const recentSalesData = await db.select({
            id: salesTransactionsTable.id,
            item_service_name: salesTransactionsTable.item_service_name,
            total: salesTransactionsTable.total,
            created_at: salesTransactionsTable.created_at
        })
        .from(salesTransactionsTable)
        .orderBy(desc(salesTransactionsTable.created_at))
        .limit(5)
        .execute();

        // Convert numeric fields and format results
        const recentPatients = recentPatientsData.map(patient => ({
            id: patient.id,
            name: patient.name,
            examination_date: new Date(patient.examination_date)
        }));

        const recentSales = recentSalesData.map(sale => ({
            id: sale.id,
            item_service_name: sale.item_service_name,
            total: parseFloat(sale.total), // Convert numeric to number
            created_at: sale.created_at
        }));

        return {
            total_patients_today: patientsToday[0].count,
            total_patients_this_month: patientsThisMonth[0].count,
            total_sales_today: parseFloat(salesToday[0].total), // Convert numeric to number
            total_sales_this_month: parseFloat(salesThisMonth[0].total), // Convert numeric to number
            recent_patients: recentPatients,
            recent_sales: recentSales
        };
    } catch (error) {
        console.error('Dashboard stats retrieval failed:', error);
        throw error;
    }
};
