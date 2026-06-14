CREATE TABLE "role_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "empathy" INTEGER NOT NULL,
    "rule" INTEGER NOT NULL,
    "resilience" INTEGER NOT NULL,
    "role" INTEGER NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_models_pkey" PRIMARY KEY ("id")
);
