export default interface IAnswer<T = unknown> {
    success: boolean;
    data: T | null;
    exception?: string;
    message?: string;
  }
  