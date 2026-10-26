import { Controller, Get, Inject } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(@Inject(DocumentsService) private readonly documents: DocumentsService) {}

  @Get()
  getDocuments() {
    return this.documents.getDocuments();
  }
}
