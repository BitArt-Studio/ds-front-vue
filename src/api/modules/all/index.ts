import service from '@/api/http';

export const randomUsableSeed = (address: string): Promise<any> => {
  return service.get(`/seed/randomUsableSeed?address=${address}`);
};

export const saveOrder = (address: string, feeRate: number): Promise<any> => {
  return service.post(`/order/save`, { address, feeRate });
};

export const executeOrder = (orderId: string): Promise<any> => {
  return service.post(`/order/execute`, { orderId });
};

export const whiteListValidate = (address: string): Promise<any> => {
  return service.get(`/whitelist/validate`, { address });
};
