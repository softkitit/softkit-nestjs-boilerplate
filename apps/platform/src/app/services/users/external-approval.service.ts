import { Injectable } from '@nestjs/common';
import { ExternalApproval } from '../../database/entities';
import { ExternalApprovalsRepository } from '../../repositories';
import { BaseEntityService } from '@softkit/typeorm-service';

@Injectable()
export class ExternalApprovalService extends BaseEntityService<
  ExternalApproval,
  'id',
  ExternalApprovalsRepository,
  Pick<ExternalApproval, 'id' | 'version'>
> {
  constructor(private readonly usersRepository: ExternalApprovalsRepository) {
    super(usersRepository);
  }
}
