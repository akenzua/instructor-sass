'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLearnerAuth } from '@/lib/auth';
import { authApi, paymentsApi } from '@/lib/api';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({
  clientSecret,
  paymentIntentId,
  amount,
  onSuccess,
}: {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pay/success`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else {
      // Confirm payment with backend to update DB status
      try {
        await paymentsApi.confirmPayment(paymentIntentId);
        // Invalidate queries to refetch fresh data
        await queryClient.invalidateQueries({ queryKey: ['learner'] });
      } catch (err) {
        console.error('Failed to confirm payment on backend:', err);
      }

      toast({
        title: 'Payment successful!',
        status: 'success',
        duration: 3000,
      });
      onSuccess();
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Box p={4} bg="primary.50" borderRadius="lg" _dark={{ bg: 'primary.900' }}>
          <Text fontSize="sm" color="text.muted">
            Amount to pay
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="primary.500">
            {formatCurrency(amount)}
          </Text>
        </Box>

        <PaymentElement />

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="primary"
          size="lg"
          isLoading={isProcessing}
          loadingText="Processing..."
          isDisabled={!stripe || !elements}
        >
          Pay Now
        </Button>
      </VStack>
    </form>
  );
}

function PaymentSuccess() {
  const router = useRouter();

  return (
    <VStack spacing={6} textAlign="center" py={8}>
      <Box
        p={4}
        bg="green.100"
        borderRadius="full"
        color="green.500"
        _dark={{ bg: 'green.900', color: 'green.200' }}
      >
        <CheckCircle size={48} />
      </Box>
      <VStack spacing={2}>
        <Heading size="md">Payment Successful!</Heading>
        <Text color="text.muted">Your payment has been processed successfully.</Text>
      </VStack>
      <Button colorScheme="primary" onClick={() => router.push('/')}>
        Back to Home
      </Button>
    </VStack>
  );
}

export default function PayPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, isLoading: authLoading, learner } = useLearnerAuth();

  const [customAmount, setCustomAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Get learner profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['learner', 'profile'],
    queryFn: authApi.me,
    enabled: isAuthenticated,
  });

  // Create payment intent mutation
  const createIntentMutation = useMutation({
    mutationFn: (amount: number) => paymentsApi.createPaymentIntent(amount),
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.',
        status: 'error',
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const balance = profile?.balance ?? learner?.balance ?? 0;
  const owedAmount = Math.abs(Math.min(balance, 0));

  const handleProceedToPayment = () => {
    const amount = customAmount ? parseFloat(customAmount) : owedAmount;

    if (!amount || amount <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }

    if (amount < 1) {
      setAmountError('Minimum payment is $1.00');
      return;
    }

    setAmountError('');
    // Convert to cents for Stripe
    createIntentMutation.mutate(Math.round(amount * 100));
  };

  if (authLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="400px" />
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box minH="100vh" bg="bg.subtle">
      {/* Header */}
      <Box bg="bg.surface" borderBottom="1px solid" borderColor="border.subtle" px={6} py={4}>
        <HStack maxW="container.md" mx="auto">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push('/')}
          >
            Back
          </Button>
        </HStack>
      </Box>

      {/* Content */}
      <Box maxW="container.sm" mx="auto" p={6}>
        <Card>
          <CardBody p={8}>
            {paymentSuccess ? (
              <PaymentSuccess />
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <VStack spacing={6} align="stretch">
                  <HStack spacing={3}>
                    <Box p={2} bg="primary.100" borderRadius="lg" color="primary.500">
                      <CreditCard size={24} />
                    </Box>
                    <Heading size="md">Complete Payment</Heading>
                  </HStack>

                  <PaymentForm
                    clientSecret={clientSecret}
                    paymentIntentId={paymentIntentId!}
                    amount={
                      customAmount
                        ? Math.round(parseFloat(customAmount) * 100)
                        : Math.round(owedAmount * 100)
                    }
                    onSuccess={() => setPaymentSuccess(true)}
                  />

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setClientSecret(null);
                      setPaymentIntentId(null);
                      setCustomAmount('');
                    }}
                  >
                    Change Amount
                  </Button>
                </VStack>
              </Elements>
            ) : (
              <VStack spacing={6} align="stretch">
                <HStack spacing={3}>
                  <Box p={2} bg="primary.100" borderRadius="lg" color="primary.500">
                    <CreditCard size={24} />
                  </Box>
                  <Heading size="md">Make a Payment</Heading>
                </HStack>

                {profileLoading ? (
                  <Skeleton height="100px" />
                ) : (
                  <>
                    {owedAmount > 0 && (
                      <Box p={4} bg="red.50" borderRadius="lg" _dark={{ bg: 'red.900' }}>
                        <Text fontSize="sm" color="text.muted">
                          Outstanding Balance
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="red.500">
                          {formatCurrency(owedAmount)}
                        </Text>
                      </Box>
                    )}

                    <FormControl isInvalid={!!amountError}>
                      <FormLabel>Payment Amount</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none" color="text.muted">
                          $
                        </InputLeftElement>
                        <Input
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder={owedAmount > 0 ? owedAmount.toFixed(2) : '0.00'}
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </InputGroup>
                      <FormErrorMessage>{amountError}</FormErrorMessage>
                      {owedAmount > 0 && !customAmount && (
                        <Text fontSize="xs" color="text.muted" mt={1}>
                          Leave blank to pay full balance
                        </Text>
                      )}
                    </FormControl>

                    <Button
                      colorScheme="primary"
                      size="lg"
                      onClick={handleProceedToPayment}
                      isLoading={createIntentMutation.isPending}
                      isDisabled={owedAmount === 0 && !customAmount}
                    >
                      Continue to Payment
                    </Button>

                    {owedAmount === 0 && !customAmount && (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <AlertDescription>
                          You have no outstanding balance. Enter an amount to add credit to your
                          account.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">
                        Demo Mode: Use card number 4242 4242 4242 4242 with any future expiry and
                        CVC.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </VStack>
            )}
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
