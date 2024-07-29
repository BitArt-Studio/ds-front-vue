import service from '@/api/http';
import { PageParam, PageResult } from '@/api/modules/interface';

export const pageLatest = (pageParam: PageParam): Promise<PageResult> => {
  return service.get(`/inscriptions/latest`, pageParam);
};
