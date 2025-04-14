import { FC, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentDialog from '@/components/PaymentDialog';
import { useUser } from '@/context/UserContext';

const SubscriptionPage: FC = () => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>('pro');
  const { user } = useUser();

  const handleUpgradeClick = (planType: 'pro' | 'premium') => {
    setSelectedPlan(planType);
    setShowPaymentDialog(true);
  };

  return (
    <div className="py-8 px-6 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Subscription</h1>
        <p className="text-gray-400">Unlock premium features with a subscription</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-studio-darkerBlue rounded-lg p-6 border border-gray-800">
          <h2 className="text-white font-bold text-xl mb-2">Free</h2>
          <p className="text-3xl font-bold text-white mb-4">$0<span className="text-gray-400 text-sm font-normal">/month</span></p>
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">5 remixes per month</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Basic audio quality</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Limited genres</p>
            </div>
          </div>
          <Button 
            className="w-full bg-transparent border border-studio-neon text-studio-neon hover:bg-studio-neon/10"
            disabled={true}
          >
            Current Plan
          </Button>
        </div>
        
        <div className="bg-studio-darkerBlue rounded-lg p-6 border border-gray-800 relative">
          <div className="absolute -top-3 right-4 bg-studio-neon px-3 py-1 rounded-full text-black text-xs font-bold">
            POPULAR
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Pro</h2>
          <p className="text-3xl font-bold text-white mb-4">$9.99<span className="text-gray-400 text-sm font-normal">/month</span></p>
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Unlimited remixes</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">HD audio quality</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">All genres available</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Advanced BPM control</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Exclusive sound packs</p>
            </div>
          </div>
          <Button 
            className="w-full bg-studio-neon text-black hover:bg-studio-neon/90"
            onClick={() => handleUpgradeClick('pro')}
            disabled={user?.subscriptionType === 'pro'}
          >
            {user?.subscriptionType === 'pro' ? 'Current Plan' : 'Upgrade Now'}
          </Button>
        </div>
        
        <div className="bg-studio-darkerBlue rounded-lg p-6 border border-gray-800">
          <h2 className="text-white font-bold text-xl mb-2">Premium</h2>
          <p className="text-3xl font-bold text-white mb-4">$19.99<span className="text-gray-400 text-sm font-normal">/month</span></p>
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Everything in Pro</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Studio quality audio</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Priority processing</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Commercial usage rights</p>
            </div>
            <div className="flex items-start">
              <CheckCircle size={18} className="text-studio-neon mr-2 mt-0.5" />
              <p className="text-gray-300">Dedicated support</p>
            </div>
          </div>
          <Button 
            className="w-full bg-transparent border border-gray-500 text-white hover:bg-white/10"
            onClick={() => handleUpgradeClick('premium')}
            disabled={user?.subscriptionType === 'premium'}
          >
            {user?.subscriptionType === 'premium' ? 'Current Plan' : 'Upgrade Now'}
          </Button>
        </div>
      </div>

      <PaymentDialog 
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        planType={selectedPlan}
      />
    </div>
  );
};

export default SubscriptionPage;
