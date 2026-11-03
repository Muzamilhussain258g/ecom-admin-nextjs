import { MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OrderShipping } from "@/features/orders/types";

export function ShippingAddress({ shipping }: { shipping: OrderShipping }) {
  const phone = shipping.shippingPhone.trim();
  const dialNumber = phone.replace(/[\s().-]/g, "");
  const canCall = /^\+?\d+$/.test(dialNumber);

  return (
    <section aria-label="Shipping address" className="min-w-0">
      <Card className="gap-4 shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 border-b pb-4">
          <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-sm font-semibold">Shipping address</h3>
        </CardHeader>
        <CardContent>
          <address className="space-y-4 text-sm not-italic">
            <p className="break-words font-semibold">{shipping.shippingFullName || "Recipient not provided"}</p>
            <div className="break-words leading-6 text-muted-foreground">
              <p className="whitespace-pre-line">{shipping.shippingStreet || "Street not provided"}</p>
              <p>{[shipping.shippingCity, shipping.shippingProvince].filter(Boolean).join(", ")}</p>
              <p>{[shipping.shippingCountry, shipping.shippingPostalCode].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="flex items-start gap-2 border-t pt-4">
              <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {canCall ? <a href={`tel:${dialNumber}`} className="break-all rounded-sm font-medium tabular-nums underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">{phone}</a>
                : <span className="break-words">{phone || "Phone not provided"}</span>}
            </div>
          </address>
        </CardContent>
      </Card>
    </section>
  );
}
