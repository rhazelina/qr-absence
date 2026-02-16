import axios from 'axios';

/**
 * Check if the error is a request cancellation (Abort or Axios cancel)
 */
export const isCancellation = (error: any): boolean => {
  return (
    axios.isCancel(error) || 
    error?.name === 'AbortError' || 
    error?.name === 'CanceledError'
  );
};
