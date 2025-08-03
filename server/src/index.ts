
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createPatientInputSchema, 
  createSalesTransactionInputSchema,
  updatePatientInputSchema,
  updateSalesTransactionInputSchema,
  getPatientsInputSchema,
  getSalesTransactionsInputSchema
} from './schema';

// Import handlers
import { createPatient } from './handlers/create_patient';
import { getPatients } from './handlers/get_patients';
import { updatePatient } from './handlers/update_patient';
import { deletePatient } from './handlers/delete_patient';
import { createSalesTransaction } from './handlers/create_sales_transaction';
import { getSalesTransactions } from './handlers/get_sales_transactions';
import { updateSalesTransaction } from './handlers/update_sales_transaction';
import { deleteSalesTransaction } from './handlers/delete_sales_transaction';
import { getDashboardStats } from './handlers/get_dashboard_stats';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Patient management routes
  createPatient: publicProcedure
    .input(createPatientInputSchema)
    .mutation(({ input }) => createPatient(input)),
  
  getPatients: publicProcedure
    .input(getPatientsInputSchema.optional())
    .query(({ input }) => getPatients(input)),
  
  updatePatient: publicProcedure
    .input(updatePatientInputSchema)
    .mutation(({ input }) => updatePatient(input)),
  
  deletePatient: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePatient(input)),

  // Sales transaction management routes
  createSalesTransaction: publicProcedure
    .input(createSalesTransactionInputSchema)
    .mutation(({ input }) => createSalesTransaction(input)),
  
  getSalesTransactions: publicProcedure
    .input(getSalesTransactionsInputSchema.optional())
    .query(({ input }) => getSalesTransactions(input)),
  
  updateSalesTransaction: publicProcedure
    .input(updateSalesTransactionInputSchema)
    .mutation(({ input }) => updateSalesTransaction(input)),
  
  deleteSalesTransaction: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteSalesTransaction(input)),

  // Dashboard statistics
  getDashboardStats: publicProcedure
    .query(() => getDashboardStats()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Klinik Manonjaya TRPC server listening at port: ${port}`);
}

start();
