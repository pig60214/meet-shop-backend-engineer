import express, {
  Express,
  Router,
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from 'express';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import httpContext from 'express-http-context';
import { RegisterRoutes } from './routes/routes';
import swaggerDocument from './routes/swagger.json';
import ApiResponseError from './models/ApiResponseError';
import EnumResponseStatus from './models/enums/EnumResponseStatus';
import logger from './utils/logger';
import logMiddleware from './controllers/middlewares/logMiddleware';

const app: Express = express();
app.use(express.json());
app.use(httpContext.middleware);
app.use(logMiddleware);
const router = Router();
RegisterRoutes(router);

app.use('/', router);

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

app.use((
  err: Error,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction,
): ExResponse | void => { /* eslint-disable-line consistent-return */
  if (err instanceof ValidateError) {
    const response = new ApiResponseError(EnumResponseStatus.ValidationFailed);
    response.status.detail = JSON.stringify((err as ValidateError).fields);
    return res.json(response);
  }

  logger.error(err);
  return res.status(500).json();

  next();
});

export default app;
