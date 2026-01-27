-- Add performance indexes only (safe operation)

-- Category indexes
CREATE INDEX IF NOT EXISTS `idx_category_type` ON `category`(`type`);

-- Class indexes
CREATE INDEX IF NOT EXISTS `idx_class_status` ON `class`(`status`);
CREATE INDEX IF NOT EXISTS `idx_class_isActive` ON `class`(`isActive`);
CREATE INDEX IF NOT EXISTS `idx_class_schedule` ON `class`(`schedule`(100));

-- Media indexes
CREATE INDEX IF NOT EXISTS `idx_media_folder` ON `media`(`folder`);
CREATE INDEX IF NOT EXISTS `idx_media_createdAt` ON `media`(`createdAt`);

-- Message indexes
CREATE INDEX IF NOT EXISTS `idx_message_isRead` ON `message`(`isRead`);
CREATE INDEX IF NOT EXISTS `idx_message_createdAt` ON `message`(`createdAt`);

-- News indexes
CREATE INDEX IF NOT EXISTS `idx_news_status` ON `news`(`status`);
CREATE INDEX IF NOT EXISTS `idx_news_category` ON `news`(`category`);
CREATE INDEX IF NOT EXISTS `idx_news_publishDate` ON `news`(`publishDate`);
CREATE INDEX IF NOT EXISTS `idx_news_createdAt` ON `news`(`createdAt`);

-- Partnership indexes
CREATE INDEX IF NOT EXISTS `idx_partnership_type` ON `partnership`(`type`);
CREATE INDEX IF NOT EXISTS `idx_partnership_status` ON `partnership`(`status`);
CREATE INDEX IF NOT EXISTS `idx_partnership_createdAt` ON `partnership`(`createdAt`);

-- Product indexes
CREATE INDEX IF NOT EXISTS `idx_product_isAvailable` ON `product`(`isAvailable`);
CREATE INDEX IF NOT EXISTS `idx_product_createdAt` ON `product`(`createdAt`);

-- Schedule indexes
CREATE INDEX IF NOT EXISTS `idx_schedule_status` ON `schedule`(`status`);
CREATE INDEX IF NOT EXISTS `idx_schedule_date` ON `schedule`(`date`);

-- User indexes
CREATE INDEX IF NOT EXISTS `idx_user_role` ON `user`(`role`);
CREATE INDEX IF NOT EXISTS `idx_user_createdAt` ON `user`(`createdAt`);

-- Enrollment indexes (if table exists)
CREATE INDEX IF NOT EXISTS `idx_enrollment_status` ON `enrollment`(`status`);
CREATE INDEX IF NOT EXISTS `idx_enrollment_userId` ON `enrollment`(`userId`);
CREATE INDEX IF NOT EXISTS `idx_enrollment_classId` ON `enrollment`(`classId`);

-- ClassRegistration indexes
CREATE INDEX IF NOT EXISTS `idx_classregistration_status` ON `classregistration`(`status`);
CREATE INDEX IF NOT EXISTS `idx_classregistration_userId` ON `classregistration`(`userId`);
CREATE INDEX IF NOT EXISTS `idx_classregistration_classId` ON `classregistration`(`classId`);
CREATE INDEX IF NOT EXISTS `idx_classregistration_paymentStatus` ON `classregistration`(`paymentStatus`);

-- Notification indexes
CREATE INDEX IF NOT EXISTS `idx_notification_userId` ON `notification`(`userId`);
CREATE INDEX IF NOT EXISTS `idx_notification_target` ON `notification`(`target`);
CREATE INDEX IF NOT EXISTS `idx_notification_isRead` ON `notification`(`isRead`);