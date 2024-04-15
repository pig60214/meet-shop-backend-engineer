import {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from 'express';
import httpContext from 'express-http-context';
import { v4 } from 'uuid';
import logger from '../../utils/logger';

// @ts-ignore
const resDotSendInterceptor = (res, send) => (content) => {
  res.contentBody = content;
  res.send = send;
  res.send(content);
};

export default async function logMiddleware(req: ExRequest, res: ExResponse, next: NextFunction) {
  const reqId = v4().substring(0, 6);
  httpContext.set('reqId', reqId);
  logger.info(`${req.url} Request: ${JSON.stringify(req.body)}`);
  // @ts-ignore
  res.send = resDotSendInterceptor(res, res.send);
  res.on('finish', () => {
    // @ts-ignore
    logger.info(`${req.url} Response: ${res.contentBody}`);
  });
  next();
}
