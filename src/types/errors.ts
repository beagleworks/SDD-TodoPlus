export interface AppError {
  type: 'STORAGE_ERROR' | 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: any;
}