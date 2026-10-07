-- These tables are accessed through the server's guarded Prisma API only.
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MenuCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MenuVariant" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."User", public."MenuCategory", public."MenuItem", public."MenuVariant" FROM anon, authenticated;
