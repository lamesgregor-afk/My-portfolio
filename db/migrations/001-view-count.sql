-- Migration 001: Add view_count to works table
-- Run this in Neon SQL Editor: https://console.neon.tech → your project → SQL Editor

ALTER TABLE works ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
