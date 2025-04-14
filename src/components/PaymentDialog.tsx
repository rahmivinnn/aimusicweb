import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { CreditCard } from 'lucide-react';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'pro' | 'premium';
}

const PaymentDialog: FC<PaymentDialogProps> = ({ isOpen, onClose, planType }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { updateUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardNumber || !expiryDate || !cvv) {
      toast({
        title: "Missing fields",
        description: "Please fill in all card details",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update user status to pro
      updateUser({
        subscriptionType: planType,
        subscriptionActive: true
      });

      toast({
        title: "Payment Successful!",
        description: `Your account has been upgraded to ${planType} successfully!`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-studio-darkerBlue text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Upgrade to {planType.charAt(0).toUpperCase() + planType.slice(1)}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your card details to complete the upgrade
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="cardNumber" className="text-sm font-medium text-gray-300">
              Card Number
            </label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              className="bg-studio-dark border-gray-700 text-white"
              maxLength={16}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="expiryDate" className="text-sm font-medium text-gray-300">
                Expiry Date
              </label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-studio-dark border-gray-700 text-white"
                maxLength={5}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cvv" className="text-sm font-medium text-gray-300">
                CVV
              </label>
              <Input
                id="cvv"
                type="password"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                className="bg-studio-dark border-gray-700 text-white"
                maxLength={3}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-studio-neon hover:bg-studio-neon/90 text-black"
            disabled={processing}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {processing ? 'Processing...' : 'Pay & Upgrade'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog; 