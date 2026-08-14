-- CreateIndex
CREATE INDEX "Card_due_idx" ON "Card"("due");

-- CreateIndex
CREATE INDEX "Card_level_idx" ON "Card"("level");

-- CreateIndex
CREATE INDEX "Card_type_idx" ON "Card"("type");

-- CreateIndex
CREATE INDEX "ReviewLog_reviewedAt_idx" ON "ReviewLog"("reviewedAt");

-- CreateIndex
CREATE INDEX "ReviewLog_cardId_idx" ON "ReviewLog"("cardId");
