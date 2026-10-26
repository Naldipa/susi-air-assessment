import { createNestApplication } from '../nest/src/application';

let appPromise: ReturnType<typeof createNestApplication> | undefined;

type RequestLike = { url?: string };
type ExpressHandler = (request: unknown, response: unknown) => void;

export default async function handler(request: unknown, response: unknown): Promise<void> {
  if (!appPromise) {
    appPromise = createNestApplication();
  }

  let app: Awaited<ReturnType<typeof createNestApplication>>;
  try {
    app = await appPromise;
  } catch (error) {
    appPromise = undefined;
    throw error;
  }

  const requestLike = request as RequestLike;
  const originalUrl = requestLike.url ?? '/';
  requestLike.url =
    originalUrl === '/api'
      ? '/'
      : originalUrl.startsWith('/api/')
        ? originalUrl.slice(4)
        : originalUrl;

  const expressHandler = app.getHttpAdapter().getInstance() as ExpressHandler;
  expressHandler(request, response);
}
