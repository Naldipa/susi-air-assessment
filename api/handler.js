const { createNestApplication } = require('../nest/dist/application.js');

let appPromise;

module.exports = async function handler(request, response) {
  if (!appPromise) {
    appPromise = createNestApplication();
  }

  let app;
  try {
    app = await appPromise;
  } catch (error) {
    appPromise = undefined;
    throw error;
  }

  const rewrittenUrl = new URL(request.url ?? '/', 'http://vercel.local');
  const apiPath = rewrittenUrl.searchParams.get('__vercel_path') ?? '';
  rewrittenUrl.searchParams.delete('__vercel_path');
  rewrittenUrl.searchParams.delete('path');
  const remainingQuery = rewrittenUrl.searchParams.toString();
  request.url = `/${apiPath.replace(/^\/+/, '')}${remainingQuery ? `?${remainingQuery}` : ''}`;

  app.getHttpAdapter().getInstance()(request, response);
};
