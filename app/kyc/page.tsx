"use client";

import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { FileUploader } from '@/components/kyc/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, Mail, AlertTriangle } from 'lucide-react';

export default function KycPage() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Loading your verification status...</p>
          </div>
        </div>
      </AuthLoading>
      
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Please sign in to access KYC verification.</p>
            <Button onClick={() => window.location.href = '/auth/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <KycContent />
      </Authenticated>
    </>
  );
}

function KycContent() {
  const user = useQuery(api.auth.getCurrentUser);
  const router = useRouter();
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState<boolean | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailVerificationSuccess, setEmailVerificationSuccess] = useState(false);
  const kycFetched = useRef(false);
  const emailFetched = useRef(false);

  // Fetch KYC status from Convex
  const kycStatus = useQuery(api.kyc.getKycStatus);
  const sendVerificationEmail = useAction(api.auth.sendVerificationEmail);
  
  const loading = user === undefined || kycStatus === undefined;
  const shouldRedirect = Boolean(user && kycVerified === true);

  useEffect(() => {
    console.log("KYC Page useEffect triggered:", {
      kycStatus,
      user: user ? { email: user.email, name: user.name } : null,
      emailFetched: emailFetched.current,
      timestamp: new Date().toISOString()
    });

    if (kycStatus) {
      setKycVerified(kycStatus.kycVerified);
      setEmailVerified(kycStatus.emailVerified);
      
      console.log("KYC Status details:", {
        emailVerified: kycStatus.emailVerified,
        kycVerified: kycStatus.kycVerified,
        userEmail: user?.email,
        shouldSendEmail: !kycStatus.emailVerified && user?.email && !emailFetched.current
      });
      
      // Auto-send verification email if user is not verified and we haven't sent one yet
      if (!kycStatus.emailVerified && user?.email && !emailFetched.current) {
        console.log("Attempting to send verification email for:", user.email);
        emailFetched.current = true;
        sendVerificationEmail({ email: user.email })
          .then((result) => {
            console.log("Verification email sent successfully:", result);
          })
          .catch((error) => {
            console.error("Failed to send verification email:", error);
            // Reset the flag so we can try again
            emailFetched.current = false;
          });
      } else {
        console.log("Skipping email send:", {
          reason: !kycStatus.emailVerified ? "Email already verified" : 
                  !user?.email ? "No user email" : 
                  emailFetched.current ? "Already attempted" : "Unknown"
        });
      }
    }
  }, [kycStatus, user, sendVerificationEmail]);

  // Check for email verification success in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setEmailVerificationSuccess(true);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/dashboard');
    }
  }, [shouldRedirect, router]);

  // Countdown effect for successful verification
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      router.push('/dashboard');
    }
  }, [countdown, router]);

  // Debug logging
  console.log('KYC Page Debug:', {
    userId: user?.subject,
    kycVerified,
    emailVerified,
    loading,
    shouldRedirect,
    kycStatus
  });

  // Prevent UI flash while loading or when redirecting
  if (loading || shouldRedirect) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
          <p className="text-muted-foreground">
            {loading ? 'Loading your verification status...' : 'Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  const handleFileChange = (newFiles: { [key: string]: File | null }) => {
    setFiles(newFiles);
    setError(null);
    setVerificationStatus(null);
  };

  const handleVerification = async () => {
    const uploadedFiles = Object.values(files).filter(Boolean) as File[];
    
    if (uploadedFiles.length === 0) {
      setError("Please upload your government-issued ID.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationStatus('Processing...');

    try {
      // 1. Upload the files to get URLs
      const uploadedFileUrls: { [key: string]: string } = {};
      for (const docId in files) {
        const file = files[docId];
        if (file) {
          const response = await fetch(
            `/api/upload?filename=${file.name}`,
            {
              method: 'POST',
              body: file,
            },
          );
          const newBlob = await response.json();
          if (!response.ok) {
            throw new Error(newBlob.error || 'File upload failed.');
          }
          uploadedFileUrls[docId] = newBlob.url;
        }
      }

      // 2. Call the KYC verification API with the first uploaded file
      const firstFileUrl = Object.values(uploadedFileUrls)[0];
      const verifyResponse = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: firstFileUrl }),
      });

      const result = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(result.message || "Verification process failed.");
      }

      setIsSuccess(true);
      setVerificationStatus('Verification successful!');
      setCountdown(3);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setVerificationStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFiles = Object.values(files).some(Boolean);


  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Verify Your Identity</CardTitle>
            <CardDescription>
              Please upload a government-issued ID to complete our KYC (Know Your Customer) process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
          {emailVerificationSuccess && (
            <Alert className="border-green-500 bg-green-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Email Verified Successfully!</AlertTitle>
              </div>
              <AlertDescription className="text-green-700">
                Your email has been verified. You can now proceed with KYC verification.
              </AlertDescription>
            </Alert>
          )}

          {!emailVerified && !emailVerificationSuccess && (
            <Alert className="border-orange-500 bg-orange-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <AlertTitle className="text-orange-800">Email Verification Required</AlertTitle>
              </div>
              <AlertDescription className="text-orange-700">
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4" />
                  <span>Please check your inbox and verify your email address before proceeding with KYC verification.</span>
                </div>
                <div className="mt-2 text-sm">
                  <strong>Note:</strong> Check your email inbox (and spam folder) for the verification email. If you don't receive it, check your browser console for the verification URL.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {verificationStatus && !error && (
             <Alert className={isSuccess ? "border-green-500 bg-green-50" : ""}>
               <div className="flex items-center gap-2">
                 {isSuccess && <CheckCircle className="h-5 w-5 text-green-600" />}
                 <AlertTitle>{isSuccess ? "Success!" : "Status"}</AlertTitle>
               </div>
               <AlertDescription>
                 {verificationStatus}
                 {countdown !== null && (
                   <div className="mt-2 font-semibold">
                     You are being redirected in {countdown} second{countdown !== 1 ? 's' : ''}...
                   </div>
                 )}
               </AlertDescription>
             </Alert>
          )}
          <div className="space-y-2">
            <p className="font-medium">Welcome, {user?.name || 'User'}.</p>
            <p className="text-sm text-muted-foreground">
              To continue, we need to verify your identity against your provided login details.
            </p>
          </div>
          
          <FileUploader files={files} onFilesChange={handleFileChange} disabled={isLoading || (!emailVerified && !emailVerificationSuccess)} />
          
          <Button onClick={handleVerification} disabled={isLoading || !hasFiles || (!emailVerified && !emailVerificationSuccess)} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Identity'
            )}
          </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}