-- Application tables and kiosk orders are accessed only by server-side code.
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MenuCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MenuVariant" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."User", public."MenuCategory", public."MenuItem", public."MenuVariant" FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public."KioskOrder" (
  id uuid PRIMARY KEY,
  "requestId" uuid NOT NULL UNIQUE,
  "orderNumber" bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  "totalCentavos" integer NOT NULL CHECK ("totalCentavos" >= 0),
  status text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'preparing', 'ready', 'completed', 'cancelled')),
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."KioskOrderItem" (
  id uuid PRIMARY KEY,
  "orderId" uuid NOT NULL REFERENCES public."KioskOrder"(id) ON DELETE CASCADE,
  "itemId" text NOT NULL,
  "itemName" text NOT NULL,
  "itemType" text NOT NULL CHECK ("itemType" IN ('beverage', 'food', 'addon')),
  "variantId" text NOT NULL,
  "variantLabel" text NOT NULL,
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  "unitPriceCentavos" integer NOT NULL CHECK ("unitPriceCentavos" >= 0),
  "lineTotalCentavos" integer NOT NULL CHECK ("lineTotalCentavos" >= 0)
);

-- Additive columns for table ordering; safe to re-run against tables created above.
ALTER TABLE public."KioskOrder"
  ADD COLUMN IF NOT EXISTS "orderType" text NOT NULL DEFAULT 'dine_in' CHECK ("orderType" IN ('dine_in', 'takeout')),
  ADD COLUMN IF NOT EXISTS "tableNumber" integer CHECK ("tableNumber" BETWEEN 1 AND 99),
  ADD COLUMN IF NOT EXISTS "paymentMethod" text NOT NULL DEFAULT 'counter' CHECK ("paymentMethod" IN ('counter', 'online'));

-- Add-ons are child rows of the drink they belong to; "position" keeps cart order.
ALTER TABLE public."KioskOrderItem"
  ADD COLUMN IF NOT EXISTS "parentItemId" uuid REFERENCES public."KioskOrderItem"(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS "position" integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "KioskOrder_createdAt_idx" ON public."KioskOrder" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "KioskOrderItem_orderId_idx" ON public."KioskOrderItem" ("orderId");

ALTER TABLE public."KioskOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."KioskOrderItem" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."KioskOrder", public."KioskOrderItem" FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public."KioskOrder_orderNumber_seq" FROM anon, authenticated;
