import React, { useEffect, useRef, useState } from 'react';
import { Label } from '@/Components/ui/label';

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: string | HTMLElement, parameters: any) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      execute: (siteKey: string, options?: { action: string }) => Promise<string>;
    };
  }
}

export default function ReCaptcha({
  siteKey,
  onVerify,
  onExpired,
  onError,
  theme = 'light',
  size = 'normal',
  className = '',
  label,
  error,
  required = false,
}: ReCaptchaProps) {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load reCAPTCHA script
  useEffect(() => {
    if (window.grecaptcha) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
      onError?.();
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://www.google.com/recaptcha/api.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [onError]);

  // Initialize reCAPTCHA widget
  useEffect(() => {
    if (!isScriptLoaded || !recaptchaRef.current || isLoaded) return;

    window.grecaptcha.ready(() => {
      if (!recaptchaRef.current) return;

      try {
        const id = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => {
            onVerify(token);
          },
          'expired-callback': () => {
            onExpired?.();
          },
          'error-callback': () => {
            onError?.();
          },
        });
        
        setWidgetId(id);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to render reCAPTCHA:', error);
        onError?.();
      }
    });
  }, [isScriptLoaded, siteKey, theme, size, onVerify, onExpired, onError, isLoaded]);

  // Reset reCAPTCHA
  const reset = () => {
    if (widgetId !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetId);
    }
  };

  // Get response
  const getResponse = () => {
    if (widgetId !== null && window.grecaptcha) {
      return window.grecaptcha.getResponse(widgetId);
    }
    return '';
  };

  // Expose methods to parent component
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    reset,
    getResponse,
  }));

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div 
        ref={recaptchaRef}
        className="flex justify-center"
      />
      
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
      
      {!isScriptLoaded && (
        <div className="flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading reCAPTCHA...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for invisible reCAPTCHA
export function useInvisibleReCaptcha(siteKey: string) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    
    document.head.appendChild(script);
  }, []);

  const execute = (action: string = 'submit'): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!isLoaded || !window.grecaptcha) {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(siteKey, { action })
          .then(resolve)
          .catch(reject);
      });
    });
  };

  return { execute, isLoaded };
}
