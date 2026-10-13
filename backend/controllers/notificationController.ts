import type { Request, Response } from "express";
import db from "../config/database";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [rows] = await db.execute(
      `SELECT id, user_id, type, title, message, entity_type, entity_id, is_read, created_at, read_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      notifications: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi",
    });
  }
};

export const getUnreadNotificationCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId]
    );
    const unreadCount = (rows as any[])[0]?.unread_count ?? 0;

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghitung notifikasi belum dibaca",
    });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const [existingRows] = await db.execute(
      "SELECT id, is_read FROM notifications WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    const notification = (existingRows as any[])[0];

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    if (notification.is_read === 0 || notification.is_read === false) {
      await db.execute(
        "UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
        [id, userId]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Notifikasi ditandai sudah dibaca",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal menandai notifikasi",
    });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [result] = await db.execute(
      "UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = 0",
      [userId]
    );
    const marked = (result as any)?.affectedRows ?? 0;

    return res.status(200).json({
      success: true,
      message: "Semua notifikasi ditandai sudah dibaca",
      marked,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal menandai semua notifikasi",
    });
  }
};
