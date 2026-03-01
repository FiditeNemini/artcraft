import { Modal } from "@storyteller/ui-modal";
import { Button } from "@storyteller/ui-button";
import { faCoins } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { invoke } from "@tauri-apps/api/core";

interface CreditPack {
  id: string;
  total: number;
  base: number;
  bonus: number;
  priceUsd: number;
  badge?: string;
  priceId?: string;
}

const creditPacks: CreditPack[] = [
  { id: "artcraft_1000", total: 1000, base: 1000, bonus: 0, priceUsd: 10 },
  { id: "artcraft_2500", total: 2500, base: 2500, bonus: 0, priceUsd: 25 },
  { id: "artcraft_5000", total: 5000, base: 5000, bonus: 0, priceUsd: 50 },
  { id: "artcraft_10000", total: 10000, base: 10000, bonus: 0, priceUsd: 100 },
  //{ id: "artcraft_25000", total: 25000, base: 25000, bonus: 0, priceUsd: 250 },
  //{ id: "artcraft_50000", total: 50000, base: 50000, bonus: 0, priceUsd: 500 },
];

interface CreditsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onPurchase?: (pack: CreditPack) => void;
}

export function CreditsModal({
  isOpen = false,
  onClose,
  onPurchase,
}: CreditsModalProps) {
  const handlePurchase = async (pack: CreditPack) => {
    if (onPurchase) {
      onPurchase(pack);
      return;
    }

    await invoke("storyteller_open_credits_purchase_command", {
      request: {
        credits_pack: pack.id,
      },
    });

    // Hook up Stripe/checkout here
    // Example: redirect to checkout with pack.priceId
    // await stripe.redirectToCheckout({ lineItems: [{ price: pack.priceId, quantity: 1 }], mode: 'payment', ... })
    // For now, just log
    // eslint-disable-next-line no-console
    console.log("Purchasing credits pack", pack);
  };

  const cardBase =
    "relative rounded-xl border p-6 h-full flex flex-col justify-between bg-ui-controls/50 border-ui-controls-border hover:border-base-fg/20 hover:bg-ui-controls/80 transition-all overflow-hidden";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose ?? (() => {})}
      className="rounded-xl bg-ui-panel border border-ui-panel-border max-h-[90vh] max-w-5xl overflow-y-auto flex flex-col shadow-2xl"
      allowBackgroundInteraction={false}
      showClose={true}
      closeOnOutsideClick={true}
      resizable={false}
      backdropClassName="bg-black/80"
    >
      <div className="p-8 md:p-12 lg:p-16 flex-1 overflow-y-auto min-h-0">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-base-fg mb-4">
            Buy credits
          </h1>
          <p className="text-base-fg/60 text-lg">
            Choose a one-time credits package. No subscription required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {creditPacks.map((pack) => (
            <div key={pack.id} className={cardBase}>
              {pack.badge && (
                <div className="absolute -top-3 right-4 bg-primary text-primary-fg px-3 py-1 rounded-full text-xs font-bold shadow-xl">
                  {pack.badge}
                </div>
              )}

              <div>
                <div className="text-base-fg text-5xl font-bold tracking-tight flex items-center gap-2.5">
                  <FontAwesomeIcon
                    icon={faCoins}
                    className="text-primary text-3xl"
                  />
                  {pack.total.toLocaleString()}
                </div>
                {pack.bonus > 0 && (
                  <div className="text-base-fg/60 text-sm mt-2">
                    Total: {pack.base.toLocaleString()} {" + "}
                    <span className="text-primary font-bold">
                      {pack.bonus.toLocaleString()} Bonus
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6">
                <div className="text-base-fg text-2xl font-bold opacity-60">
                  ${pack.priceUsd}
                </div>
                <Button
                  variant="primary"
                  onClick={() => handlePurchase(pack)}
                  className="px-6 h-10 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Purchase
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default CreditsModal;
