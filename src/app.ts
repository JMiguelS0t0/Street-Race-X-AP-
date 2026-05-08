import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import vehicleRoutes from './routes/vehicle.routes';
import challengeRoutes from './routes/challenge.routes';
import notificationRoutes from './routes/notification.routes';
import categoryRoutes from './routes/category.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

dotenv.config();

const app: Application = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/challenges', challengeRoutes);
app.use('/notifications', notificationRoutes);
app.use('/categories', categoryRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Street Race X API'
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    statusCode,
    details: err.details || []
  });
});

export default app;
