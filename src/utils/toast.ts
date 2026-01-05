import { useToast } from '@/hooks/use-toast'; // Using shadcn/ui's useToast

export const showSuccess = (message: string) => {
  const { toast } = useToast();
  toast({
    title: "Success!",
    description: message,
    variant: "default",
  });
};

export const showError = (message: string) => {
  const { toast } = useToast();
  toast({
    title: "Error!",
    description: message,
    variant: "destructive",
  });
};

export const showLoading = (message: string) => {
  const { toast } = useToast();
  const { id } = toast({
    title: "Loading...",
    description: message,
    duration: 999999, // Long duration for loading
  });
  return id;
};

export const dismissToast = (toastId: string) => {
  const { dismiss } = useToast();
  dismiss(toastId);
};