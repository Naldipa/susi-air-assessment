import { createNestApplication } from './application';

async function bootstrap(): Promise<void> {
  const app = await createNestApplication();
  const port = Number(process.env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer from 1 to 65535');
  }
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
