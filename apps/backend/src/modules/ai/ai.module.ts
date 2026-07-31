import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Card } from '../cards/card.entity';
import { AI_PROVIDER } from './providers/ai-provider.interface';
import { MockAiProvider } from './providers/mock.provider';
import { GroqAiProvider } from './providers/groq.provider';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { Project } from '../projects/project.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Project]), PermissionsModule, ProjectsModule],
  providers: [
    {
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('AI_PROVIDER')?.toLowerCase() ?? 'mock';

        switch (provider) {
          case 'mock':
            return new MockAiProvider();
          case 'groq':
            return new GroqAiProvider(
              config.get<string>('GROQ_API_KEY'),
              config.get<string>('GROQ_MODEL') ?? 'openai/gpt-oss-20b',
            );
          default:
            throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
        }
      },
    },
    AiService,
  ],
  controllers: [AiController],
})
export class AiModule {}
