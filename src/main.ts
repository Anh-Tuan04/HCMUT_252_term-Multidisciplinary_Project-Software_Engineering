import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './common/filters/app.exception.filter';
import { TransformInterceptor } from './common/filters/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
