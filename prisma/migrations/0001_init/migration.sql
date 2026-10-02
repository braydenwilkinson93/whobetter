-- CreateTable
CREATE TABLE "Matchup" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "audio" TEXT,
    "leftName" TEXT NOT NULL,
    "leftGif" TEXT NOT NULL,
    "rightName" TEXT NOT NULL,
    "rightGif" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Matchup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "matchupId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "actorHash" TEXT NOT NULL,
    "window" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Matchup_order_key" ON "Matchup"("order");

-- CreateIndex
CREATE INDEX "Matchup_order_idx" ON "Matchup"("order");

-- CreateIndex
CREATE INDEX "Vote_matchupId_idx" ON "Vote"("matchupId");

-- CreateIndex
CREATE INDEX "Vote_ipHash_createdAt_idx" ON "Vote"("ipHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_matchupId_deviceId_key" ON "Vote"("matchupId", "deviceId");

-- CreateIndex
CREATE INDEX "RateLimit_actorHash_window_idx" ON "RateLimit"("actorHash", "window");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_actorHash_window_key" ON "RateLimit"("actorHash", "window");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_matchupId_fkey" FOREIGN KEY ("matchupId") REFERENCES "Matchup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

