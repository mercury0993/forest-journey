CREATE TABLE "invite_code_users" (
    "id" TEXT NOT NULL,
    "invite_code_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invite_code_users_pkey" PRIMARY KEY ("id")
);
