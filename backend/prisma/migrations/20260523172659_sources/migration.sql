-- CreateTable
CREATE TABLE "Sources" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Sources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sources" ADD CONSTRAINT "Sources_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
